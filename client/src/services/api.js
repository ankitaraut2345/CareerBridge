import axios from 'axios';

/**
 * Reusable Axios instance for CareerBridge API
 * Base URL configured from environment variable VITE_API_URL
 */
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When deployed together on Vercel, relative /api path routes seamlessly to the API serverless function
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – inject JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerbridge_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

// Foundation health check service
export const checkHealth = async () => {
  return await api.get('/health');
};

export default api;
