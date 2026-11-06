# Caffeine Health Predictor ☕

**Machine Learning | Flask | Web Application | Data Analytics**

## Project Overview

Caffeine Health Predictor is a machine learning-based web application designed to explore the potential relationships between caffeine consumption, heart rate, and sleep.

The application combines predictive modeling with an interactive web interface, allowing users to enter personal characteristics and beverage consumption information to receive personalized estimates and insights.

This project demonstrates the integration of data analytics, machine learning, backend development, and frontend design into a functional web application.

---

## Key Features

### 1. Personalized Caffeine Intake Analysis

Users can enter their personal information and caffeine consumption habits, including:

- Age and gender
- Body Mass Index (BMI)
- Stress level
- Coffee or caffeinated beverage selection
- Beverage volume and number of cups

The application calculates estimated caffeine intake based on the selected beverage and consumption amount.

### 2. Machine Learning Predictions

The application uses trained machine learning models to generate estimates of:

- **Heart Rate:** Predicted heart rate based on user characteristics and caffeine consumption.
- **Sleep Duration:** Predicted sleep duration based on the same input information.

These predictions are intended for educational and exploratory purposes rather than clinical assessment.

### 3. Personalized Caffeine Insights

The application provides:

- Estimated daily caffeine intake
- A personalized daily intake limit based on predefined rules
- Caffeine intake risk indicators
- General health-related insights

The recommended intake limits are rule-based estimates and should not be interpreted as medically validated individual safety thresholds.

### 4. Interactive Dashboard

The web interface includes:

- User-friendly input forms
- Searchable beverage selection
- Interactive prediction results
- Caffeine intake visualization
- Recent intake history
- Light and dark display modes

---

## Technical Architecture

The application follows a frontend-backend architecture.

**Frontend**
- HTML for page structure
- CSS for styling and responsive layouts
- JavaScript for user interactions and API requests
- Chart.js for data visualization

**Backend**
- Python and Flask for application development
- REST-style API endpoints for beverage retrieval and predictions
- Pandas for data processing
- Pretrained machine learning models for prediction

**Database**
- MongoDB for storing and retrieving beverage caffeine information

### Application Workflow

1. Users enter their personal characteristics and beverage consumption information.
2. JavaScript sends the input data to the Flask backend.
3. The backend retrieves relevant beverage information and calculates caffeine intake.
4. User inputs are processed into the features required by the trained models.
5. Machine learning models generate heart rate and sleep predictions.
6. The application returns prediction results and caffeine-related insights.
7. The frontend displays the results through an interactive dashboard.

---

## Machine Learning

### Data Processing and Model Development

The project includes a Jupyter Notebook documenting the data analysis and model development process.

The application uses two saved prediction models:

| Model | Prediction Target |
|---|---|
| Heart Rate Model | Estimated heart rate |
| Sleep Model | Estimated sleep duration |

The trained models are loaded by the Flask backend to generate predictions from user inputs.

The application also uses a saved feature list to maintain consistency between model inputs and the features used during training.

### Model Integration

The backend loads the trained models and processes user inputs before generating predictions.

This demonstrates how machine learning models can be integrated into a user-facing application rather than remaining solely in a research notebook.

---

## Technologies Used

| Category | Technologies |
|---|---|
| Programming | Python, JavaScript |
| Data Analysis | Pandas, Jupyter Notebook |
| Machine Learning | Predictive Modeling |
| Backend | Flask |
| Frontend | HTML, CSS, JavaScript |
| Database | MongoDB |
| Visualization | Chart.js |
| Model Storage | Pickle |

---

## Repository Structure

```text
Caffeine-Health-Predictor/
│
├── project.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── notebooks/
│   └── APAN5400_Project.ipynb
│
├── models/
│   └── feature_cols.pkl
│
└── README.md
```

---

## Running the Application

### 1. Clone the Repository

```bash
git clone https://github.com/caseyyin1117-svg/Caffeine-Health-Predictor.git
cd Caffeine-Health-Predictor
```

### 2. Install Dependencies

The application requires Python and the following libraries:

```bash
pip install flask pandas pymongo scikit-learn
```

Additional dependencies may be required depending on the saved models and the model-training environment.

### 3. Configure MongoDB

The application uses a local MongoDB instance.

The current backend expects:

- MongoDB running on `localhost:27017`
- Database: `apan5400`
- Collection: `caffeine_content`

The beverage database must be configured and populated before the full application can operate.

### 4. Prepare the Machine Learning Models

The Flask backend requires the following files in the `models/` directory:

```text
models/
├── model_hr.pkl
├── model_sleep.pkl
└── feature_cols.pkl
```

The heart rate and sleep prediction models are not included in this repository due to their large file sizes.

They must be generated or provided separately before running the complete application.

### 5. Run the Flask Application

Once the database and model dependencies are configured:

```bash
python project.py
```

Open the local address displayed by Flask in your browser.

**Note:** The current repository documents the application implementation but does not include all dependencies required for immediate execution.

---

## Limitations

- Model predictions depend on the training data and modeling assumptions.
- Individual responses to caffeine vary and may not be fully captured by the available features.
- The application uses simplified rules to estimate caffeine intake limits.
- The current implementation requires local MongoDB configuration and separately stored prediction models.
- The application has not been clinically validated.

**Disclaimer:** This project is intended for educational and exploratory purposes only. It does not provide medical diagnoses or professional health advice.

---

## Acknowledgments

This project was developed as part of academic coursework at Columbia University.

It demonstrates the practical application of data analytics, predictive modeling, and web development to an interactive health-related application.
