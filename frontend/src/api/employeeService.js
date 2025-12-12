import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) GET ALL EMPLOYEES
export  async function getAllEmployees(orgUuid) {
  return axios
    .get(`${BASE}/orgs/${orgUuid}/employees`)
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}


//2)MARK AS DEACTIVE EMPLOYEE
export const deactivateEmployee = async (orgUuid, id) => {

return axios 
    .put(`${BASE}/orgs/${orgUuid}/employees/${id}/deactivate`)
    .then((res)=>res.data.data)
    .catch((err)=>{
        throw new Error(err.response?.data?.message || err.message);
    });

};

