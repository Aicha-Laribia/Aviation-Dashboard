import api from "./client";

// This is the shape of one flight object coming from your backend
export interface Flight {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number;
  latitude: number;
  altitude_m: number | null;
  velocity_ms: number | null;
  heading: number | null;
  on_ground: boolean;
  fetched_at: string;
}

export interface Stats {
  total_records: number;
  unique_aircraft: number;
  countries_seen: string[];
}

// These are the functions that call your API
export const getFlights = async (): Promise<Flight[]> => {
  const res = await api.get("/flights/morocco");
  return res.data.flights;
};

export const getStats = async (): Promise<Stats> => {
  const res = await api.get("/flights/stats");
  return res.data;
};

// Add this interface to define what the prediction looks like
export interface PredictionResult {
  delayed_probability: number;
  prediction: string;
}

// Add this function to make the POST request
export const predictDelay = async (flightData: any): Promise<PredictionResult> => {
  // We use the 'api' instance you created earlier so it automatically goes to localhost:8000
  const res = await api.post("/predict", flightData);
  return res.data;
};