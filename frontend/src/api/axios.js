import axios from 'axios';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

/**
 * Axios Instance Configuration
 * Base configuration for backend API calls
 */

// Base API URL - Load from environment variables
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
 * Add JWT token to every API call (except public endpoints)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Token-free endpoints (only login, signup)
    const tokenFreeEndpoints = ['/auth/login', '/auth/signup'];
    const isTokenFreeEndpoint = tokenFreeEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isTokenFreeEndpoint) {
      // Add token to protected endpoints
      const token = localStorage.getItem('corehive_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) {
          console.log(`🔐 Token added to ${config.url}:`, token.substring(0, 20) + '...');
        }
      } else {
        console.warn(`⚠️ No token found for protected endpoint: ${config.url}`);
        
        // Check if user data exists but token is missing
        const userData = localStorage.getItem('corehive_user');
        if (userData) {
          console.error('❌ User data exists but token missing! This is a bug.');
          console.log('📦 Stored user data:', JSON.parse(userData));
        }
      }
    } else {
      // Log for token-free endpoints
      if (import.meta.env.DEV) {
        console.log(`🔓 Token-free endpoint: ${config.url}`);
      }
    }
    
    // Log request (in development mode)
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
 * Handle API responses, catch errors with proper validation error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log success response (in development mode)
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    const { response, request, message } = error;
    
    // Log error
    console.error('❌ API Error:', error);
    
    // Response error handling
    if (response) {
      const status = response.status;
      const data = response.data;
      const errorMessage = data?.message || 'An error occurred';
      
      console.error('API Error Details:', {
        status,
        url: error.config?.url,
        data: data
      });

      switch (status) {
        case 400:
          // Validation errors - Don't logout
          if (data.message) {
            // If there are field-specific errors, show them
            if (data.data && typeof data.data === 'object') {
              const errorMessages = Object.entries(data.data)
                .map(([field, message]) => `<strong>${field}:</strong> ${message}`)
                .join('<br>');
              
              Swal.fire({
                icon: 'error',
                title: 'Validation Errors',
                html: `<div style="text-align: left; padding: 10px;">${errorMessages}</div>`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
              });
            } else {
              // Generic validation error
              Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: data.message,
                confirmButtonColor: '#d33',
              });
            }
          } else {
            toast.error('Invalid request data');
          }
          break;
          
        case 401:
          // Unauthorized - Token invalid/expired
          // Only logout if it's NOT an /error endpoint
          if (!error.config?.url?.includes('/error')) {
            localStorage.removeItem('corehive_token');
            localStorage.removeItem('corehive_user');
            
            Swal.fire({
              icon: 'warning',
              title: 'Session Expired',
              text: 'Your session has expired. Please login again.',
              confirmButtonColor: '#02C39A',
              allowOutsideClick: false
            }).then(() => {
              window.location.href = '/login';
            });
          }
          break;
          
        case 403:
          // Forbidden - Access denied
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You do not have permission to perform this action.',
            confirmButtonColor: '#d33',
          });
          break;
          
        case 404:
          // Not found
          Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: 'The requested resource was not found.',
            confirmButtonColor: '#d33',
          });
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'An error occurred on the server. Please try again later.',
            confirmButtonColor: '#d33',
          });
          break;
          
        default:
          // Other errors
          toast.error(errorMessage);
      }
    } else if (request) {
      // Network error - no response received
      console.error('Network Error:', request);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Unable to connect to the server. Please check your connection.',
        confirmButtonColor: '#d33',
      });
    } else {
      // Something else happened
      console.error('Error:', message);
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Helper Functions
 * Generic request methods for convenience
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

// Default export
export default apiClient;