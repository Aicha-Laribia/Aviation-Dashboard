import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- L'IMPORT MANQUANT EST LÀ !
import App from './App.tsx'

// L'import global du CSS pour la carte Leaflet
import 'leaflet/dist/leaflet.css' 

// (Garde cet import si tu as un fichier index.css, sinon tu peux l'enlever)
import './index.css' 

// Initialisation du client React Query
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)