import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Axios Instance Configuration
 * Backend API calls සඳහා base configuration
 */

// Base API URL - Environment variable වලින් load කරන්න
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Main axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * හැම API call එකකම JWT token add කරන්න
 */
/**
 * Request Interceptor - FIXED VERSION
 * Specific public endpoints විතරයි token-free
 */
apiClient.interceptors.request.use(
  (config) => {
    // Token-free endpoints (login, signup විතරයි)
    const tokenFreeEndpoints = ['/auth/login', '/auth/signup'];
    const isTokenFreeEndpoint = tokenFreeEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isTokenFreeEndpoint) {
      // Protected endpoints වලට token add කරන්න (configure-modules ඇතුළුව)
      const token = localStorage.getItem('corehive_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) {
          console.log(`🔑 Token added to ${config.url}:`, token.substring(0, 20) + '...');
        }
      } else {
        console.warn(`⚠️ No token found for protected endpoint: ${config.url}`);
        
        // Check if user data exists but token is missing
        const userData = localStorage.getItem('corehive_user');
        if (userData) {
          console.error('❌ User data exists but token missing! This is a bug.');
          console.log('🔍 Stored user data:', JSON.parse(userData));
        }
      }
    } else {
      // Log for token-free endpoints
      if (import.meta.env.DEV) {
        console.log(`🔓 Token-free endpoint: ${config.url}`);
      }
    }
    
    // Request log කරන්න (development mode එකේ)
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * API responses handle කරන්න, errors catch කරන්න
 */
apiClient.interceptors.response.use(
  (response) => {
    // Success response log කරන්න (development mode එකේ)
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    const { response, request, message } = error;
    
    // Error log කරන්න
    console.error('❌ API Error:', error);
    
    // Response error handling
    if (response) {
      const status = response.status;
      const errorMessage = response.data?.message || 'An error occurred';
      
      switch (status) {
        case 400:
          toast.error(errorMessage || 'Invalid request data');
          break;
          
        case 401:
          // Unauthorized - Token invalid/expired
          toast.error('Session expired. Please login again');
          localStorage.removeItem('corehive_token');
          localStorage.removeItem('corehive_user');
          window.location.href = '/login';
          break;
          
        case 403:
          toast.error('Access denied. Insufficient permissions');
          break;
          
        case 404:
          toast.error('Resource not found');
          break;
          
        case 500:
          toast.error('Server error. Please try again later');
          break;
          
        default:
          toast.error(errorMessage);
      }
    } else if (request) {
      // Network error
      toast.error('Network error. Please check your internet connection');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Helper Functions
 */

// Generic GET request
export const apiGet = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic POST request
export const apiPost = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic PUT request
export const apiPut = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic DELETE request
export const apiDelete = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;