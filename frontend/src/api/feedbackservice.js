import axios from "axios";

// Base URL for survey-related APIs
const BASE = "http://localhost:8080/api/orgs/surveys";

// ============================
// SURVEYS
// ============================

/**
 * Fetch all surveys for the organization.
 * The backend extracts org info from the token.
 * @param {string} token - JWT token containing orgUuid
 * @returns {Array} list of surveys
 */
export const listSurveys = async (token) => {
  return axios
    .get(`${BASE}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Fetch details of a single survey by its ID.
 * @param {string} surveyId - ID of the survey
 * @param {string} token - JWT token
 * @returns {Object} survey details
 */
export const getSurveyDetails = async (surveyId, token) => {
  return axios
    .get(`${BASE}/${surveyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Create a new survey.
 * @param {Object} surveyData - survey payload (title, description, etc.)
 * @param {string} token - JWT token
 * @returns {Object} newly created survey
 */
export const createSurvey = async (surveyData, token) => {
  return axios
    .post(`${BASE}`, surveyData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Delete a survey by its ID.
 * @param {string} surveyId - ID of the survey
 * @param {string} token - JWT token
 * @returns {Object} deletion response
 */
export const deleteSurvey = async (surveyId, token) => {
  return axios
    .delete(`${BASE}/${surveyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

// ============================
// QUESTIONS
// ============================

/**
 * Get all questions of a specific survey.
 * @param {string} surveyId - survey ID
 * @param {string} token - JWT token
 * @returns {Array} list of questions
 */
export const getSurveyQuestions = async (surveyId, token) => {
  return axios
    .get(`${BASE}/${surveyId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Update questions for a specific survey.
 * @param {string} surveyId - survey ID
 * @param {Object} dto - data transfer object containing questions update
 * @param {string} token - JWT token
 * @returns {Array} updated questions
 */
export const updateSurveyQuestions = async (surveyId, dto, token) => {
  return axios
    .put(`${BASE}/${surveyId}/questions`, dto, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

// ============================
// RESPONSES
// ============================

/**
 * Get basic responses for a survey.
 * @param {string} surveyId - survey ID
 * @param {string} token - JWT token
 * @returns {Array} survey responses
 */
export const getSurveyResponses = async (surveyId, token) => {
  return axios
    .get(`${BASE}/${surveyId}/responses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Get all responses for analytics (detailed view).
 * @param {string} surveyId - survey ID
 * @param {string} token - JWT token
 * @returns {Array} all responses
 */
export const getAllResponsesForSurvey = async (surveyId, token) => {
  return axios
    .get(`${BASE}/${surveyId}/responses/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};

/**
 * Get detailed responses per question/user.
 * @param {string} surveyId - survey ID
 * @param {string} token - JWT token
 * @returns {Array} detailed response data
 */
export const getResponseDetails = async (surveyId, token) => {
  return axios
    .get(`${BASE}/${surveyId}/responses/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.data.data)
    .catch(err => {
      throw new Error(err.response?.data?.message || err.message);
    });
};
