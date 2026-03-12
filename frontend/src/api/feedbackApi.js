import apiClient from './axios';

/**
 * Submit employee feedback (max 3 per month)
 */
export const submitFeedback = async (feedbackData) => {
  const response = await apiClient.post('/employee/employee-feedback', feedbackData);
  return response.data;
};

/**
 * Get own feedbacks (for employee)
 */
export const getOwnFeedbacks = async () => {
  const response = await apiClient.get('/employee/employee-feedback');
  return response.data;
};

/**
 * Get all feedbacks for organization (HR/Admin)
 */
export const getAllFeedbacks = async () => {
  const response = await apiClient.get('/hr-staff/employee-feedbacks');
  return response.data;
};

/**
 * Mark feedback as read (HR/Admin)
 */
export const markFeedbackAsRead = async (feedbackId) => {
  const response = await apiClient.put(`/hr-staff/employee-feedbacks/${feedbackId}/mark-read`);
  return response.data;
};

/**
 * Reply to feedback (HR/Admin)
 */
export const replyToFeedback = async (feedbackId, reply) => {
  const response = await apiClient.put(`/hr-staff/employee-feedbacks/${feedbackId}/reply`, { reply });
  return response.data;
};
