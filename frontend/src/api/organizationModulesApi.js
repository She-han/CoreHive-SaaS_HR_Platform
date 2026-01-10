import api from './axios';

/**
 * Organization Modules API
 * Handles organization-module subscription management
 */

/**
 * Get all modules for an organization
 */
export const getOrganizationModules = async (organizationUuid) => {
  const response = await api.get(`/api/organization-modules/${organizationUuid}`);
  return response.data;
};

/**
 * Get enabled modules for an organization
 */
export const getEnabledModules = async (organizationUuid) => {
  const response = await api.get(`/api/organization-modules/${organizationUuid}/enabled`);
  return response.data;
};

/**
 * Subscribe organization to a module (SYS_ADMIN only)
 */
export const subscribeToModule = async (organizationUuid, moduleId) => {
  const response = await api.post(`/api/organization-modules/${organizationUuid}/subscribe/${moduleId}`);
  return response.data;
};

/**
 * Unsubscribe organization from a module (SYS_ADMIN only)
 */
export const unsubscribeFromModule = async (organizationUuid, moduleId) => {
  const response = await api.post(`/api/organization-modules/${organizationUuid}/unsubscribe/${moduleId}`);
  return response.data;
};

/**
 * Sync organization modules with organization boolean flags
 */
export const syncOrganizationModules = async (organizationUuid) => {
  const response = await api.post(`/api/organization-modules/${organizationUuid}/sync`);
  return response.data;
};

/**
 * Get subscription count for a specific module (SYS_ADMIN only)
 */
export const getModuleSubscriptionCount = async (moduleId) => {
  const response = await api.get(`/api/organization-modules/module/${moduleId}/subscription-count`);
  return response.data;
};

export default {
  getOrganizationModules,
  getEnabledModules,
  subscribeToModule,
  unsubscribeFromModule,
  syncOrganizationModules,
  getModuleSubscriptionCount,
};
