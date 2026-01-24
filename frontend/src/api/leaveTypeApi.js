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

/**
 * Create a new leave type
 */
export const createLeaveType = async (leaveType) => {
  try {
    const response = await apiClient.post("/leave-types", leaveType);
    return response.data;
  } catch (error) {
    console.error("Error creating leave type:", error);
    throw error;
  }
};

/**
 * Update an existing leave type
 */
export const updateLeaveType = async (id, leaveType) => {
  try {
    const response = await apiClient.put(`/leave-types/${id}`, leaveType);
    return response.data;
  } catch (error) {
    console.error("Error updating leave type:", error);
    throw error;
  }
};

/**
 * Delete a leave type
 */
export const deleteLeaveType = async (id) => {
  try {
    const response = await apiClient.delete(`/leave-types/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting leave type:", error);
    throw error;
  }
};

export default {
  getAllLeaveTypes,
  getActiveLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
};
