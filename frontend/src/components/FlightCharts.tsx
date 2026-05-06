import {
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";

export default function FlightCharts() {
  const { data: flights } = useFlights();

  if (!flights?.length) return null;

  const countryCount = flights.reduce((acc: Record<string, number>, f: Flight) => {
    acc[f.origin_country] = (acc[f.origin_country] || 0) + 1;
    return acc;
  }, {});

  const countryData = Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

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
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "20px" }}>
        Real-Time Analytics
      </h2>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

        {/* --- CHART 1 --- */}
        <div style={{ 
          flex: 1, 
          minWidth: "320px", 
          background: "white", 
          padding: "24px", 
          borderRadius: "12px", 
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", marginTop: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Traffic by Country
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={countryData} margin={{ left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="country" 
                tick={{ fontSize: 11, fill: "#64748b" }} 
                interval={0}
                angle={-35}
                textAnchor="end"
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- CHART 2 --- */}
        <div style={{ 
          flex: 1, 
          minWidth: "320px", 
          background: "white", 
          padding: "24px", 
          borderRadius: "12px", 
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", marginTop: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Altitude Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={altitudeData} margin={{ left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 11, fill: "#64748b" }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}