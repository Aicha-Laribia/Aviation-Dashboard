import React, { useState } from 'react';
import { predictDelay } from '../api/flights';

export interface PredictionResult {
  delayed_probability: number;
  prediction: string;
  risk_level?: string;
}

export default function DelayPredictor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  const [formData, setFormData] = useState({
    origin: 'CMN',
    destination: 'CDG',
    airline: 'RAM',
    month: new Date().getMonth() + 1,
    day_of_week: new Date().getDay(),
    dep_hour: 14
  });

  const airports = ['AGA', 'BCN', 'CDG', 'CMN', 'FEZ', 'JFK', 'LHR', 'MAD', 'ORY', 'RAK', 'RBA', 'STN', 'TNG', 'YUL'];
  const airlines = ['IBE', 'RAM', 'RYR', 'VLG'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        month: parseInt(formData.month.toString(), 10),
        day_of_week: parseInt(formData.day_of_week.toString(), 10),
        dep_hour: parseInt(formData.dep_hour.toString(), 10),
      };

      const data = await predictDelay(payload);
      
      let calculatedRisk = 'Low';
      if (data.delayed_probability > 0.4) calculatedRisk = 'Medium';
      if (data.delayed_probability > 0.65) calculatedRisk = 'High';
      
      setResult({ ...data, risk_level: calculatedRisk });
      
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to predict delay. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColors = (level: string | undefined) => {
    switch (level) {
      case 'Low': return { text: '#2b8a3e', bg: '#ebfbee', border: '#b2f2bb' };
      case 'Medium': return { text: '#e67700', bg: '#fff9db', border: '#ffec99' };
      case 'High': return { text: '#c92a2a', bg: '#fff5f5', border: '#ffc9c9' };
      default: return { text: '#495057', bg: '#f8f9fa', border: '#dee2e6' };
    }
  };

  return (
    // Outer container with a beautiful aviation background image
    <div style={{ 
      padding: '40px 20px', 
      minHeight: '80vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: 'inset 0 0 0 2000px rgba(15, 23, 42, 0.4)' // Dark overlay to make text pop
    }}>
      
      {/* The main Glassmorphism Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        maxWidth: '800px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            ✈️ AI Flight Delay Predictor
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '15px' }}>
            Powered by XGBoost & Real-Time OpenSky Data
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {/* Origin */}
            <div>
              <label style={labelStyle}>Origin Airport</label>
              <select value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} style={inputStyle}>
                {airports.map(apt => <option key={apt} value={apt}>{apt}</option>)}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label style={labelStyle}>Destination Airport</label>
              <select value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} style={inputStyle}>
                {airports.map(apt => <option key={apt} value={apt}>{apt}</option>)}
              </select>
            </div>

            {/* Airline */}
            <div>
              <label style={labelStyle}>Airline</label>
              <select value={formData.airline} onChange={(e) => setFormData({ ...formData, airline: e.target.value })} style={inputStyle}>
                {airlines.map(al => <option key={al} value={al}>{al}</option>)}
              </select>
            </div>

            {/* Month */}
            <div>
              <label style={labelStyle}>Month</label>
              <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })} style={inputStyle}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>

            {/* Day of Week */}
            <div>
              <label style={labelStyle}>Day of Week</label>
              <select value={formData.day_of_week} onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })} style={inputStyle}>
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>

            {/* Departure Hour */}
            <div>
              <label style={labelStyle}>Departure Hour (0-23)</label>
              <input type="number" min="0" max="23" value={formData.dep_hour} onChange={(e) => setFormData({ ...formData, dep_hour: parseInt(e.target.value) })} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
              marginTop: '32px',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              width: '100%',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              transition: 'transform 0.2s ease'
            }}>
            {loading ? 'Analyzing Neural Pathways...' : 'Run Prediction Engine'}
          </button>
        </form>

        {/* Results Section */}
        {result && (
          <div style={{
            marginTop: '32px',
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${getRiskColors(result.risk_level).border}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', textAlign: 'center' }}>Analysis Complete</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Probability
                </div>
                <div style={{ fontSize: '42px', fontWeight: 800, color: getRiskColors(result.risk_level).text }}>
                  {(result.delayed_probability * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ width: '2px', height: '60px', background: '#e2e8f0' }}></div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Risk Profile
                </div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  background: getRiskColors(result.risk_level).bg,
                  color: getRiskColors(result.risk_level).text,
                  fontWeight: 700,
                  fontSize: '18px'
                }}>
                  {result.risk_level}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable clean styles
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, color: '#334155', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' as const };