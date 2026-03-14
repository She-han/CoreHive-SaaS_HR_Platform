import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const fetchPublicJobs = async (page = 0, size = 9) => {
  const res = await axios.get(`${BASE}/public/jobs?page=${page}&size=${size}`);
  return res.data.data;
};
