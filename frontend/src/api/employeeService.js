import axios from "axios";

const BASE =  "http://localhost:8080/api";




// 1) GET ALL EMPLOYEES
export async function getAllEmployees(page = 0, size = 9 , token) {
  return axios
    .get(`${BASE}/orgs/employees?page=${page}&size=${size}` , 
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

// In HTTP (and Spring Boot), every request can have 3 main parts:
// URL (path & query params)
// Headers (Authorization, Content-Type, etc.)
// Body --> In this body is null

//2)MARK AS DEACTIVE EMPLOYEE
export const deactivateEmployee = async (id , token) => {

return axios 
    .put(`${BASE}/orgs/employees/${id}/deactivate` ,  null , 
      {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    )
    .then((res)=>res.data.data)
    .catch((err)=>{
        throw new Error(err.response?.data?.message || err.message);
    });

};

//3) CREATE EMPLOYEE
export async function createEmployee(data, token) {
  return axios.post(
    `${BASE}/orgs/employees`,
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
