import apiClient from './axios';

// Get current module configuration (ORG_ADMIN only)
export const getModuleConfig = async () => {
  try {
    const response = await apiClient.get('/org-admin/modules');
    return response.data;
  } catch (error) {
    console.error('Error fetching module config:', error);
    throw error;
  }
};

// Update module configuration (ORG_ADMIN only)
export const updateModuleConfig = async (config) => {
  try {
    const response = await apiClient.put('/org-admin/modules', config);
    return response.data;
  } catch (error) {
    console.error('Error updating module config:', error);
    throw error;
  }
};

// Get organization modules status (HR_STAFF and ORG_ADMIN can access)
export const getOrganizationModules = async () => {
  try {
    const response = await apiClient.get('/hr-staff/modules/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching organization modules:', error);
    throw error;
  }
};

export default {
  getModuleConfig,
  updateModuleConfig,
  getOrganizationModules
};