# Flask application:
from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
import pandas as pd
import pickle

# MongoDB connection
client = MongoClient("localhost", 27017)
db = client["apan5400"]
collection = db["caffeine_content"]

# Load trained models
model_hr = pickle.load(open("models/model_hr.pkl", "rb"))
model_sleep = pickle.load(open("models/model_sleep.pkl", "rb"))
feature_cols = pickle.load(open("models/feature_cols.pkl", "rb"))

# Utility functions
def calculate_caffeine(caffeine_mg, original_ml, user_ml, cups):
    return float(caffeine_mg) / float(original_ml) * float(user_ml) * float(cups)

def recommended_limit(age, bmi, gender):
    limit = 400.0
    if age < 18:
        limit = 100.0
    elif age > 60:
        limit *= 0.9
    if str(gender).lower() == "female":
        limit *= 0.95
    if bmi < 18.5 or bmi > 30:
        limit *= 0.95
    return round(limit, 1)

# Flask app
app = Flask(__name__)

@app.route("/drinks")
def drinks():
    items = list(collection.find({}, {"_id": 0}))
    return jsonify(items)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True) or {}

        age = float(data["age"])
        bmi = float(data["bmi"])
        gender = data["gender"]
        stress = data["stress"]
        drink_name = data["drink"].strip()
        volume_ml = float(data["volume_ml"])
        cups = float(data["cups"])

        drink = collection.find_one({"drink": drink_name})
        if not drink:
            return jsonify({"error": "Drink not found"}), 400

        caffeine = calculate_caffeine(
            drink["Caffeine (mg)"],
            drink["Volume (ml)"],
            volume_ml,
            cups
        )

        row = {col: 0.0 for col in feature_cols}
        row["Caffeine_mg"] = caffeine
        row["Age"] = age
        row["BMI"] = bmi

        if f"Gender_{gender}" in feature_cols:
            row[f"Gender_{gender}"] = 1.0
        if f"Stress_Level_{stress}" in feature_cols:
            row[f"Stress_Level_{stress}"] = 1.0

        X_input = pd.DataFrame([row])[feature_cols]

        hr_pred = float(model_hr.predict(X_input)[0])
        sleep_pred = float(model_sleep.predict(X_input)[0])

        limit = recommended_limit(age, bmi, gender)
        ratio = caffeine / limit

        if stress.lower() == "high":
            ratio *= 1.2
        elif stress.lower() == "medium":
            ratio *= 1.05

        risk = "Low" if ratio < 0.5 else "Medium" if ratio < 1.0 else "High"

        return jsonify({
            "caffeine_intake_mg": round(caffeine, 1),
            "predicted_heart_rate": round(hr_pred, 1),
            "predicted_sleep_hours": round(sleep_pred, 2),
            "recommended_limit": limit,
            "risk_level": risk,
            "ratio": round(ratio, 2)
        })

    except Exception as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

@app.route("/risky_drinks")
def risky_drinks():
    risky = list(collection.find({"Caffeine_mg": {"$gt": 400}}, {"_id": 0, "Drink": 1, "Caffeine_mg": 1}))
    return jsonify(risky)

@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/")
def root():
    return "Caffeine Prediction API is running! Visit /home for the UI."

if __name__ == "__main__":
    print("➡️ Open: http://127.0.0.1:5000/home")
    app.run(debug=True)
