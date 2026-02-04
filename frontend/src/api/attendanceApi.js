import apiClient from "./axios";

export const getTodayAttendance = async () => {
  const res = await apiClient.get("/attendance/today");
  return res.data;
};

export const getAttendanceHistory = async (startDate, endDate) => {
  const res = await apiClient.get("/attendance/history", {
    params: { startDate, endDate }
  });
  return res.data;
};

// Preview summary report
export const getAttendanceSummaryReport = async (startDate, endDate) => {
  const res = await apiClient.get("/attendance/report/summary", {
    params: { startDate, endDate }
  });
  return res.data.data;
};

// Download summary excel
export const downloadSummaryExcel = async (startDate, endDate) => {
  const res = await apiClient.get(
    "/attendance/report/summary/excel",
    {
      params: { startDate, endDate },
      responseType: "blob" // VERY IMPORTANT
    }
  );
  return res.data;
};

// Preview employee detail
export const getEmployeeAttendanceDetail = async (
  employeeId,
  startDate,
  endDate
) => {
  const res = await apiClient.get(
    `/attendance/report/details/${employeeId}`,
    { params: { startDate, endDate } }
  );
  return res.data.data;
};

// Download employee detail excel
export const downloadDetailExcel = async (
  employeeId,
  startDate,
  endDate
) => {
  const res = await apiClient.get(
    `/attendance/report/details/${employeeId}/excel`,
    {
      params: { startDate, endDate },
      responseType: "blob"
    }
  );
  return res.data;
};