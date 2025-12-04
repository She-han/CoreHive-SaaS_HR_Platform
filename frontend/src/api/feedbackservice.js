import axios from "axios";

const BASE =  "http://localhost:8080/api";

// 1) LIST ALL SURVEYS
export async function listSurveys(orgUuid) {
  return axios
    .get(`${BASE}/orgs/${orgUuid}/surveys`)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}

// 2) CREATE SURVEY
export async function createSurvey(orgUuid, payload) {
  return axios
    .post(`${BASE}/orgs/${orgUuid}/surveys`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}

// 3) GET SINGLE SURVEY DETAILS
export async function getSurvey(orgUuid, id) {
  return axios
    .get(`${BASE}/orgs/${orgUuid}/surveys/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}

// 4) GET RESPONSES FOR SURVEY
export async function getResponses(orgUuid, id) {
  return axios
    .get(`${BASE}/orgs/${orgUuid}/surveys/${id}/responses`)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}

// 5) DELETE SURVEY
export async function deleteSurvey(orgUuid, id) {
  return axios
    .delete(`${BASE}/orgs/${orgUuid}/surveys/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response?.data?.message || err.message);
    });
}
