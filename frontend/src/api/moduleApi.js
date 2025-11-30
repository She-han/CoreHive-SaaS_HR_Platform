import apiClient from './axios';

// Get current module configuration
export const getModuleConfig = async () => {
  try {
    const response = await apiClient.get('/org-admin/modules');
    return response.data;
  } catch (error) {
    console.error('Error fetching module config:', error);
    throw error;
  }
};

// Update module configuration
export const updateModuleConfig = async (config) => {
  try {
    const response = await apiClient.put('/org-admin/modules', config);
    return response.data;
  } catch (error) {
    console.error('Error updating module config:', error);
    throw error;
  }
};