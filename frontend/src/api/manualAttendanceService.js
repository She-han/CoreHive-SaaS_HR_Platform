import axios from "axios";
import apiClient from "./axios";

const BASE = "http://localhost:8080/api/attendance";

export const getCheckInList = async (token, date = null) => {
  const params = date ? { date } : {};
  return axios
    .get(`${BASE}/check-in/list`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const manualCheckIn = async (employeeId, token, manualTime = null, date = null) => {
  const payload = { 
    ...(manualTime && { manualTime }),
    ...(date && { date })
  };
  return axios
    .post(
      `${BASE}/check-in/${employeeId}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const getPendingCheckouts = async (token) => {
  return axios
    .get(`${BASE}/check-out/list`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const manualCheckOut = async (employeeId, token, manualTime = null, date = null) => {
  const payload = { 
    ...(manualTime && { manualTime }),
    ...(date && { date })
  };
  return axios
    .post(
      `${BASE}/check-out/${employeeId}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => res.data.data); // ✅ RETURN DTO ONLY
};

export const getTodayAttendance = async (token, date = null) => {
  const params = date ? { date } : {};
  return axios
    .get(`${BASE}/check-out/today`, { 
      params,
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then((res) => res.data.data);
};

export const updateAttendanceStatus = async (
  employeeId,
  status,
  checkInTime,
  token
) => {
  return axios
    .put(
      `${BASE}/status/${employeeId}`,
      { status, checkInTime }, // ✅ send optional time
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => res.data.data);
};

/**
 * Get total count of on-leave employees for the organization
 */
export const getTotalOnLeaveCount = async () => {
  try {
    const response = await apiClient.get("/attendance/today/on-leave-count");
    return response.data.data; // matches your original res.data.data
  } catch (error) {
    console.error("Error when get total-on-leave-count of employees:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

/**
 * Update attendance record (edit check-in/check-out times and status)
 */
export const updateAttendanceRecord = async (
  employeeId,
  date,
  checkInTime,
  checkOutTime,
  status,
  token
) => {
  return axios
    .put(
      `${BASE}/update`,
      {
        employeeId,
        date,
        checkInTime,
        checkOutTime,
        status,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => res.data.data);
};
