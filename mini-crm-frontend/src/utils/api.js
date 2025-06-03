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

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: false, // Don't use cookies, use Authorization headers instead
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Log the API URL being used
console.log('API Base URL:', api.defaults.baseURL);
console.log('Environment:', import.meta.env.MODE);
console.log('Using JWT authentication instead of cookies');

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // Add JWT token to Authorization header if available
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Adding JWT token to request');
    } else {
      console.log('🔓 No JWT token available');
    }
    
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
    
    // If response contains a token, save it
    if (response.data.token) {
      console.log('💾 Saving JWT token to localStorage');
      setToken(response.data.token);
    }
    
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔓 Unauthorized access - removing token');
      removeToken(); // Clear invalid token
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

// Export token management functions
export { getToken, setToken, removeToken };
export default api; 