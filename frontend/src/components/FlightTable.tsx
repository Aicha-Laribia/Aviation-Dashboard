import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";

export default function FlightTable() {
  const { data: flights, isLoading, error } = useFlights();

  if (isLoading) return <p>Loading flights...</p>;
  if (error)     return <p>Error loading flights.</p>;
  if (!flights?.length) return <p>No flights found.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px"}}>
        <thead style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
          <tr>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Callsign</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Country</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Altitude (m)</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Speed (km/h)</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((f: Flight, i: number) => (
            <tr key={f.icao24 + i} style={{ borderBottom: "1px solid #d6dae3" }}>
              <td style={td}>{f.callsign ?? "—"}</td>
              <td style={td}>{f.origin_country}</td>
              <td style={td}>{f.altitude_m?.toFixed(0) ?? "—"}</td>
              <td style={td}>{f.velocity_ms?.toFixed(1) ?? "—"}</td>
              <td style={td}>{f.on_ground ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Reusable cell styles
const td: React.CSSProperties = { padding: "12px", textAlign: 'center' };