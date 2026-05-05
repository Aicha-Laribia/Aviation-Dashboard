import StatCards from "./components/StatCards";
import FlightTable from "./components/FlightTable";
import LiveMap from "./components/LiveMap";
import FlightCharts from "./components/FlightCharts";

export default function App() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "24px" }}>
        ✈ Aviation Analytics — Morocco
      </h1>
      <StatCards />
      <LiveMap />
      <FlightCharts />
      <FlightTable />
    </div>
  );
}