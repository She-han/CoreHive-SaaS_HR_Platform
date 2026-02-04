import apiClient from "./axios";

/**
 * Get attendance summary for a date
 */
export const getAttendanceSummary = async (date) => {
  try {
    const response = await apiClient.get(`/attendance/summary?date=${date}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

/**
 * Get attendance list for a single date
 */
export const getAttendanceByDate = async (date) => {
  try {
    const response = await apiClient.get(`/attendance?date=${date}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};
