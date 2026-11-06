let drinksList = [];
let historyChart = null;

// UCL load:
window.addEventListener("load", async () => {
    // List of beverage type:
    try {
        const resp = await fetch("/drinks");
        drinksList = await resp.json();
    } catch (e) {
        console.error("Failed to load drinks:", e);
    }

    // Theme:
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        document.getElementById("themeToggle").textContent = "☀️";
    }

    initSearchDropdown();
    initThemeToggle();
    renderHistory();
    renderHistoryChart();
});

// Scoring for seaching type of drinks:

function initSearchDropdown() {
    const inputBox  = document.getElementById("drinkInput");
    const resultBox = document.getElementById("drinkDropdown");
    const metaBox   = document.getElementById("drinkMeta");

    inputBox.addEventListener("input", function () {
        const keyword = this.value.toLowerCase().trim();

        metaBox.textContent = "";
        if (!keyword) {
            resultBox.style.display = "none";
            resultBox.innerHTML = "";
            return;
        }

        const filtered = drinksList.filter(item =>
            item.drink.toLowerCase().includes(keyword)
        );

        resultBox.innerHTML = "";
        filtered.forEach(item => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = item.drink;
            div.addEventListener("click", () => {
                inputBox.value = item.drink;
                showDrinkMeta(item);
                resultBox.style.display = "none";
            });
            resultBox.appendChild(div);
        });

        resultBox.style.display = filtered.length ? "block" : "none";
    });

    // Click white space to close:
    document.addEventListener("click", (e) => {
        if (e.target !== inputBox && !resultBox.contains(e.target)) {
            resultBox.style.display = "none";
        }
    });
}

function showDrinkMeta(drinkObj) {
    const metaBox = document.getElementById("drinkMeta");
    if (!drinkObj) {
        metaBox.textContent = "";
        return;
    }

    const mgPerMl = drinkObj.mg_per_ml || (drinkObj["Caffeine (mg)"] / drinkObj["Volume (ml)"]);
    const category = detectDrinkCategory(drinkObj.drink);

    metaBox.textContent = `${category} · approx. ${mgPerMl.toFixed(2)} mg/ml caffeine`;
}

function detectDrinkCategory(name) {
    const lower = name.toLowerCase();
    if (lower.includes("latte") || lower.includes("cappuccino") || lower.includes("macchiato")) {
        return "Espresso-based milk drink";
    }
    if (lower.includes("espresso") || lower.includes("ristretto")) {
        return "Straight espresso drink";
    }
    if (lower.includes("cold brew") || lower.includes("brewed") || lower.includes("drip")) {
        return "Brewed coffee";
    }
    if (lower.includes("monster") || lower.includes("red bull") || lower.includes("energy")) {
        return "Energy drink";
    }
    if (lower.includes("tea")) {
        return "Tea / tea-based drink";
    }
    return "Coffee / caffeinated beverage";
}

// Change theme:

function initThemeToggle() {
    const btn = document.getElementById("themeToggle");
    btn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");
        btn.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("theme", isDark ? "dark" : "light");
        // Color change:
        if (historyChart) {
            historyChart.destroy();
            renderHistoryChart();
        }
    });
}

// Logic of Prediction:

async function predict() {
    const age    = parseFloat(document.getElementById("age").value);
    const bmi    = parseFloat(document.getElementById("bmi").value);
    const gender = document.getElementById("gender").value;
    const stress = document.getElementById("stress").value;
    const drink  = document.getElementById("drinkInput").value.trim();
    const volume = parseFloat(document.getElementById("volume").value);
    const cups   = parseFloat(document.getElementById("cups").value);

    const errorBox = document.getElementById("error");
    if (!age || !bmi || !drink || !volume || !cups) {
        errorBox.textContent = "Please fill in Age, BMI, Coffee Drink, Volume and Cups.";
        return;
    } else {
        errorBox.textContent = "";
    }

    const payload = {
        age: age,
        gender: gender,
        bmi: bmi,
        stress: stress,
        drink: drink,
        volume_ml: volume,
        cups: cups
    };

    // Loading:
    setPredictLoading(true);

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            errorBox.textContent = result.error || "Prediction failed.";
            setPredictLoading(false);
            return;
        }

        showResult(payload, result);
        saveHistory(payload, result);
        renderHistory();
        renderHistoryChart();
    } catch (e) {
        console.error(e);
        errorBox.textContent = "Network error, please try again.";
    } finally {
        setPredictLoading(false);
    }
}

function setPredictLoading(isLoading) {
    const textSpan = document.getElementById("predictBtnText");
    const loader   = document.getElementById("predictBtnLoading");
    const btn      = document.getElementById("predictBtn");

    if (isLoading) {
        textSpan.textContent = "Predicting...";
        loader.hidden = false;
        btn.disabled = true;
        btn.style.opacity = "0.8";
    } else {
        textSpan.textContent = "Predict";
        loader.hidden = true;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

// Output + Suggestion:
function showResult(input, result) {
    const card = document.getElementById("resultCard");

    const caffeine = result.caffeine_intake_mg;
    const limit    = result.recommended_limit;
    const ratio    = result.ratio;  // 0.x
    const risk     = result.risk_level;

    document.getElementById("resCaffeine").textContent  = `${caffeine} mg`;
    document.getElementById("resHeartRate").textContent = `${result.predicted_heart_rate} bpm`;
    document.getElementById("resSleep").textContent     = `${result.predicted_sleep_hours} hours`;
    document.getElementById("resLimit").textContent     = `${limit} mg`;

    const percent = Math.round(ratio * 100);
    document.getElementById("resSummary").textContent =
        `Today's intake is about ${percent}% of your personalized daily limit.`;

    const gaugeFill = document.getElementById("gaugeFill");
    const riskTag   = document.getElementById("riskTag");

    const widthPercent = Math.max(0, Math.min(100, percent));
    gaugeFill.style.width = widthPercent + "%";

    riskTag.classList.remove("risk-low", "risk-medium", "risk-high");
    if (risk === "Low") {
        riskTag.classList.add("risk-low");
        riskTag.textContent = "Risk level: Low — your intake is within a comfortable range.";
    } else if (risk === "Medium") {
        riskTag.classList.add("risk-medium");
        riskTag.textContent = "Risk level: Medium — keep an eye on your total caffeine today.";
    } else {
        riskTag.classList.add("risk-high");
        riskTag.textContent = "Risk level: High — consider reducing caffeine or switching to a lighter drink.";
    }

    // Healthy suggestions:
    const insight = buildHealthInsight(input, result);
    document.getElementById("healthInsight").textContent = insight;

    card.style.display = "block";
    card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildHealthInsight(input, result) {
    const ratio  = result.ratio;
    const risk   = result.risk_level;
    const stress = input.stress.toLowerCase();
    const sleep  = result.predicted_sleep_hours;

    let parts = [];

    if (ratio < 0.5) {
        parts.push("Your caffeine intake is well below your recommended limit for today.");
    } else if (ratio < 1.0) {
        parts.push("Your caffeine intake is getting closer to your daily limit.");
    } else {
        parts.push("Your caffeine intake is above the recommended range for today.");
    }

    if (risk === "High") {
        parts.push("You may want to reduce additional caffeine for the rest of the day.");
    } else if (risk === "Medium") {
        parts.push("Try to avoid adding more high-caffeine drinks in the next few hours.");
    }

    if (sleep < 6) {
        parts.push("The model suggests your sleep duration may be shortened, so consider earlier cut-off time for caffeine.");
    }

    if (stress === "high") {
        parts.push("Because your stress level is high, your body may be more sensitive to caffeine.");
    }

    if (!parts.length) {
        parts.push("Your current intake looks reasonable based on the model.");
    }

    return parts.join(" ");
}

// History + Figure:

function saveHistory(input, result) {
    try {
        const key = "caffeineHistory";
        let list = [];
        const existing = localStorage.getItem(key);
        if (existing) {
            list = JSON.parse(existing);
        }

        list.unshift({
            time: new Date().toLocaleString(),
            drink: input.drink,
            caffeine: result.caffeine_intake_mg,
            limit: result.recommended_limit,
            risk: result.risk_level
        });

        list = list.slice(0, 7);
        localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
        console.warn("History not saved:", e);
    }
}

function renderHistory() {
    const container = document.getElementById("history");
    const key = "caffeineHistory";
    const existing = localStorage.getItem(key);

    if (!existing) {
        container.innerHTML = "<div class='history-title'>No records yet. Predict once to see your history here.</div>";
        return;
    }

    const list = JSON.parse(existing);
    if (!list.length) {
        container.innerHTML = "<div class='history-title'>No records yet. Predict once to see your history here.</div>";
        return;
    }

    let html = `<div class="history-title">Recent Intakes</div>`;
    list.forEach(item => {
        html += `
            <div class="history-item">
                ${item.time} — ${item.drink} · ${item.caffeine} mg 
                (limit: ${item.limit} mg, risk: ${item.risk})
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderHistoryChart() {
    const ctx = document.getElementById("historyChart");
    const note = document.getElementById("chartNote");
    if (!ctx) return;

    const key = "caffeineHistory";
    const existing = localStorage.getItem(key);
    if (!existing) {
        if (note) note.textContent = "No history yet. Predictions will appear on this chart.";
        if (historyChart) {
            historyChart.destroy();
            historyChart = null;
        }
        return;
    }

    const list = JSON.parse(existing);
    if (!list.length) {
        if (note) note.textContent = "No history yet. Predictions will appear on this chart.";
        if (historyChart) {
            historyChart.destroy();
            historyChart = null;
        }
        return;
    }

    const labels   = list.map((item, idx) => `${idx + 1}`);
    const caffeine = list.map(item => item.caffeine);
    const limits   = list.map(item => item.limit);

    if (note) {
        note.textContent = "Each point represents one of your recent intakes. The blue line is your intake; the gray line is your personalized limit.";
    }

    if (historyChart) {
        historyChart.destroy();
    }

    historyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    label: "Caffeine intake (mg)",
                    data: caffeine.reverse(),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3
                },
                {
                    label: "Recommended limit (mg)",
                    data: limits.reverse(),
                    borderColor: "#9ca3af",
                    borderDash: [4, 4],
                    fill: false,
                    tension: 0.25,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 14,
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: false }
                },
                y: {
                    title: {
                        display: true,
                        text: "mg"
                    },
                    beginAtZero: true
                }
            }
        }
    });
}