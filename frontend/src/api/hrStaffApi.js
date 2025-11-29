import axios from './axios';

/**
 * HR Staff Management API Service
 * Handles all API calls for HR staff operations
 */

/**
 * Get all HR staff members with pagination
 */
export const getAllHRStaff = async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    const response = await axios.get('/org-admin/hr-staff', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching HR staff:', error);
    throw error;
  }
};

/**
 * Get all HR staff members without pagination
 */
export const getAllHRStaffNoPagination = async () => {
  try {
    const response = await axios.get('/org-admin/hr-staff/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all HR staff:', error);
    throw error;
  }
};

/**
 * Get HR staff member by ID
 */
export const getHRStaffById = async (hrStaffId) => {
  try {
    const response = await axios.get(`/org-admin/hr-staff/${hrStaffId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching HR staff with ID ${hrStaffId}:`, error);
    throw error;
  }
};

/**
 * Create new HR staff member
 */
export const createHRStaff = async (hrStaffData) => {
  try {
    const response = await axios.post('/org-admin/hr-staff', hrStaffData);
    return response.data;
  } catch (error) {
    console.error('Error creating HR staff:', error);
    throw error;
  }
};

/**
 * Update existing HR staff member
 */
export const updateHRStaff = async (hrStaffId, hrStaffData) => {
  try {
    const response = await axios.put(`/org-admin/hr-staff/${hrStaffId}`, {
      ...hrStaffData,
      id: hrStaffId
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating HR staff with ID ${hrStaffId}:`, error);
    throw error;
  }
};

/**
 * Delete HR staff member
 */
export const deleteHRStaff = async (hrStaffId) => {
  try {
    const response = await axios.delete(`/org-admin/hr-staff/${hrStaffId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting HR staff with ID ${hrStaffId}:`, error);
    throw error;
  }
};

/**
 * Search HR staff members
 */
export const searchHRStaff = async (searchTerm, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    const response = await axios.get('/org-admin/hr-staff/search', {
      params: { searchTerm, page, size, sortBy, sortDir }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching HR staff:', error);
    throw error;
  }
};

/**
 * Get HR staff count
 */
export const getHRStaffCount = async () => {
  try {
    const response = await axios.get('/org-admin/hr-staff/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching HR staff count:', error);
    throw error;
  }
};

/**
 * Validate HR staff data before submission
 */
export const validateHRStaffData = (data) => {
  const errors = {};

  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email format is invalid';
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone number is required';
  }

  if (!data.designation || !data.designation.trim()) {
    errors.designation = 'Designation is required';
  }

  if (!data.departmentId) {
    errors.departmentId = 'Department is required';
  }

  if (!data.basicSalary) {
    errors.basicSalary = 'Basic salary is required';
  } else if (parseFloat(data.basicSalary) <= 0) {
    errors.basicSalary = 'Basic salary must be greater than 0';
  }

  if (!data.dateOfJoining) {
    errors.dateOfJoining = 'Date of joining is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format HR staff data for API submission
 */
export const formatHRStaffForAPI = (formData) => {
  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    designation: formData.designation.trim(),
    departmentId: parseInt(formData.departmentId),
    basicSalary: parseFloat(formData.basicSalary),
    dateOfJoining: formData.dateOfJoining,
    salaryType: formData.salaryType || 'MONTHLY',
    isActive: formData.isActive !== undefined ? formData.isActive : true
  };
};

/**
 * Transform API response for frontend display
 */
/**
 * Transform HR staff response data for frontend use
 * Now accepts departments list to resolve department names
 */
export const transformHRStaffResponse = (staff, departments = []) => {
  // Try to get department name from staff data first
  let departmentName = staff.departmentName;
  
  // If not available, try to find from departments list
  if (!departmentName && staff.departmentId && departments.length > 0) {
    const dept = departments.find(d => d.id === staff.departmentId || d.id === parseInt(staff.departmentId));
    departmentName = dept ? dept.name : null;
  }
  
  // If still not available, try department object if exists
  if (!departmentName && staff.department) {
    departmentName = staff.department.name;
  }

  return {
    id: staff.id,
    odooEmployeeId: staff.odooEmployeeId,
    firstName: staff.firstName || '',
    lastName: staff.lastName || '',
    email: staff.email || '',
    phone: staff.phone || staff.mobilePhone || '',
    designation: staff.designation || staff.jobTitle || '',
    departmentId: staff.departmentId,
    departmentName: departmentName || 'Unknown Department',
    employeeCode: staff.employeeCode || staff.workEmail || 'N/A',
    basicSalary: staff.basicSalary || staff.wage || 0,
    salaryType: staff.salaryType || 'MONTHLY',
    dateOfJoining: staff.dateOfJoining || staff.hireDate || '',
    isActive: staff.isActive !== undefined ? staff.isActive : true,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
    // Formatted fields for display
    formattedSalary: `Rs. ${(staff.basicSalary || staff.wage || 0).toLocaleString()}`,
    formattedDateOfJoining: staff.dateOfJoining 
      ? new Date(staff.dateOfJoining).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A',
    statusDisplay: staff.isActive ? 'Active' : 'Inactive'
  };
};

export default {
  getAllHRStaff,
  getAllHRStaffNoPagination,
  getHRStaffById,
  createHRStaff,
  updateHRStaff,
  deleteHRStaff,
  searchHRStaff,
  getHRStaffCount,
  validateHRStaffData,
  formatHRStaffForAPI,
  transformHRStaffResponse
};