# FOODWISE 🥖

AI-powered sales forecasting and food surplus prediction for bakery stores.

FOODWISE predicts daily store sales from weather and calendar data, classifies the
risk of over-ordering (surplus), and generates a plain-language recommendation for
the store manager — using a locally-run open-source language model, with no paid
API required.

**Live demo:** [add your Streamlit Cloud URL here]

---

## What it does

1. **Predicts expected sales** for a given store and date using a Gradient Boosting
   regression model trained on historical sales, weather, and calendar features.
2. **Classifies surplus risk** (Low / Moderate / High) by comparing predicted demand
   against a planned order quantity.
3. **Generates a recommendation** in plain language using a local, open-source
   FLAN-T5 model — runs entirely offline after the first model download, no API
   key or account needed.

---

## Project background

The model was trained on ~5,100 rows of store-level sales data (July 2022–November
2023) across 9 stores, using weather (temperature, sunshine, precipitation) and
calendar features (holidays, day of week, season). Target-leakage columns (actual
order/unsold quantities) were explicitly excluded from training.

**Model comparison (validation set):**

| Model | MAE | RMSE | R² |
|---|---|---|---|
| Random Forest | 0.28 | 0.39 | 0.77 |
| **Gradient Boosting (final)** | **0.25** | **0.34** | **0.83** |

## Known limitation — please read before relying on live predictions

Testing against a genuinely future hold-out period (Dec 2023–May 2024, never seen
during training) showed accuracy drops sharply (R² turns negative) due to a real
shift in average demand between the training and later periods. This was confirmed
through direct experimentation — including testing and ruling out a `year`-feature
extrapolation hypothesis — not assumed.

**Practical implication:** this model is reliable for near-term forecasting on
dates similar in season/context to the training window, and is a working
demonstration of a full forecasting-to-recommendation pipeline. It is **not**
currently validated for live production ordering decisions on today's/future real
dates without periodic retraining on recent data. See [Future Work](#future-work).

---

## Project structure

```
foodwise-app/
├── app.py                  # Streamlit application
├── train_model.py          # Retrains and saves foodwise_model.joblib
├── foodwise_model.joblib   # Pre-trained model (regenerate locally if needed)
├── requirements.txt        # Python dependencies
└── README.md
```

---

## Setup & running locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/foodwise-app.git
cd foodwise-app

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python -m streamlit run app.py
```

The first time you enable "Write an AI recommendation," it downloads the FLAN-T5-base
model (~1GB) from Hugging Face and caches it locally — after that it runs offline.

### Regenerating the model

`foodwise_model.joblib` is version-sensitive to scikit-learn. If you hit a loading
error, retrain it locally so it matches your installed version:

```bash
# requires train.csv in the same folder (not included in this repo — see Data below)
python train_model.py
```

---

## Tech stack

- **scikit-learn** — Gradient Boosting Regressor, preprocessing pipeline
- **Streamlit** — web application interface
- **Hugging Face Transformers + PyTorch** — local FLAN-T5 text generation
- **Pandas / NumPy** — data handling

---

## Data

The training dataset (`train.csv`) is not included in this repository. The app ships
with a pre-trained model (`foodwise_model.joblib`); use `train_model.py` if you need
to retrain on your own data with the same schema:

`date, store, is_state_holiday, is_school_holiday, is_special_day, temperature_max, temperature_min, temperature_mean, sunshine_sum, precipitation_sum, sales, unsold, ordered`

---

## Future Work

- **Periodic retraining** on a rolling window of recent real sales data to correct
  for demand drift and keep predictions reliable for live use
- **Drift monitoring** — track live prediction error and trigger retraining when it
  degrades
- **Live weather API integration** instead of manual entry
- **Larger generative model** for more nuanced recommendations
- **Raw-unit predictions** (e.g. loaves) if original, non-standardized data becomes
  available
- **Multi-store batch planning** view

---

