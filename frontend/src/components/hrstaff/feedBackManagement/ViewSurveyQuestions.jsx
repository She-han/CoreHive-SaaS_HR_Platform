import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSurveyDetails } from "../../../api/feedbackService.js";
import { FiCalendar, FiHelpCircle, FiList, FiArrowLeft } from "react-icons/fi";

export default function ViewSurveyQuestions() {
  const token = localStorage.getItem('corehive_token') || sessionStorage.getItem('corehive_token');
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    getSurveyDetails(id, token)  // ✅ Pass token, remove orgUuid
      .then((data) => setSurvey(data))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading)
    return (
      <div className="p-8 text-[#333333] text-lg font-medium animate-pulse">
        Loading survey details…
      </div>
    );

  if (!survey)
    return (
      <div className="p-8 text-red-600 text-lg font-medium">
        Survey not found.
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#F7FAFC] to-[#EEF2F7] overflow-hidden">

      {/* PAGE HEADER */}
      <div className="px-8 pt-6 pb-5 bg-white/80 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-b border-gray-200">
        <Link
          to="/hr_staff/FeedBackManagement"
          className="flex items-center gap-2 text-[#05668D] hover:text-[#0C397A] transition font-medium"
        >
          <FiArrowLeft size={18} />
          <span>Back to Surveys</span>
        </Link>

        <h1 className="text-3xl font-extrabold text-[#333333] mt-4 tracking-tight">
          {survey.title}
        </h1>

        <p className="text-[#9B9B9B] text-sm mt-1 leading-relaxed">
          {survey.description}
        </p>

        <div className="flex items-center gap-8 mt-4">
          <div className="flex items-center gap-2 text-[#05668D] font-semibold">
            <FiCalendar size={18} />
            <span>{survey.startDate} → {survey.endDate}</span>
          </div>

          <div className="text-[#9B9B9B] text-sm">
            Anonymous:{" "}
            <span className="font-semibold text-[#333333]">
              {survey.isAnonymous ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#02C39A]/10 rounded-xl">
            <FiList size={20} className="text-[#02C39A]" />
          </div>
          <h2 className="text-xl font-bold text-[#333333] tracking-tight">
            Survey Questions
          </h2>
        </div>

        <div className="border-b border-gray-300 opacity-60 mb-6" />

        {/* QUESTIONS LIST */}
        <div className="space-y-6">
          {survey.questions?.map((q, index) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#02C39A]/40"
            >
              <div className="flex gap-4">

                {/* QUESTION ICON */}
                <div className="pt-1">
                  <div className="bg-[#05668D]/10 p-3 rounded-xl shadow-inner backdrop-blur-sm">
                    <FiHelpCircle size={23} className="text-[#05668D]" />
                  </div>
                </div>

                {/* QUESTION DETAILS */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#333333] leading-snug">
                    {index + 1}. {q.questionText || q.question_text}
                  </h3>

                  <p className="text-sm text-[#9B9B9B] mt-1">
                    Type:{" "}
                    <span className="font-semibold text-[#333333]">
                      {q.questionType || q.question_type}
                    </span>
                  </p>

                  {/* OPTIONS */}
                  {q.options?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-[#9B9B9B] font-medium mb-2">Options</p>
                      <div className="bg-gradient-to-br from-[#F1FDF9] to-[#FFFFFF] rounded-xl border border-[#02C39A]/20 p-4 shadow-sm">
                        <ul className="list-disc ml-5 space-y-1 text-[#333333] text-sm">
                          {(typeof q.options === "string" ? JSON.parse(q.options) : q.options).map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="h-16 bg-gradient-to-t from-[#F7FAFC] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
