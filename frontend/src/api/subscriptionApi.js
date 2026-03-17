import axios from './axios';

/**
 * Subscription API Service
 * Handles all API calls for subscription management (ORG_ADMIN only)
 */

/**
 * Check if organization has subscription
 */
export const checkSubscription = async (organizationUuid) => {
  try {
    const response = await axios.get(`/subscription/check/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
};

/**
 * Get subscription details with transaction history
 */
export const getSubscriptionDetails = async (organizationUuid) => {
  try {
    const response = await axios.get(`/subscription/details/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (organizationUuid) => {
  try {
    const response = await axios.post(`/subscription/cancel/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate subscription
 */
export const reactivateSubscription = async (organizationUuid) => {
  try {
    const response = await axios.post(`/subscription/reactivate/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Change subscription plan
 */
export const changePlan = async (
  organizationUuid,
  planId,
  customModules = [],
  totalPrice = null,
  applyOnNextBilling = false
) => {
  try {
    const requestBody = {
      planId,
      customModules,
      applyOnNextBilling
    };
    
    // Add totalPrice if provided (for Custom plans with selected modules)
    if (totalPrice !== null) {
      requestBody.totalPrice = totalPrice;
    }
    
    const response = await axios.put(`/subscription/plan/${organizationUuid}`, requestBody);
    return response.data;
  } catch (error) {
    console.error('Error changing plan:', error);
    throw error;
  }
};

/**
 * Get available billing plans
 */
export const getAvailablePlans = async () => {
  try {
    const response = await axios.get('/subscription/plans');
    return response.data;
  } catch (error) {
    console.error('Error getting available plans:', error);
    throw error;
  }
};

/**
 * Fallback: Get active plans from public billing plans endpoint
 */
export const getPublicActiveBillingPlans = async () => {
  try {
    const response = await axios.get('/billing-plans/active');
    return response.data;
  } catch (error) {
    console.error('Error getting public active billing plans:', error);
    throw error;
  }
};

/**
 * Fallback: Get all plans from public billing plans endpoint
 */
export const getPublicBillingPlans = async () => {
  try {
    const response = await axios.get('/billing-plans');
    return response.data;
  } catch (error) {
    console.error('Error getting public billing plans:', error);
    throw error;
  }
};

/**
 * Activate subscription with 30-day trial
 */
export const activateSubscription = async (organizationUuid) => {
  try {
    const response = await axios.post(`/subscription/activate/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
  }
};

/**
 * Get organization billing information
 */
export const getOrganizationBillingInfo = async (organizationUuid) => {
  try {
    const response = await axios.get(`/subscription/billing-info/${organizationUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error getting billing info:', error);
    throw error;
  }
};

export default {
  checkSubscription,
  getSubscriptionDetails,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  getAvailablePlans,
  getPublicActiveBillingPlans,
  getPublicBillingPlans,
  activateSubscription,
  getOrganizationBillingInfo
};
