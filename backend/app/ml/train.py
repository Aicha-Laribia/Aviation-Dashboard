import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

# Set up absolute paths so the script runs correctly from anywhere
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "data","morocco_flights.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml")

def train_model():
    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)

    # Define features (X) and target (y)
    # Adjust these column names if your generate_dataset.py named them differently
    features = ['origin', 'destination', 'airline', 'month', 'day_of_week', 'dep_hour']
    X = df[features].copy()
    y = df['delayed']

    print("Encoding categorical features...")
    # XGBoost needs numbers, not strings. We save these encoders because 
    # the live API will need them to translate user input (e.g., "CMN" -> 2)
    encoders = {}
    categorical_cols = ['origin', 'destination', 'airline']
    
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le

    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training XGBoost model (this might take a few seconds)...")
    
    # Calculate class imbalance ratio dynamically
    # Number of On-Time (0) divided by Number of Delayed (1)
    ratio = float((y_train == 0).sum() / (y_train == 1).sum())
    print(f"Applying scale_pos_weight of {ratio:.2f} to handle class imbalance...")

    model = xgb.XGBClassifier(
        n_estimators=350,         # Increased from 150
        learning_rate=0.05,       # Decreased from 0.1 for more stable learning
        max_depth=8,              # Increased from 6 to capture more complex interactions
        scale_pos_weight=ratio,   # Forces the model to penalize missed delays heavily
        subsample=0.8,            # Uses 80% of data per tree (prevents overfitting)
        colsample_bytree=0.8,     # Uses 80% of features per tree
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)

    print("\nEvaluating model performance...")
    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    print("\nSaving model and encoders to disk...")
    with open(os.path.join(MODEL_DIR, "model.pkl"), "wb") as f:
        pickle.dump(model, f)
        
    with open(os.path.join(MODEL_DIR, "encoders.pkl"), "wb") as f:
        pickle.dump(encoders, f)

    print(f"Success! Artifacts saved in {MODEL_DIR}")

if __name__ == "__main__":
    train_model()