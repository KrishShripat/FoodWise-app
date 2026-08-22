"""
Run this once, locally, to regenerate foodwise_model.joblib using YOUR installed
scikit-learn version. This avoids pickle-compatibility errors between machines.

Usage:
    python train_model.py

Requires train.csv to be in the same folder.
"""

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
import joblib

print("Loading train.csv ...")
train = pd.read_csv("train.csv")
train["date"] = pd.to_datetime(train["date"])

demand_df = train.drop(columns=["unsold", "ordered"]).copy()

demand_df["year"] = demand_df["date"].dt.year
demand_df["month"] = demand_df["date"].dt.month
demand_df["day"] = demand_df["date"].dt.day
demand_df["day_of_week"] = demand_df["date"].dt.dayofweek
demand_df["week_of_year"] = demand_df["date"].dt.isocalendar().week.astype(int)
demand_df["is_weekend"] = (demand_df["day_of_week"] >= 5).astype(int)

X_full = demand_df.drop(columns=["sales", "date"])
y_full = demand_df["sales"]

categorical_features = ["store", "is_state_holiday", "is_school_holiday", "is_special_day"]
numerical_features = [c for c in X_full.columns if c not in categorical_features]

preprocessor = ColumnTransformer(transformers=[
    ("num", SimpleImputer(strategy="median"), numerical_features),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ]), categorical_features)
])

print("Training model ...")
final_model = Pipeline([
    ("preprocessor", preprocessor),
    ("model", GradientBoostingRegressor(
        n_estimators=200, learning_rate=0.05, max_depth=3, random_state=42
    ))
])
final_model.fit(X_full, y_full)

joblib.dump(final_model, "foodwise_model.joblib")
print("Saved foodwise_model.joblib -- trained with your local scikit-learn version.")
