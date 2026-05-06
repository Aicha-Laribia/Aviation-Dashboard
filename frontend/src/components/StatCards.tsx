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
// Notice we pass label and value as props
const Card = ({ label, value }: { label: string, value: string | number }) => (
  <div style={{
    flex: 1, // This makes all cards stretch equally to fill the space
    background: 'rgba(100, 100, 100, 0.3)', // <-- The Frosted Glass background!
    backdropFilter: 'blur(12px)',           // <-- The blur effect
    WebkitBackdropFilter: 'blur(12px)',     // <-- Safari support
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.4)', // A subtle white border makes glass look realistic
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    {/* The Label (e.g., "Total Records") */}
    <div style={{ 
      fontSize: '12px', 
      textTransform: 'uppercase', 
      letterSpacing: '1px', 
      fontWeight: 700, 
      color: '#ffffff', // Dark slate gray so it's readable but not as harsh as pure black
      marginBottom: '8px' 
    }}>
      {label}
    </div>
    
    {/* The Number */}
    <div style={{ 
      fontSize: '25px', 
      fontWeight: 800, 
      color: '#000000', // Solid black for the big numbers
      lineHeight: '1'
    }}>
      {value}
    </div>
  </div>
);
