// src/services/apiClient.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'https://kanbanapibackend-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response) {
      console.error('[API] Response error', err.response.status, err.response.data);
      const e = new Error(err.response.data?.message || `HTTP ${err.response.status}`);
      e.status = err.response.status;
      e.data = err.response.data;
      throw e;
    } else if (err.request) {
      console.error('[API] No response received', err.request);
      throw new Error('No response received from API');
    } else {
      console.error('[API] Request setup error', err.message);
      throw err;
    }
  }
);

export default api;