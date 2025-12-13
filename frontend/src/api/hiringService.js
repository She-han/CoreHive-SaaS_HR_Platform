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

//3)Create a Job posting
export const createJobPosting = async (formData) => {
  const res = await axios.post(
    `${BASE}/job-postings`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

/* =========================
   DEPARTMENTS
========================= */

// 4) GET all departments
export const getAllDepartments = async () => {
  const res = await axios.get(`${BASE}/org-admin/departments`);
  return res.data; // ApiResponse
};
