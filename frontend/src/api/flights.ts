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