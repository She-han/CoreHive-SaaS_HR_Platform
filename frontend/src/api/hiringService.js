import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) GET ALL Hiring-posts
export const getAllJobPostings = async () => {
  const res = await axios.get(`${BASE}/job-postings`);

  // IMPORTANT: return the correct array
  return Array.isArray(res.data) ? res.data : [];
};

//2) Delete job posting
export const deleteJobPosting = async (id) => {
  return axios.delete(`${BASE}/job-postings/${id}`);
};