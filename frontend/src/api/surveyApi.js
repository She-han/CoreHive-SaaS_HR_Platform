import apiClient from './axios';

// Employee survey endpoints
export const getActiveSurveys = async () => {
  const response = await apiClient.get('/employee/surveys/active');
  return response.data;
};

export const getSurveyDetails = async (surveyId) => {
  const response = await apiClient.get(`/employee/surveys/${surveyId}`);
  return response.data;
};

export const submitSurveyResponse = async (surveyId, answers) => {
  const response = await apiClient.post(`/employee/surveys/${surveyId}/respond`, { answers });
  return response.data;
};

export const hasResponded = async (surveyId) => {
  const response = await apiClient.get(`/employee/surveys/${surveyId}/has-responded`);
  return response.data;
};





