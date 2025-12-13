import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) GET ALL Hiring-posts
export const getAllJobPostings = async (orgUuid, page = 0, size = 3) => {
  const res = await axios.get(`${BASE}/orgs/${orgUuid}/job-postings?page=${page}&size=${size}`)
     console.log("Job API response:", res.data);    
    return res.data.data; // return the full data object, not just items
};

//2) Delete job posting
export const deleteJobPosting = async (id) => {
  return axios.delete(`${BASE}/job-postings/${id}`);
};