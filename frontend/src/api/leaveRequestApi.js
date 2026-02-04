import apiClient from "./axios";

/**
 * ============================================
 * GET ALL LEAVE REQUESTS (HR / ORG ADMIN)
 * ============================================
 */
export const getAllLeaveRequests = async () => {
  try {
    const response = await apiClient.get("/leave-requests");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

/**
 * ============================================
 * APPROVE / REJECT LEAVE REQUEST (HR)
 * ============================================
 */
export const approveLeaveRequest = async (requestId, approve) => {
  try {
    const response = await apiClient.put(
      `/leave-requests/${requestId}/approve?approve=${approve}`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Error approving/rejecting leave request:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};
