import { apiGet, apiPut } from './axios';

/**
 * System Admin API Calls
 * Platform level admin operations
 */

const ADMIN_ENDPOINTS = {
  PENDING_APPROVALS: '/sys_admin/organizations/pending',
  ALL_ORGANIZATIONS: '/sys_admin/organizations',
  ORGANIZATION_DETAILS: (uuid) => `/sys_admin/organizations/${uuid}`,
  APPROVE_ORG: (uuid) => `/sys_admin/organizations/${uuid}/approve`,
  REJECT_ORG: (uuid) => `/sys_admin/organizations/${uuid}/reject`,
  CHANGE_STATUS: (uuid) => `/sys_admin/organizations/${uuid}/status`,
  PLATFORM_STATS: '/sys_admin/statistics'
};

/**
 * Get Pending Organization Approvals
 * @returns {Promise} List of pending organizations
 */
export const getPendingApprovals = async () => {
  try {
    console.log(' Fetching pending organization approvals');
    
    const response = await apiGet(ADMIN_ENDPOINTS.PENDING_APPROVALS);
    
    if (response.success) {
      console.log(` Found ${response.data?.length || 0} pending organizations`);
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to fetch pending approvals:', error);
    throw error;
  }
};

/**
 * Get Organization Details by UUID
 * @param {string} organizationUuid - Organization UUID
 * @returns {Promise} Organization details
 */
export const getOrganizationDetails = async (organizationUuid) => {
  try {
    console.log('Fetching organization details:', organizationUuid);
    
    const response = await apiGet(ADMIN_ENDPOINTS.ORGANIZATION_DETAILS(organizationUuid));
    
    if (response.success) {
      console.log(' Organization details retrieved successfully');
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to fetch organization details:', error);
    throw error;
  }
};

/**
 * Approve Organization Registration
 * @param {string} organizationUuid - Organization UUID to approve
 * @returns {Promise} API response
 */
export const approveOrganization = async (organizationUuid) => {
  try {
    console.log('Approving organization:', organizationUuid);
    
    const response = await apiPut(ADMIN_ENDPOINTS.APPROVE_ORG(organizationUuid));
    
    if (response.success) {
      console.log(' Organization approved successfully');
    } else {
      console.warn(' Organization approval failed:', response.message);
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to approve organization:', error);
    
    // Extract error message from response if available
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * Reject Organization Registration
 * @param {string} organizationUuid - Organization UUID to reject
 * @returns {Promise} API response
 */
export const rejectOrganization = async (organizationUuid) => {
  try {
    console.log(' Rejecting organization:', organizationUuid);
    
    const response = await apiPut(ADMIN_ENDPOINTS.REJECT_ORG(organizationUuid));
    
    if (response.success) {
      console.log(' Organization rejected successfully');
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to reject organization:', error);
    throw error;
  }
};

/**
 * Get All Organizations with Pagination
 * @param {Object} params - Query parameters (page, size, sort, etc.)
 * @returns {Promise} Paginated organizations list
 */
export const getAllOrganizations = async (params = {}) => {
  try {
    console.log(' Fetching all organizations with params:', params);
    
    const queryParams = new URLSearchParams({
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc',
      ...params
    });
    
    const response = await apiGet(`${ADMIN_ENDPOINTS.ALL_ORGANIZATIONS}?${queryParams}`);
    
    if (response.success) {
      console.log(` Retrieved ${response.data?.numberOfElements || 0} organizations`);
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to fetch organizations:', error);
    throw error;
  }
};

/**
 * Change Organization Status
 * @param {string} organizationUuid - Organization UUID
 * @param {string} newStatus - New status (ACTIVE, DORMANT, SUSPENDED)
 * @returns {Promise} API response
 */
export const changeOrganizationStatus = async (organizationUuid, newStatus) => {
  try {
    console.log(`🔄 Changing organization ${organizationUuid} status to:`, newStatus);
    
    const response = await apiPut(
      `${ADMIN_ENDPOINTS.CHANGE_STATUS(organizationUuid)}?status=${newStatus}`
    );
    
    if (response.success) {
      console.log(' Organization status changed successfully');
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to change organization status:', error);
    throw error;
  }
};

/**
 * Get Platform Statistics
 * @returns {Promise} Platform statistics data
 */
export const getPlatformStatistics = async () => {
  try {
    console.log('📈 Fetching platform statistics');
    
    const response = await apiGet(ADMIN_ENDPOINTS.PLATFORM_STATS);
    
    if (response.success) {
      console.log(' Platform statistics retrieved');
    }
    
    return response;
  } catch (error) {
    console.error(' Failed to fetch platform statistics:', error);
    throw error;
  }
};