import axios from "axios";

const BASE = "http://localhost:8080/api/attendance";

export const getCheckInList = async (token) => {
  return axios
    .get(`${BASE}/check-in/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const manualCheckIn = async (employeeId, token) => {
  return axios
    .post(`${BASE}/check-in/${employeeId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const getPendingCheckouts = async (token) => {
  return axios
    .get(`${BASE}/check-out/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

export const manualCheckOut = async (employeeId, token) => {
  return axios.post(
    `${BASE}/check-out/${employeeId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(res => res.data.data); // ✅ RETURN DTO ONLY
};

export const getTodayAttendance = async (token) => {
  return axios.get(
    `${BASE}/today-all`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(res => res.data);
};

export const updateAttendanceStatus = async (employeeId, status, token) => {
  return axios.put(
    `${BASE}/status/${employeeId}`,
    { status },
    { headers:
         { Authorization: `Bearer ${token}` }  }
  ).then(res => res.data.data);
};


