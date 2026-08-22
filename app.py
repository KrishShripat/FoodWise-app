"""
FOODWISE — Sales & Surplus Prediction with AI-Generated Recommendations

Run locally:
    streamlit run app.py

Deploy: see README_DEPLOY.md
"""

import datetime as dt
import os

import joblib
import numpy as np
import pandas as pd
import streamlit as st

st.set_page_config(page_title="FOODWISE", page_icon="🥖", layout="centered")

# ----------------------------------------------------------------------
# Load model (cached so it only loads once per session)
# ----------------------------------------------------------------------
@st.cache_resource
def load_model():
    return joblib.load("foodwise_model.joblib")

model = load_model()

STORES = [f"store_{i}" for i in range(9)]
STATE_HOLIDAY_OPTIONS = ["normal_day", "state_holiday", "day_before", "day_after"]
SCHOOL_HOLIDAY_OPTIONS = ["normal_day", "school_holiday"]
SPECIAL_DAY_OPTIONS = ["normal_day", "special_day", "day_before"]

# ----------------------------------------------------------------------
# Generative AI recommendation — LOCAL open-source model (FLAN-T5-small)
# No API key, no cost, runs on CPU. First run downloads ~300MB and caches it.
# ----------------------------------------------------------------------
@st.cache_resource
def load_generator():
    # Load tokenizer/model directly rather than via pipeline(task=...): the set of
    # registered pipeline task names has changed across transformers versions, which
    # causes "Unknown task" errors on some installs. This approach is version-stable.
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    # flan-t5-base (not -small): meaningfully better at following instructions and
    # using the specific numbers we give it, at the cost of a larger (~1GB) download.
    model_name = "google/flan-t5-base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    seq2seq_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return tokenizer, seq2seq_model


def generate_ai_recommendation(inputs: dict, predicted_sales: float,
                                ordered: float | None, surplus_risk: str | None) -> str:
    try:
        tokenizer, seq2seq_model = load_generator()
    except Exception as e:
        return (f"_(Local model failed to load: {e}. Showing rule-based summary instead.)_\n\n"
                + rule_based_recommendation(predicted_sales, ordered, surplus_risk))

    # Small instruction-tuned models follow short, rigid templates far more reliably
    # than open-ended "write a paragraph" prompts, which tend to produce generic text.
    demand_label = (
        "well below average" if predicted_sales < -0.5 else
        "below average" if predicted_sales < -0.15 else
        "about average" if predicted_sales <= 0.15 else
        "above average" if predicted_sales <= 0.5 else
        "well above average"
    )

    if surplus_risk and ordered is not None:
        order_label = (
            "much lower than" if ordered < -1.0 else
            "lower than" if ordered < -0.3 else
            "about the same as" if ordered <= 0.3 else
            "higher than" if ordered <= 1.0 else
            "much higher than"
        )
        prompt = (
            f"Fill in the blank with one short, specific sentence of advice.\n"
            f"Facts: Predicted demand for {inputs['store']} is {demand_label} a typical day. "
            f"The planned order is {order_label} a typical day. Surplus risk is {surplus_risk}.\n"
            f"Advice for the store manager: ___"
        )
    else:
        prompt = (
            f"Fill in the blank with one short, specific sentence of advice.\n"
            f"Facts: Predicted demand for {inputs['store']} is {demand_label} a typical day.\n"
            f"Advice for the store manager: ___"
        )

    try:
        input_ids = tokenizer(prompt, return_tensors="pt").input_ids
        output_ids = seq2seq_model.generate(input_ids, max_new_tokens=60, num_beams=4)
        text = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
        if not text or len(text) < 8:
            raise ValueError("generation too short/empty")
        return text
    except Exception as e:
        return (f"_(Generation failed: {e}. Showing rule-based summary instead.)_\n\n"
                + rule_based_recommendation(predicted_sales, ordered, surplus_risk))


def rule_based_recommendation(predicted_sales, ordered, surplus_risk):
    if ordered is None:
        return "Enter a planned order quantity to get a surplus-aware recommendation."
    if surplus_risk == "High":
        return (f"Predicted demand ({predicted_sales:.2f}) is notably below the planned "
                f"order ({ordered:.2f}). Consider reducing the order for this day to cut "
                f"waste risk.")
    if surplus_risk == "Moderate":
        return (f"Planned order ({ordered:.2f}) is somewhat above predicted demand "
                f"({predicted_sales:.2f}). A small reduction may help.")
    return (f"Planned order ({ordered:.2f}) is well aligned with predicted demand "
            f"({predicted_sales:.2f}). No change recommended.")


def classify_surplus(predicted_surplus: float) -> str:
    if predicted_surplus < 0.10:
        return "Low"
    elif predicted_surplus < 0.30:
        return "Moderate"
    return "High"


# ----------------------------------------------------------------------
# UI
# ----------------------------------------------------------------------
st.title("🥖 FOODWISE")
st.caption(
    "Predict tomorrow's demand and get a plain-language ordering recommendation. "
    "⚠️ Demo trained on 2022–2023 data — see README for live-use limitations."
)

# Data-driven weather presets, so users pick a condition instead of guessing numbers.
WEATHER_PRESETS = {
    "☀️ Sunny / clear":        {"sunshine": 397, "precipitation": 0.0},
    "⛅ Partly cloudy":        {"sunshine": 188, "precipitation": 0.0},
    "☁️ Cloudy / overcast":    {"sunshine": 19,  "precipitation": 0.0},
    "🌧️ Rainy":               {"sunshine": 71,  "precipitation": 4.8},
}

with st.form("inputs"):
    st.subheader("1. Store & date")
    col1, col2 = st.columns(2)
    with col1:
        store = st.selectbox("Store", STORES)
        date = st.date_input(
            "Date to predict for", value=dt.date.today(),
            help="Pick today or tomorrow. Use tomorrow's date with tomorrow's weather "
                 "forecast if you're planning tomorrow's order."
        )
    with col2:
        is_state_holiday = st.selectbox("State holiday?", STATE_HOLIDAY_OPTIONS)
        is_school_holiday = st.selectbox("School holiday?", SCHOOL_HOLIDAY_OPTIONS)
        is_special_day = st.selectbox("Special day (e.g. local event)?", SPECIAL_DAY_OPTIONS)

    st.subheader("2. Weather")
    st.caption("Use your weather app's forecast for the date above.")
    col3, col4 = st.columns(2)
    with col3:
        temperature_max = st.number_input(
            "Expected high (°C)", value=20.0, step=0.5,
            help="Typical range in this data: about -4°C to 38°C."
        )
        temperature_min = st.number_input(
            "Expected low (°C)", value=12.0, step=0.5,
            help="Typical range in this data: about -8°C to 30°C."
        )
    with col4:
        weather_condition = st.selectbox(
            "General sky condition",
            list(WEATHER_PRESETS.keys()),
            help="This sets the sunshine and rainfall values behind the scenes — no "
                 "need to know exact numbers."
        )

    st.subheader("3. Planning (optional)")
    st.caption("How does today's planned order compare to a typical day for this store?")
    order_choice = st.select_slider(
        "Planned order vs. typical day",
        options=["Much lower", "Lower", "About average", "Higher", "Much higher", "Skip"],
        value="Skip",
    )
    ORDER_CHOICE_TO_ZSCORE = {
        "Much lower": -1.5,
        "Lower": -0.75,
        "About average": 0.0,
        "Higher": 0.75,
        "Much higher": 1.5,
        "Skip": None,
    }

    use_ai = st.checkbox(
        "Write an AI recommendation (local model, first use downloads ~1GB)",
        value=True,
        help="Uses a small open-source model (FLAN-T5-base) running on this device — no "
             "internet needed after the first download, no account required."
    )

    submitted = st.form_submit_button("Predict")

if submitted:
    preset = WEATHER_PRESETS[weather_condition]
    temperature_mean = (temperature_max + temperature_min) / 2

    row = pd.DataFrame([{
        "store": store,
        "is_state_holiday": is_state_holiday,
        "is_school_holiday": is_school_holiday,
        "is_special_day": is_special_day,
        "temperature_max": temperature_max,
        "temperature_min": temperature_min,
        "temperature_mean": temperature_mean,
        "sunshine_sum": preset["sunshine"],
        "precipitation_sum": preset["precipitation"],
        "year": date.year,
        "month": date.month,
        "day": date.day,
        "day_of_week": date.weekday(),
        "week_of_year": date.isocalendar()[1],
        "is_weekend": int(date.weekday() >= 5),
    }])

    predicted_sales = float(model.predict(row)[0])

    # These are the training-set mean/std for the (already standardized) sales
    # column, used only to translate the z-score into a plain-language description.
    TRAIN_SALES_MEAN = 0.1155
    TRAIN_SALES_STD = 0.9977

    def describe_zscore(z):
        if z >= 1.0:
            return "well above a typical day"
        elif z >= 0.3:
            return "somewhat above a typical day"
        elif z > -0.3:
            return "about a typical day"
        elif z > -1.0:
            return "somewhat below a typical day"
        else:
            return "well below a typical day"

    st.subheader("Prediction")
    st.metric("Predicted sales (model score)", f"{predicted_sales:.3f}")
    st.caption(
        f"In plain terms: expected sales are **{describe_zscore(predicted_sales)}** "
        f"for this store. This score isn't in physical units (e.g. loaves) because "
        f"the training data was already normalized before we received it — see the "
        f"README for why."
    )

    surplus_risk = None
    ordered_input = ORDER_CHOICE_TO_ZSCORE[order_choice]
    if ordered_input is not None:
        predicted_surplus = ordered_input - predicted_sales
        surplus_risk = classify_surplus(predicted_surplus)
        risk_color = {"Low": "🟢", "Moderate": "🟡", "High": "🔴"}[surplus_risk]
        st.metric("Predicted surplus risk", f"{risk_color} {surplus_risk}")

    st.subheader("Recommendation")
    if use_ai:
        with st.spinner("Generating recommendation..."):
            inputs_dict = dict(
                store=store, date=str(date),
                is_state_holiday=is_state_holiday, is_school_holiday=is_school_holiday,
                is_special_day=is_special_day, temperature_max=temperature_max,
                temperature_min=temperature_min, sunshine_sum=preset["sunshine"],
                precipitation_sum=preset["precipitation"],
            )
            rec = generate_ai_recommendation(
                inputs_dict, predicted_sales,
                ordered_input,
                surplus_risk,
            )
        st.write(rec)
    else:
        st.write(rule_based_recommendation(
            predicted_sales,
            ordered_input,
            surplus_risk,
        ))

st.divider()
st.caption(
    "Note: predicted sales and planned-order comparisons are model scores, not physical "
    "units (e.g. loaves) — the training data was already normalized before we received "
    "it. Read them as \"above/below a typical day,\" not as exact counts. This is a "
    "course-project demo trained on 2022–2023 data; see README for live-deployment "
    "limitations before using it for real ordering decisions."
)
