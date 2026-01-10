import api from './axios';

/**
 * Billing Plans API
 * Handles billing plan operations
 */

/**
 * Get all billing plans
 */
export const getAllBillingPlans = async () => {
  const response = await api.get('/billing-plans');
  return response.data;
};

/**
 * Get a specific billing plan by ID
 */
export const getBillingPlanById = async (planId) => {
  const response = await api.get(`/billing-plans/${planId}`);
  return response.data;
};

export default {
  getAllBillingPlans,
  getBillingPlanById,
};
