import apiClient from './axios';

/**
 * Employee API Service
 * Handles all API calls for employee operations
 */

/**
 * Get all employees for the organization
 */
export const getAllEmployees = async (page = 0, size = 9) => {
  try {
    const response = await apiClient.get('/employees', {
      params: { page, size }
    });
    return response.data.data; // matches your original res.data.data
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error(
      error.response?.data?.message || error.message
    );
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  if (!id) {
    throw new Error('Employee ID is required');
  }

  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw new Error(
      error.response?.data?.message || error.message
    );
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

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  deactivateEmployee
};