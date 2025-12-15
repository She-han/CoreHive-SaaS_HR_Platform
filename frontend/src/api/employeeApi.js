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

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};