import apiClient from "./axios";

/**
 * HR Reports API Service
 * Handles all HR report related API calls
 */

/**
 * Get Headcount Report
 */
export const getHeadcountReport = async () => {
  try {
    const response = await apiClient.get("/reports/headcount");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching headcount report:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch headcount report"
    );
  }
};

/**
 * Get Monthly Employee Attendance & Hiring Report
 */
export const getMonthlyEmployeeReport = async (month, year) => {
  if (!month || !year) {
    throw new Error("Month and Year are required");
  }

  try {
    const response = await apiClient.get(
      "/reports/monthly/employee-growth",
      { params: { month, year } }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching monthly HR report:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch monthly HR report"
    );
  }
};

/**
 * Get Annual Employee Growth Report
 */
export const getAnnualEmployeeGrowthReport = async (year) => {
  if (!year) {
    throw new Error("Year is required");
  }

  try {
    const response = await apiClient.get(
      "/reports/annual/employee-growth",
      { params: { year } }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching annual HR report:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch annual HR report"
    );
  }
};

export default {
  getHeadcountReport,
  getMonthlyEmployeeReport,
  getAnnualEmployeeGrowthReport,
};
