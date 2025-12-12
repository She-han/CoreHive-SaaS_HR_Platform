import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) GET ALL EMPLOYEES
export default async function getAllEmployees(orgUuid) {
  return axios
    .get(`${BASE}/orgs/${orgUuid}/employees`)
    .then((res) => res.data.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}


