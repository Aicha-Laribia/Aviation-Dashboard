import axios from "axios";

// This is the base URL of your FastAPI backend
// During development it runs on port 8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", 
});

export default api;