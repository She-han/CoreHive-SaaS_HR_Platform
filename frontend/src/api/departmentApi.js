import axios from "./axios";
/**
 * Department API Service
 * Handles all API calls for department operations
 */

/**
 * Get all departments for the organization
 */
export const getAllDepartments = async (token) => {
  try {
    const response = await axios.get(`/org-admin/departments`, {
      headers: {
        Authorization: `Bearer ${token}` // send token
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const createDepartment = async (deptData, token) => {
  try {
    const response = await axios.post(
      `/org-admin/departments`,
      deptData,
      {
        headers: {
          Authorization: `Bearer ${token}` // send token
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const updateDepartment = async (id, deptData) => {
  try {
    const response = await axios.put(`/org-admin/departments/${id}`, deptData);
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await axios.delete(`/org-admin/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};

export default {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
