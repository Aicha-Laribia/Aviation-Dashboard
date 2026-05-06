import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correction pour les icônes par défaut de Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RotatedPlane({ flight }: { flight: Flight }) {
  const rotation = (flight.heading ?? 0) - 45;
  
  const icon = L.divIcon({
    className: "", 
    html: `
      <div style="
        transform: rotate(${rotation}deg);
        filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.3));
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#2563eb" stroke="#1e40af" stroke-width="1.5">
          <path d="M21,16v-2l-8-5V3.5c0-0.83-0.67-1.5-1.5-1.5S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13], 
  });

  return (
    <Marker position={[flight.latitude, flight.longitude]} icon={icon}>
      <Popup>
        <div style={{ fontSize: "13px", lineHeight: "1.8", minWidth: "140px" }}>
          <strong style={{ fontSize: "15px", color: "#0f172a" }}>{flight.callsign ?? "UNKNOWN"}</strong><br />
          🌍 {flight.origin_country}<br />
          📡 <span style={{ fontFamily: "monospace" }}>{flight.icao24}</span><br />
          ↕ {flight.altitude_m?.toFixed(0) ?? "—"} m<br />
          💨 {flight.velocity_ms ? `${(flight.velocity_ms * 3.6).toFixed(0)} km/h` : "—"}<br />
          <div style={{ marginTop: "8px", fontWeight: "bold", color: flight.on_ground ? "#dc2626" : "#16a34a" }}>
            {flight.on_ground ? "🛬 On ground" : "🛫 Airborne"}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LiveMap() {
  const { data: flights, isLoading } = useFlights();

  if (isLoading) return <p style={{ color: "#64748b" }}>Loading airspace data...</p>;

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
          Live flights over Morocco ...
      </h2>

      <MapContainer
        center={[31.5, -7.0]}
        zoom={6}
        style={{ 
          height: "650px", // <-- J'ai agrandi la carte ici (c'était 450px)
          borderRadius: "12px", 
          border: "1px solid #cbd5e1",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          zIndex: 0
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {flights?.map((flight) => (
          <RotatedPlane key={flight.icao24} flight={flight} />
        ))}
      </MapContainer>
    </div>
  );
}