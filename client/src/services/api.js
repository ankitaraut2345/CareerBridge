import axios from 'axios';

/**
 * Reusable Axios instance for CareerBridge API
 * Base URL configured from environment variable VITE_API_URL
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
