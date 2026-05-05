import axios from "axios";

// This is the base URL of your FastAPI backend
// During development it runs on port 8000
const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
});

export default api;