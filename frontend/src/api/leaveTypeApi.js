import apiClient from "./axios";

/**
 * Leave Type API Service
 * Handles all API calls for leave type operations
 */

/**
 * Get all leave types for the organization
 */
export const getAllLeaveTypes = async () => {
  try {
    const response = await apiClient.get("/leave-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching leave types:", error);
    throw error;
  }
};

/**
 * Get all active leave types for the organization
 */
export const getActiveLeaveTypes = async () => {
  try {
    const response = await apiClient.get("/leave-types/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active leave types:", error);
    throw error;
  }
};

export default {
  getAllLeaveTypes,
  getActiveLeaveTypes
};
