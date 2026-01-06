import { apiGet, apiPut } from './axios';

/**
 * Organization Management API
 * For System Admin organization operations
 */
const ORG_ENDPOINTS = {
  ALL_ORGANIZATIONS: '/sys_admin/organizations',
  ORGANIZATION_DETAILS: (uuid) => `/sys_admin/organizations/${uuid}`,
  CHANGE_STATUS: (uuid) => `/sys_admin/organizations/${uuid}/status`,
  APPROVE: (uuid) => `/sys_admin/organizations/${uuid}/approve`,
  REJECT: (uuid) => `/sys_admin/organizations/${uuid}/reject`
};

/**
 * Get All Organizations with Pagination and Filtering
 * @param {Object} params - Query parameters
 * @returns {Promise} Paginated organizations
 */
export const getAllOrganizations = async (params = {}) => {
  try {
    console.log('📋 Fetching organizations with params:', params);

    const queryParams = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      sortDir: params.sortDir ?? 'desc',
      ...params
    });

    const response = await apiGet(
      `${ORG_ENDPOINTS.ALL_ORGANIZATIONS}?${queryParams}`
    );

    if (response?.success) {
      console.log(
        `✅ Retrieved ${response.data?.numberOfElements ?? 0} organizations`
      );
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to fetch organizations:', error);
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
    console.log('🔍 Fetching organization details:', organizationUuid);

    const response = await apiGet(
      ORG_ENDPOINTS.ORGANIZATION_DETAILS(organizationUuid)
    );

    if (response?.success) {
      console.log('✅ Organization details retrieved');
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to fetch organization details:', error);
    throw error;
  }
};

/**
 * Change Organization Status
 * @param {string} organizationUuid - Organization UUID
 * @param {string} newStatus - New status
 * @returns {Promise} API response
 */
export const changeOrganizationStatus = async (
  organizationUuid,
  newStatus
) => {
  try {
    console.log(
      `🔄 Changing status for ${organizationUuid} to ${newStatus}`
    );

    const response = await apiPut(
      `${ORG_ENDPOINTS.CHANGE_STATUS(organizationUuid)}?status=${newStatus}`
    );

    if (response?.success) {
      console.log('✅ Status changed successfully');
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to change status:', error);
    throw error;
  }
};

/**
 * Approve Organization
 * @param {string} organizationUuid - Organization UUID
 * @returns {Promise} API response
 */
export const approveOrganization = async (organizationUuid) => {
  try {
    console.log('✅ Approving organization:', organizationUuid);

    const response = await apiPut(
      ORG_ENDPOINTS.APPROVE(organizationUuid)
    );

    if (response?.success) {
      console.log('✅ Organization approved successfully');
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to approve organization:', error);
    throw error;
  }
};

/**
 * Reject Organization
 * @param {string} organizationUuid - Organization UUID
 * @returns {Promise} API response
 */
export const rejectOrganization = async (organizationUuid) => {
  try {
    console.log('❌ Rejecting organization:', organizationUuid);

    const response = await apiPut(
      ORG_ENDPOINTS.REJECT(organizationUuid)
    );

    if (response?.success) {
      console.log('✅ Organization rejected successfully');
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to reject organization:', error);
    throw error;
  }
};

export default {
  getAllOrganizations,
  getOrganizationDetails,
  changeOrganizationStatus,
  approveOrganization,
  rejectOrganization
};
