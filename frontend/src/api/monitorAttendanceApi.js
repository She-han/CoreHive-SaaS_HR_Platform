import axios from "axios";

const BASE = "http://localhost:8080/api/attendance";

/**
 * Get attendance summary for a date
 */
export const getAttendanceSummary = async (date, token) => {
  return axios
    .get(`${BASE}/summary?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data);
};

/**
 * Get attendance list for a single date
 */
export const getAttendanceByDate = async (date, token) => {
  return axios
    .get(`${BASE}?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data || []);
};
