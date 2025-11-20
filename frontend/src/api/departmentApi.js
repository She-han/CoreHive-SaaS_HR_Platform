import axios from './axios';

/**
 * Department API Service
 * Handles all API calls for department operations
 */

/**
 * Get all departments for the organization
 */
export const getAllDepartments = async () => {
  try {
    const response = await axios.get('/org-admin/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export default {
  getAllDepartments
};