import {
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";

// -------------------------------------------------------
// This component builds two charts from the flight data
// that's already loaded in the app.
// We don't need a new API call — we reuse useFlights()
// and transform the data ourselves in JavaScript.
// -------------------------------------------------------

export default function FlightCharts() {
  const { data: flights } = useFlights();

  if (!flights?.length) return null;

  // --- CHART 1 DATA: flights grouped by country ---
  // reduce() walks through every flight and builds an object like:
  // { "Morocco": 12, "Spain": 8, "France": 5 ... }
  const countryCount = flights.reduce((acc: Record<string, number>, f: Flight) => {
    acc[f.origin_country] = (acc[f.origin_country] || 0) + 1;
    return acc;
  }, {});

  // Convert that object into an array recharts can read:
  // [{ country: "Morocco", count: 12 }, { country: "Spain", count: 8 }...]
  // then sort by count descending so biggest bars are first
  const countryData = Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // --- CHART 2 DATA: altitude distribution ---
  // Group flights into altitude buckets:
  // 0-3000m, 3000-6000m, 6000-9000m, 9000-12000m, 12000m+
  const altitudeBuckets: Record<string, number> = {
    "0–3k m":   0,
    "3–6k m":   0,
    "6–9k m":   0,
    "9–12k m":  0,
    "12k+ m":   0,
  };

  flights.forEach((f: Flight) => {
    const alt = f.altitude_m ?? 0;
    if      (alt < 3000)  altitudeBuckets["0–3k m"]  += 1;
    else if (alt < 6000)  altitudeBuckets["3–6k m"]  += 1;
    else if (alt < 9000)  altitudeBuckets["6–9k m"]  += 1;
    else if (alt < 12000) altitudeBuckets["9–12k m"] += 1;
    else                  altitudeBuckets["12k+ m"]  += 1;
  });

  const altitudeData = Object.entries(altitudeBuckets)
    .map(([range, count]) => ({ range, count }));

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "20px" }}>
        Analytics
      </h2>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

        {/* --- CHART 1: Flights by country --- */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <p style={{ fontSize: "13px", color: "#868e96", marginBottom: "8px" }}>
            Current flights by country
          </p>
          {/* 
            ResponsiveContainer makes the chart fill its parent div
            width="100%" height={250} means full width, 250px tall
          */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={countryData} margin={{ left: -10 }}>
              {/* 
                CartesianGrid adds the light grey grid lines behind the bars
                strokeDasharray="3 3" makes them dashed
              */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
              {/* 
                XAxis = horizontal axis, uses the "country" field
                YAxis = vertical axis, uses numbers automatically
              */}
              <XAxis 
                dataKey="country" 
                tick={{ fontSize: 11 }} 
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              {/* Tooltip appears on hover showing exact values */}
              <Tooltip />
              {/* Bar is the actual bar, dataKey="count" tells it which field to use */}
              <Bar dataKey="count" fill="#339af0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- CHART 2: Altitude distribution --- */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <p style={{ fontSize: "13px", color: "#868e96", marginBottom: "8px" }}>
            Altitude distribution
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={altitudeData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#51cf66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}