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
