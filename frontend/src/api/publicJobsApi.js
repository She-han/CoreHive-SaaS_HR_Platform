import axios from "axios";

export const fetchPublicJobs = async (page = 0, size = 9) => {
  const res = await axios.get(
    `http://localhost:8080/api/public/jobs?page=${page}&size=${size}`
  );
  return res.data.data;
};
