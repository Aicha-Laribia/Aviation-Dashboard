import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";

export default function FlightTable() {
  const { data: flights, isLoading, error } = useFlights();

  if (isLoading) return <p>Loading flights...</p>;
  if (error)     return <p>Error loading flights.</p>;
  if (!flights?.length) return <p>No flights found.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f1f3f5", textAlign: "left" }}>
            <th style={th}>Callsign</th>
            <th style={th}>Country</th>
            <th style={th}>Altitude (m)</th>
            <th style={th}>Speed (m/s)</th>
            <th style={th}>Heading</th>
            <th style={th}>On ground</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((f: Flight, i: number) => (
            <tr key={f.icao24 + i} style={{ borderBottom: "1px solid #e9ecef" }}>
              <td style={td}>{f.callsign ?? "—"}</td>
              <td style={td}>{f.origin_country}</td>
              <td style={td}>{f.altitude_m?.toFixed(0) ?? "—"}</td>
              <td style={td}>{f.velocity_ms?.toFixed(1) ?? "—"}</td>
              <td style={td}>{f.heading?.toFixed(1) ?? "—"}</td>
              <td style={td}>{f.on_ground ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Reusable cell styles
const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 500 };
const td: React.CSSProperties = { padding: "10px 12px" };