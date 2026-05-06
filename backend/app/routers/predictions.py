from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import pickle
import os

router = APIRouter()

# 1. Define paths to your ML artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "ml", "encoders.pkl")

# 2. Load the brain! (We do this globally so it only loads once when the server starts)
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, "rb") as f:
        encoders = pickle.load(f)
    print("✅ ML Model and Encoders loaded successfully!")
except FileNotFoundError:
    print("❌ Warning: ML artifacts not found. Prediction route will fail.")
    model = None
    encoders = None

# 3. Define the exact shape of the data the frontend is allowed to send
class FlightPredictionRequest(BaseModel):
    origin: str
    destination: str
    airline: str
    month: int
    day_of_week: int
    dep_hour: int

@router.post("/predict")
async def predict_delay(request: FlightPredictionRequest):
    if not model or not encoders:
        raise HTTPException(status_code=500, detail="ML model is offline.")

    try:
        # 4. Translate strings (like "RAM") into the numbers the model learned
        origin_enc = encoders['origin'].transform([request.origin])[0]
        dest_enc = encoders['destination'].transform([request.destination])[0]
        airline_enc = encoders['airline'].transform([request.airline])[0]
    except ValueError as e:
        # This catches errors if the frontend sends an airport the model has never seen
        raise HTTPException(status_code=400, detail=f"Unrecognized category: {str(e)}")

    # 5. Package the data exactly how XGBoost expects it
    input_df = pd.DataFrame([{
        'origin_encoded': origin_enc,
        'destination_encoded': dest_enc,
        'airline_encoded': airline_enc,
        'month': request.month,
        'day_of_week': request.day_of_week,
        'dep_hour': request.dep_hour
    }])

    # 6. Ask the model for the probability
    # predict_proba returns a list of lists: [[probability_ontime, probability_delayed]]
    prob_delayed = float(model.predict_proba(input_df)[0][1])

    # 7. Format the response for the frontend
    return {
        "delayed_probability": round(prob_delayed, 4),
        "prediction": "likely delayed" if prob_delayed > 0.50 else "likely on-time"
    }