import axios from './axios';

const BASE =  "http://localhost:8080/api";
/**
 * Department API Service
 * Handles all API calls for department operations
 */


/**
 * Get all departments for the organization
 */
export const getAllDepartments = async (token) => {
  try {
    const response = await axios.get(`${BASE}/org-admin/departments`, {
      headers: {
        Authorization: `Bearer ${token}`, // send token
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const createDepartment = async (deptData, token) => {
  try {
    const response = await axios.post(`${BASE}/org-admin/departments`, deptData, {
      headers: {
        Authorization: `Bearer ${token}`, // send token
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

export default {
  getAllDepartments
};