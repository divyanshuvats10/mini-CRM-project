import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use the environment variable or default to your Render backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://mini-crm-backend-j7uq.onrender.com';
  }
  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // This ensures cookies are sent with requests for authentication
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Log the API URL being used
console.log('API Base URL:', api.defaults.baseURL);
console.log('Environment:', import.meta.env.MODE);

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('Unauthorized access - user may need to login');
      // Don't automatically redirect here, let the AuthContext handle it
    }
    
    if (error.response?.status === 403) {
      console.log('Forbidden access');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    return Promise.reject(error);
  }
);

export default api; 