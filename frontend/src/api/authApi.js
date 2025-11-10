import { apiPost, apiGet } from './axios';

/**
 * Authentication API Calls
 * සියලු authentication related API calls
 */

const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  CONFIGURE_MODULES: '/auth/configure-modules',
  GET_CURRENT_USER: '/auth/me',
  LOGOUT: '/auth/logout'
};

/**
 * Organization Signup API
 * @param {Object} signupData - Organization registration data
 * @returns {Promise} API response
 */
export const signupOrganization = async (signupData) => {
  try {
    console.log('🏢 Submitting organization signup:', signupData.organizationName);
    
    const response = await apiPost(AUTH_ENDPOINTS.SIGNUP, signupData);
    
    if (response.success) {
      console.log('✅ Organization signup successful');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Organization signup failed:', error);
    throw error;
  }
};

/**
 * User Login API - FIXED VERSION
 * @param {Object} loginData - Email and password
 * @returns {Promise} Login response with token and user details
 */
export const loginUser = async (loginData) => {
  try {
    console.log('🔑 Attempting login for:', loginData.email);
    
    const response = await apiPost(AUTH_ENDPOINTS.LOGIN, loginData);
    
    if (response.success) {
      console.log('✅ Login successful for:', loginData.email);
      console.log('🔐 Received token:', response.data.token ? 'Yes' : 'No');
      
      // Token storage will be handled by Redux slice
      return response.data;
    } else {
      console.error('❌ Login failed:', response.message);
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('❌ Login failed for:', loginData.email, error);
    throw error;
  }
};

/**
 * Configure Modules API (First-time ORG_ADMIN)
 * @param {Object} moduleConfig - Selected modules
 * @returns {Promise} API response
 */
export const configureModules = async (moduleConfig) => {
  try {
    console.log('⚙️ Configuring modules:', moduleConfig);
    
    const response = await apiPost(AUTH_ENDPOINTS.CONFIGURE_MODULES, moduleConfig);
    
    if (response.success) {
      console.log('✅ Modules configured successfully');
      
      // Update user data in localStorage
      const storedUser = JSON.parse(localStorage.getItem('corehive_user') || '{}');
      storedUser.modulesConfigured = true;
      storedUser.moduleConfig = {
        ...storedUser.moduleConfig,
        ...moduleConfig
      };
      localStorage.setItem('corehive_user', JSON.stringify(storedUser));
    }
    
    return response;
  } catch (error) {
    console.error('❌ Module configuration failed:', error);
    throw error;
  }
};

/**
 * Get Current User API
 * @returns {Promise} Current user details
 */
export const getCurrentUser = async () => {
  try {
    console.log('👤 Fetching current user details');
    
    const response = await apiGet(AUTH_ENDPOINTS.GET_CURRENT_USER);
    
    if (response.success) {
      console.log('✅ Current user details retrieved');
      
      // Update localStorage with fresh user data
      const { token, ...userData } = response.data;
      localStorage.setItem('corehive_user', JSON.stringify(userData));
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    throw error;
  }
};

/**
 * Logout User
 * Client-side logout (JWT stateless නිසා server-side logout required නෑ)
 */
export const logoutUser = () => {
  try {
    console.log('👋 Logging out user');
    
    // Clear localStorage
    localStorage.removeItem('corehive_token');
    localStorage.removeItem('corehive_user');
    
    console.log('✅ User logged out successfully');
    
    // Redirect to home page
    window.location.href = '/';
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('corehive_token');
  const user = localStorage.getItem('corehive_user');
  
  return !!(token && user);
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('corehive_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Get stored token
 * @returns {string|null} JWT token or null
 */
export const getStoredToken = () => {
  return localStorage.getItem('corehive_token');
};