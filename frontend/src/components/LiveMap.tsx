import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useFlights } from "../hooks/useFlights";
import type { Flight } from "../api/flights";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// -------------------------------------------------------
// WHY THIS BLOCK?
// Leaflet was built before modern bundlers like Vite existed.
// It tries to load marker icons from a folder that doesn't
// exist in Vite's build output. This block manually tells
// Leaflet where the icons are. Without it you get broken
// grey boxes instead of map markers.
// -------------------------------------------------------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom airplane icon — more visual than the default pin
const planeIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:20px;transform:rotate(0deg)">✈</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// This component rotates each plane icon to match its heading
// We need it as a separate component because it uses a Leaflet hook
function RotatedPlane({ flight }: { flight: Flight }) {
  const icon = L.divIcon({
    className: "",
    // heading is the direction the plane is flying in degrees
    // CSS transform rotates the emoji to point the right way
    html: `<div style="font-size:20px;transform:rotate(${flight.heading ?? 0}deg)">✈</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker position={[flight.latitude, flight.longitude]} icon={icon}>
      {/* Popup appears when you click the plane */}
      <Popup>
        <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
          <strong>{flight.callsign ?? "Unknown"}</strong><br />
          🌍 {flight.origin_country}<br />
          📡 {flight.icao24}<br />
          ↕ {flight.altitude_m?.toFixed(0) ?? "—"} m<br />
          💨 {flight.velocity_ms?.toFixed(1) ?? "—"} m/s<br />
          🧭 {flight.heading?.toFixed(1) ?? "—"}°<br />
          {flight.on_ground ? "🛬 On ground" : "🛫 Airborne"}
        </div>
      </Popup>
    </Marker>
  );
}

export default function LiveMap() {
  const { data: flights, isLoading } = useFlights();

  if (isLoading) return <p>Loading map...</p>;

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "12px" }}>
        Live flights over Morocco
        <span style={{ 
          marginLeft: "10px", 
          fontSize: "12px", 
          color: "#868e96",
          fontWeight: 400 
        }}>
          {flights?.length ?? 0} aircraft · updates every 30s
        </span>
      </h2>

      {/* 
        MapContainer — the main Leaflet map component
        center = [lat, lng] of Morocco
        zoom = how zoomed in (1=world, 18=street level, 6 is good for a country)
        style height is required — without it the map renders as 0px tall
      */}
      <MapContainer
        center={[31.5, -7.0]}
        zoom={6}
        style={{ height: "450px", borderRadius: "8px", border: "1px solid #e9ecef" }}
      >
        {/* 
          TileLayer — this loads the actual map tiles (the visual map)
          OpenStreetMap is free and requires no API key
          attribution is legally required by OSM's license
        */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Render one marker per flight */}
        {flights?.map((flight) => (
          <RotatedPlane key={flight.icao24} flight={flight} />
        ))}
      </MapContainer>
    </div>
  );
}