import { apiGet, apiPost, apiPut, apiDelete } from './axios';

/**
 * Extended Modules API Calls
 * For managing extended modules (System Admin) and fetching active modules (Org Admin)
 */

const MODULES_ENDPOINTS = {
  ALL_MODULES: '/sys_admin/modules',
  ACTIVE_MODULES: '/modules/active',
  MODULE_DETAILS: (id) => `/sys_admin/modules/${id}`,
  TOGGLE_MODULE: (id) => `/sys_admin/modules/${id}/toggle`,
  DELETE_MODULE: (id) => `/sys_admin/modules/${id}`,
  MODULES_BY_CATEGORY: (category) => `/modules/category/${category}`
};

/**
 * Get all modules (System Admin only)
 * @returns {Promise} List of all modules
 */
export const getAllModules = async () => {
  try {
    console.log('📦 Fetching all extended modules');
    const response = await apiGet(MODULES_ENDPOINTS.ALL_MODULES);
    
    if (response.success) {
      console.log(`✅ Retrieved ${response.data?.length || 0} modules`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch all modules:', error);
    throw error;
  }
};

/**
 * Get active modules (Org Admin can access)
 * @returns {Promise} List of active modules
 */
export const getActiveModules = async () => {
  try {
    console.log('📦 Fetching active extended modules');
    const response = await apiGet(MODULES_ENDPOINTS.ACTIVE_MODULES);
    
    if (response.success) {
      console.log(`✅ Retrieved ${response.data?.length || 0} active modules`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch active modules:', error);
    throw error;
  }
};

/**
 * Get module by ID
 * @param {number} moduleId - Module ID
 * @returns {Promise} Module details
 */
export const getModuleById = async (moduleId) => {
  try {
    console.log('📦 Fetching module details:', moduleId);
    const response = await apiGet(MODULES_ENDPOINTS.MODULE_DETAILS(moduleId));
    
    if (response.success) {
      console.log('✅ Module details retrieved');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch module details:', error);
    throw error;
  }
};

/**
 * Create new module (System Admin only)
 * @param {Object} moduleData - Module data
 * @returns {Promise} Created module
 */
export const createModule = async (moduleData) => {
  try {
    console.log('📦 Creating new module:', moduleData.name);
    const response = await apiPost(MODULES_ENDPOINTS.ALL_MODULES, moduleData);
    
    if (response.success) {
      console.log('✅ Module created successfully');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to create module:', error);
    throw error;
  }
};

/**
 * Update module (System Admin only)
 * @param {number} moduleId - Module ID
 * @param {Object} moduleData - Updated module data
 * @returns {Promise} Updated module
 */
export const updateModule = async (moduleId, moduleData) => {
  try {
    console.log('📦 Updating module:', moduleId);
    const response = await apiPut(MODULES_ENDPOINTS.MODULE_DETAILS(moduleId), moduleData);
    
    if (response.success) {
      console.log('✅ Module updated successfully');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to update module:', error);
    throw error;
  }
};

/**
 * Toggle module active status (System Admin only)
 * @param {number} moduleId - Module ID
 * @returns {Promise} Updated module
 */
export const toggleModuleStatus = async (moduleId) => {
  try {
    console.log('📦 Toggling module status:', moduleId);
    const response = await apiPut(MODULES_ENDPOINTS.TOGGLE_MODULE(moduleId));
    
    if (response.success) {
      console.log('✅ Module status toggled successfully');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to toggle module status:', error);
    throw error;
  }
};

/**
 * Delete module (System Admin only)
 * @param {number} moduleId - Module ID
 * @returns {Promise} Delete confirmation
 */
export const deleteModule = async (moduleId) => {
  try {
    console.log('📦 Deleting module:', moduleId);
    const response = await apiDelete(MODULES_ENDPOINTS.DELETE_MODULE(moduleId));
    
    if (response.success) {
      console.log('✅ Module deleted successfully');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to delete module:', error);
    throw error;
  }
};

/**
 * Get modules by category
 * @param {string} category - Module category
 * @returns {Promise} List of modules in category
 */
export const getModulesByCategory = async (category) => {
  try {
    console.log('📦 Fetching modules by category:', category);
    const response = await apiGet(MODULES_ENDPOINTS.MODULES_BY_CATEGORY(category));
    
    if (response.success) {
      console.log(`✅ Retrieved ${response.data?.length || 0} modules for category: ${category}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch modules by category:', error);
    throw error;
  }
};
