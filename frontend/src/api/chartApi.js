import apiClient from "./axios";

/**
 * Chart API Service
 * Handles all API calls for dashboard chart data
 */

/**
 * Get monthly attendance chart data
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (1-12)
 */
export const getMonthlyAttendanceChartData = async (year, month) => {
  try {
    const response = await apiClient.get("/attendance/monthly-chart-data", {
      params: { year, month }
    });
    return response.data; // Returns ApiResponse
  } catch (error) {
    console.error("Error fetching monthly attendance chart data:", error);
    throw error;
  }
};

/**
 * Get yearly employee growth chart data
 * @param {number} year - Year (e.g., 2026)
 */
export const getYearlyEmployeeGrowthChartData = async (year) => {
  try {
    const response = await apiClient.get("/employees/yearly-growth-chart-data", {
      params: { year }
    });
    return response.data; // Returns ApiResponse
  } catch (error) {
    console.error("Error fetching yearly employee growth chart data:", error);
    throw error;
  }
};

export default {
  getMonthlyAttendanceChartData,
  getYearlyEmployeeGrowthChartData
};