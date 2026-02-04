import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import * as surveyApi from '../../api/surveyApi';
import Swal from 'sweetalert2';
import { FaClipboardList, FaClock, FaCheckCircle } from 'react-icons/fa';

const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
};

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [respondedSurveys, setRespondedSurveys] = useState(new Set());

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const response = await surveyApi.getActiveSurveys();
      const activeSurveys = response.data || [];
      setSurveys(activeSurveys);
      
      // Check which surveys have been responded to
      const responded = new Set();
      for (const survey of activeSurveys) {
        try {
          const hasRespondedResponse = await surveyApi.hasResponded(survey.id);
          if (hasRespondedResponse.data === true) {
            responded.add(survey.id);
          }
        } catch (error) {
          console.error(`Error checking response for survey ${survey.id}:`, error);
        }
      }
      setRespondedSurveys(responded);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load surveys',
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = async (survey) => {
    try {
      setLoading(true);
      const response = await surveyApi.getSurveyDetails(survey.id);
      const surveyData = response.data;
      
      setSelectedSurvey(surveyData);
      setSurveyQuestions(surveyData.questions || []);
      setAnswers({});
      setIsModalOpen(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load survey questions',
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answerText: type === 'TEXT' ? value : null,
        selectedOption: type === 'MCQ' || type === 'RATING' ? value : null,
      }
    }));
  };

  const handleSubmitSurvey = async () => {
    // Validate all questions are answered
    const unanswered = surveyQuestions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Survey',
        text: 'Please answer all questions before submitting',
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    try {
      setSubmitting(true);
      const answerList = Object.values(answers);
      await surveyApi.submitSurveyResponse(selectedSurvey.id, answerList);
      
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your response has been submitted successfully',
        confirmButtonColor: THEME.primary,
      });
      
      setIsModalOpen(false);
      setSelectedSurvey(null);
      setAnswers({});
      loadSurveys(); // Reload to update responded status
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'Failed to submit survey response',
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const parseOptions = (optionsJson) => {
    try {
      return JSON.parse(optionsJson);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading && surveys.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: THEME.dark }}>
            
            Feedback Surveys
          </h1>
          <p className="text-gray-600">
            Participate in surveys to help improve our workplace
          </p>
        </div>

        {/* Surveys List */}
        {surveys.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100 text-center">
            <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No active surveys available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surveys.map((survey) => {
              const hasResponded = respondedSurveys.has(survey.id);
              const expired = isExpired(survey.endDate);
              
              return (
                <div
                  key={survey.id}
                  className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
                    hasResponded 
                      ? 'border-green-300 bg-green-50' 
                      : expired 
                      ? 'border-gray-300 bg-gray-50' 
                      : 'border-blue-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold" style={{ color: THEME.dark }}>
                      {survey.title}
                    </h3>
                    {hasResponded && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <FaCheckCircle /> Completed
                      </span>
                    )}
                    {expired && !hasResponded && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Expired
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {survey.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <FaClock />
                      <span>Deadline: {formatDate(survey.endDate)}</span>
                    </div>
                    {survey.isAnonymous && (
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                        Anonymous
                      </span>
                    )}
                  </div>

                  {!hasResponded && !expired ? (
                    <button
                      onClick={() => handleTakeSurvey(survey)}
                      className="w-full py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: THEME.primary }}
                    >
                      Take Survey
                    </button>
                  ) : hasResponded ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Already Submitted
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-red-300 text-red-700 rounded-lg font-medium cursor-not-allowed"
                    >
                      Survey Expired
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Survey Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            if (!submitting) {
              setIsModalOpen(false);
              setSelectedSurvey(null);
              setAnswers({});
            }
          }}
          title={selectedSurvey?.title || 'Survey'}
          size="xl"
        >
          {selectedSurvey && (
            <div className="space-y-6">
              <p className="text-gray-600 border-l-4 pl-4 py-2" style={{ borderColor: THEME.primary }}>
                {selectedSurvey.description}
              </p>

              {/* Questions */}
              <div className="space-y-6">
                {surveyQuestions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 p-5 rounded-lg">
                    <label className="block text-sm font-semibold mb-3" style={{ color: THEME.dark }}>
                      {index + 1}. {question.questionText}
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    {/* TEXT Question */}
                    {question.questionType === 'TEXT' && (
                      <textarea
                        rows="4"
                        value={answers[question.id]?.answerText || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, 'TEXT')}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
                      />
                    )}

                    {/* RATING Question */}
                    {question.questionType === 'RATING' && (
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label
                            key={rating}
                            className={`flex-1 text-center py-3 px-4 border-2 rounded-lg cursor-pointer transition-all ${
                              answers[question.id]?.selectedOption === rating.toString()
                                ? 'border-[#02C39A] bg-[#02C39A] text-white'
                                : 'border-gray-300 hover:border-[#02C39A]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`rating-${question.id}`}
                              value={rating}
                              checked={answers[question.id]?.selectedOption === rating.toString()}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value, 'RATING')}
                              className="hidden"
                            />
                            <div className="font-bold text-lg">{rating}</div>
                            <div className="text-xs mt-1">
                              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* MCQ Question */}
                    {question.questionType === 'MCQ' && (
                      <div className="space-y-2">
                        {parseOptions(question.options).map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              answers[question.id]?.selectedOption === option
                                ? 'border-[#02C39A] bg-green-50'
                                : 'border-gray-300 hover:border-[#02C39A]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`mcq-${question.id}`}
                              value={option}
                              checked={answers[question.id]?.selectedOption === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value, 'MCQ')}
                              className="mr-3"
                              style={{ accentColor: THEME.primary }}
                            />
                            <span className="font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setAnswers({});
                  }}
                  disabled={submitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSurvey}
                  disabled={submitting || Object.keys(answers).length !== surveyQuestions.length}
                  className="px-8 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: THEME.primary }}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default Surveys;