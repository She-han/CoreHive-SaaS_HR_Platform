import apiClient from './axios';

/**
 * Leave Request API Service
 * Handles all API calls for leave request operations
 */

/**
 * Submit a leave request
 */
export const submitLeaveRequest = async (leaveRequestData) => {
  try {
    const response = await apiClient.post('/employee/leave-requests', leaveRequestData);
    return response.data;
  } catch (error) {
    console.error('Error submitting leave request:', error);
    throw error;
  }
};

/**
 * Get leave request history for an employee
 */
export const getEmployeeLeaveRequests = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employee/leave-requests/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
};

/**
 * Get all leave types for the organization
 */
export const getLeaveTypes = async () => {
  try {
    const response = await apiClient.get('/employee/leave-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching leave types:', error);
    throw error;
  }
};

export default {
  submitLeaveRequest,
  getEmployeeLeaveRequests,
  getLeaveTypes
};
