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
        setSurvey(surveyData || null);
        setResponses(responseData || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const renderStars = (value) => {
    const num = Number(value);
    if (!num || num < 1) return "—";
    return "⭐".repeat(num);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!survey) return <div className="p-8 text-red-500">Survey not found.</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F7FAFC]">

      {/* FIXED HEADER */}
      <div className="p-6 bg-white shadow-sm border-b sticky top-0 z-20">
        <Link
          to="/hr_staff/FeedBackManagement"
          className="flex items-center gap-2 text-[#05668D] hover:text-[#0C397A] transition"
        >
          <FiArrowLeft size={18} /> Back
        </Link>

        <h1 className="text-3xl font-extrabold mt-4 text-[#333333]">{survey.title}</h1>
        <p className="text-[#6B7280] text-sm mt-1">{survey.description}</p>

        <h2 className="text-xl font-semibold mt-4 text-[#333333]">
          Responses ({responses.length})
        </h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {responses.map((resp) => (
          <div
            key={resp.responseId}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            {/* Employee Info */}
            <div className="flex items-center gap-2 mb-4">
              <FiUser className="text-[#05668D] text-lg" />
              <p className="font-medium text-[#333333] text-lg">
                {resp.employeeId
                  ? `Employee ${resp.employeeId}`
                  : "Anonymous User"}
              </p>
            </div>

            {/* QUESTIONS + ANSWERS */}
            <div className="space-y-5">

              {survey.questions?.map((q) => {
                const answer = resp.answers.find((a) => a.questionId === q.id);

                return (
                  <div
                    key={q.id}
                    className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm shadow-sm hover:border-[#02C39A] transition"
                  >
                    {/* QUESTION */}
                    <p className="font-semibold flex items-center gap-2 text-[#333333]">
                      <FiHelpCircle className="text-[#02C39A]" size={18} />
                      {q.questionText}
                    </p>

                    {/* ⭐ RATING */}
                    {q.questionType === "RATING" && answer?.selectedOption && (
                      <p className="mt-2 text-[#333333] flex items-center gap-2">
                        <span className="font-medium">Rating:</span>
                        <span className="text-yellow-500 text-lg">
                          {renderStars(answer.selectedOption)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({answer.selectedOption}/5)
                        </span>
                      </p>
                    )}

                    {/* TEXT ANSWER */}
                    {q.questionType === "TEXT" && answer?.answerText && (
                      <p className="mt-2 text-[#333333]">
                        <span className="font-medium">Answer:</span> {answer.answerText}
                      </p>
                    )}

                    {/* MCQ */}
                    {q.questionType === "MCQ" && answer?.selectedOption && (
                      <p className="mt-2 text-[#333333]">
                        <span className="font-medium">Selected:</span> {answer.selectedOption}
                      </p>
                    )}

                    {/* NOT ANSWERED */}
                    {!answer && (
                      <p className="mt-2 text-red-500 italic">Not answered</p>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        ))}

        {responses.length === 0 && (
          <p className="text-center text-[#9B9B9B] mt-10 text-lg">
            No responses submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
