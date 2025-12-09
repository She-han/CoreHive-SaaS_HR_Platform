import axios from './axios';

/**
 * Designation API Service
 * Handles all API calls for designation operations
 */

/**
 * Get all designations for the organization
 */
export const getAllDesignations = async () => {
  try {
    const response = await axios.get('/org-admin/designations');
    return response.data;
  } catch (error) {
    console.error('Error fetching designations:', error);
    throw error;
  }
};

export const createDesignation = async (designationData) => {
  try {
    const response = await axios.post('/org-admin/designations', designationData);
    return response.data;
  } catch (error) {
    console.error('Error creating designation:', error);
    throw error;
  }
};

export const updateDesignation = async (id, designationData) => {
  try {
    const response = await axios.put(`/org-admin/designations/${id}`, designationData);
    return response.data;
  } catch (error) {
    console.error('Error updating designation:', error);
    throw error;
  }
};

export const deleteDesignation = async (id) => {
  try {
    const response = await axios.delete(`/org-admin/designations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting designation:', error);
    throw error;
  }
};

export default {
  getAllDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
};