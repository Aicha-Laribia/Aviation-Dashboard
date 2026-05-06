import React from 'react';
import LiveMap from './components/LiveMap';
import DelayPredictor from './components/DelayPredictor';
import FlightCharts from './components/FlightCharts';
import FlightTable from './components/FlightTable'; 
import StatCards from './components/StatCards';     

export default function App() {
  return (
    <div style={{
      minHeight: '100%',        // <-- Fixed the background cut-off!
      overflow: 'auto',         // <-- Added to ensure full scrolling
      width: '100%',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '40px 20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-1px' }}>
            ✈️ Moroccan Aviation Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginTop: '12px', fontWeight: 500 }}>
            Real-time Airspace Surveillance & AI Delay Predictions
          </p>
        </header>

        {/* Les cartes de statistiques en haut */}
        <div style={{ marginBottom: '32px' }}>
          <StatCards />
        </div>

        {/* La carte en pleine largeur */}
        <div style={{ marginBottom: '40px' }}>
          <LiveMap />
        </div>

        {/* Les graphiques et le prédicteur côte à côte */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          <DelayPredictor />
          <FlightCharts />
        </div>

        {/* Le tableau : White, semi-transparent, black text */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.3)', // <-- White frosted glass
          backdropFilter: 'blur(10px)',
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          color: '#000000' // <-- Black writing
        }}>
          <FlightTable />
        </div>

      </div>
    </div>
  );
}