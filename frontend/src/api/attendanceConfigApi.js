import apiClient from "./axios";

/**
 * Attendance Configuration API Service
 * Handles all API calls for attendance configuration operations
 */

/**
 * Get all attendance configurations
 */
export const getAllConfigurations = async () => {
  try {
    const response = await apiClient.get("/org-admin/attendance-config");
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance configurations:", error);
    throw error;
  }
};

/**
 * Get configuration by ID
 */
export const getConfigurationById = async (id) => {
  try {
    const response = await apiClient.get(`/org-admin/attendance-config/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching configuration:", error);
    throw error;
  }
};

/**
 * Create a new attendance configuration
 */
export const createConfiguration = async (config) => {
  try {
    const response = await apiClient.post("/org-admin/attendance-config", config);
    return response.data;
  } catch (error) {
    console.error("Error creating configuration:", error);
    throw error;
  }
};

/**
 * Update an existing attendance configuration
 */
export const updateConfiguration = async (id, config) => {
  try {
    const response = await apiClient.put(`/org-admin/attendance-config/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Error updating configuration:", error);
    throw error;
  }
};

/**
 * Delete an attendance configuration
 */
export const deleteConfiguration = async (id) => {
  try {
    const response = await apiClient.delete(`/org-admin/attendance-config/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting configuration:", error);
    throw error;
  }
};

export default {
  getAllConfigurations,
  getConfigurationById,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration
};
