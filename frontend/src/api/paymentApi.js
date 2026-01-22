
import { apiGet, apiPost } from './axios';

/**
 * Payment API Functions
 */

/**
 * Initiate subscription payment
 */
export const initiatePayment = async (organizationUuid, userEmail) => {
  try {
    console.log('🔄 Initiating payment for organization:', organizationUuid);
    
    const response = await apiPost('/payment/initiate', {
      organizationUuid,
      userEmail
    });
    
    if (response.success) {
      console.log('✅ Payment initiated successfully');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to initiate payment:', error);
    throw error;
  }
};

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async (organizationUuid) => {
  try {
    console.log('🔄 Fetching subscription status for:', organizationUuid);
    
    const response = await apiGet(`/payment/subscription/status/${organizationUuid}`);
    
    if (response.success) {
      console.log('✅ Subscription status retrieved');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Verify payment completion (used after redirect)
 */
export const verifyPayment = async (orderId) => {
  try {
    console.log('🔄 Verifying payment for order:', orderId);
    
    const response = await apiGet(`/payment/verify/${orderId}`);
    
    return response;
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    throw error;
  }
};