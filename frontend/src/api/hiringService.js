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
export async function createJobPosting(data, token) {
  return axios.post(
    `${BASE}/orgs/job-postings`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  )
  .then(res => res.data)
  .catch(err => {
    throw new Error(err.response?.data?.message || err.message);
  });
}

// 4) GET ONE JOB-POSTING BY ID
export async function getSingleJobPosting(id , token) {
  if (!id) {
    throw new Error("Job-Posting ID is required");
  }
  return axios
    .get(`${BASE}/orgs/job-postings/${id}` , 
      {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    })
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}
