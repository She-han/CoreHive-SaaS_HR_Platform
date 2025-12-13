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



//2)MARK AS DEACTIVE EMPLOYEE
export const deactivateEmployee = async (id , token) => {

return axios 
    .put(`${BASE}/orgs/employees/${id}/deactivate` , 
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

