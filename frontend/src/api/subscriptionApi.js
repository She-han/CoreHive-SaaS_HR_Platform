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
 * Change subscription plan
 */
export const changePlan = async (organizationUuid, planId) => {
  try {
    const response = await axios.put(`/subscription/plan/${organizationUuid}`, {
      planId
    });
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

export default {
  checkSubscription,
  getSubscriptionDetails,
  cancelSubscription,
  changePlan,
  getAvailablePlans
};
