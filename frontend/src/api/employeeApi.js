import apiClient from './axios';

/**
 * Employee API Service
 * Handles all API calls for employee operations
 */

/**
 * Get all employees for the organization
 */
export const getAllEmployees = async () => {
  try {
    const response = await apiClient.get('/employees');
    return response.data; // Returns ApiResponse
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

/**
 * Create new employee
 */
export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Update employee
 */
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

/**
 * Get current logged-in employee's profile
 */
export const getCurrentEmployeeProfile = async () => {
  try {
    const response = await apiClient.get('/employees/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current employee profile:', error);
    throw error;
  }
};

/**
 * Update current logged-in employee's profile
 */
export const updateCurrentEmployeeProfile = async (employeeData) => {
  try {
    const response = await apiClient.put('/employees/me', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error updating current employee profile:', error);
    throw error;
  }
};

/**
 * Deactivate employee
 */
export const deactivateEmployee = async (id) => {
  if (!id) {
    throw new Error('Employee ID is required');
  }

  try {
    const response = await apiClient.put(
      `/employees/${id}/deactivate`,
      null
    );
    return response.data.data;
  } catch (error) {
    console.error('Error deactivating employee:', error);
    throw new Error(
      error.response?.data?.message || error.message
    );
  }
};

/**
 * Get total count of employees for the organization
 */
export const getTotalEmployeesCount = async () => {
  try {
    const response = await apiClient.get('/employees/total-count');
    return response.data.data; // matches your original res.data.data
  } catch (error) {
    console.error('Error when get total-count of employees:', error);
    throw new Error(
      error.response?.data?.message || error.message
    );
  }
};

/**
 * Get total count of active employees for the organization
 */
export const getTotalActiveEmployeesCount = async () => {
  try {
    const response = await apiClient.get('/employees/total-active-count');
    return response.data.data; // matches your original res.data.data
  } catch (error) {
    console.error('Error when get total-active-count of employees:', error);
    throw new Error(
      error.response?.data?.message || error.message
    );
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getCurrentEmployeeProfile,
  updateCurrentEmployeeProfile,
  deactivateEmployee,
  getTotalEmployeesCount,
  getTotalActiveEmployeesCount
};