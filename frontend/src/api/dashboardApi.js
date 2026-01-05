import apiClient from './axios';

/**
 * Dashboard API Service
 * Handles all API calls for dashboard data
 */

/**
 * Get role-based dashboard data
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export default {
  getDashboardData,
  getDashboardStats
};
