import apiClient from './axios';

/**
 * Designation API Service
 * Handles all API calls for designation operations
 */

/**
 * Get all designations for the organization
 */
export const getAllDesignations = async () => {
  try {
    const response = await apiClient.get('/org-admin/designations');
    return response.data;
  } catch (error) {
    console.error('Error fetching designations:', error);
    throw error;
  }
};

/**
 * Get designation by ID
 */
export const getDesignationById = async (id) => {
  try {
    const response = await apiClient.get(`/org-admin/designations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching designation:', error);
    throw error;
  }
};

/**
 * Create new designation
 */
export const createDesignation = async (designationData) => {
  try {
    const response = await apiClient.post('/org-admin/designations', designationData);
    return response.data;
  } catch (error) {
    console.error('Error creating designation:', error);
    throw error;
  }
};

/**
 * Update designation
 */
export const updateDesignation = async (id, designationData) => {
  try {
    const response = await apiClient.put(`/org-admin/designations/${id}`, designationData);
    return response.data;
  } catch (error) {
    console.error('Error updating designation:', error);
    throw error;
  }
};

/**
 * Delete designation
 */
export const deleteDesignation = async (id) => {
  try {
    const response = await apiClient.delete(`/org-admin/designations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting designation:', error);
    throw error;
  }
};

export default {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation
};