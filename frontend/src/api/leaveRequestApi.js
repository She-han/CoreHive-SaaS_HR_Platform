import axios from "axios";

const BASE = "http://localhost:8080/api/leave-requests";

/**
 * ============================================
 * GET ALL LEAVE REQUESTS (HR / ORG ADMIN)
 * ============================================
 */
export const getAllLeaveRequests = async (token) => {
  return axios
    .get(`${BASE}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};



/**
 * ============================================
 * APPROVE / REJECT LEAVE REQUEST (HR)
 * ============================================
 */
export const approveLeaveRequest = async (requestId, approve, token) => {
  return axios
    .put(
      `${BASE}/${requestId}/approve?approve=${approve}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};
