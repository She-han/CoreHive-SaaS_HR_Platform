import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResponseDetails, getSurveyDetails } from "../../../api/feedbackService";
import { FiArrowLeft, FiUser, FiHelpCircle } from "react-icons/fi";

export default function ViewResponsesWithQuestions() {
  const { id } = useParams();
  const orgUuid = "org-uuid-001";

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSurveyDetails(orgUuid, id), getResponseDetails(orgUuid, id)])
      .then(([surveyData, responseData]) => {
        setSurvey(surveyData);
        setResponses(responseData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F7FAFC]">
      
      {/* FIXED HEADER */}
      <div className="p-6 bg-white shadow-sm border-b">
        <Link 
          to="/hr_staff/FeedBackManagement" 
          className="flex items-center gap-2 text-[#05668D] hover:text-[#0C397A] transition"
        >
          <FiArrowLeft size={18} /> Back
        </Link>

        <h1 className="text-2xl font-bold mt-4">{survey?.title}</h1>
        <p className="text-gray-500">{survey?.description}</p>

        <h2 className="text-xl font-semibold mt-4">
          Responses ({responses.length})
        </h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {responses.map((resp) => (
          <div
            key={resp.responseId}
            className="bg-white p-5 rounded-lg shadow-sm border"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiUser className="text-[#05668D]" />
              <p className="font-medium">
                {resp.employeeId ? `Employee ${resp.employeeId}` : "Anonymous User"}
              </p>
            </div>

            <div className="space-y-4">
              {resp.answers.map((a) => (
                <div
                  key={a.questionId}
                  className="p-3 bg-gray-50 rounded border text-sm"
                >
                  <p className="font-semibold flex items-center gap-2">
                    <FiHelpCircle className="text-[#02C39A]" />
                    {a.questionText}
                  </p>

                  {a.answerText && (
                    <p className="mt-1">Answer: {a.answerText}</p>
                  )}

                  {a.selectedOption && (
                    <p className="mt-1">Selected: {a.selectedOption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
