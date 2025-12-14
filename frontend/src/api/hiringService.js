import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) GET ALL Hiring-posts
export const getAllJobPostings = async (page , size  , token) => {
   return axios
  .get(`${BASE}/orgs/job-postings?page=${page}&size=${size}` , 
     {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    }
  ).then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
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
