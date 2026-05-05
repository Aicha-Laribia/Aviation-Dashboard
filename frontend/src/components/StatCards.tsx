import { useStats } from "../hooks/useFlights";

export default function StatCards() {
  const { data, isLoading } = useStats();

  if (isLoading) return <p>Loading stats...</p>;
  if (!data) return null;

  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
      <Card label="Total records" value={data.total_records} />
      <Card label="Unique aircraft" value={data.unique_aircraft} />
      <Card label="Countries seen" value={data.countries_seen.length} />
    </div>
  );
}

// A small reusable card component
function Card({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: "#f8f9fa",
      borderRadius: "8px",
      padding: "16px 24px",
      flex: 1,
      textAlign: "center",
      border: "1px solid #e9ecef"
    }}>
      <div style={{ fontSize: "28px", fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#868e96", marginTop: "4px" }}>{label}</div>
    </div>
  );
}