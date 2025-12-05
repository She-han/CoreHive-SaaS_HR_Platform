import React from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2, FiList, FiCalendar } from "react-icons/fi";

export default function SurveyList({ surveys = [], onDelete }) {
  if (!surveys.length)
    return (
      <div className="text-[#9B9B9B] text-center py-8 text-lg">
        No surveys created yet.
      </div>
    );


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {surveys.map((s) => (
        <div
          key={s.id}
          className="p-6 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm 
                     hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* HEADER */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-[#333333]">{s.title}</h3>
            <p className="text-sm text-[#9B9B9B]">{s.description}</p>
          </div>

          {/* DATE RANGE */}
          <div className="flex items-center gap-2 mt-4 text-sm text-[#9B9B9B]">
            <FiCalendar size={16} className="text-[#05668D]" />
            <span>
              {s.startDate || s.start_date} → {s.endDate || s.end_date}
            </span>
          </div>

          {/* BUTTON GROUP */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* VIEW RESPONSES */}
            <Link
              to={`/hr_staff/feedback/${s.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 
                         rounded-lg border border-[#05668D] text-[#05668D] 
                         hover:bg-[#F1FDF9] transition"
            >
              <FiEye size={16} />
              View Responses
            </Link>

            {/* VIEW SURVEY QUESTIONS */}
            <Link
              to={`/hr_staff/feedback/${s.id}/questions`}
              className="flex items-center justify-center gap-2 px-4 py-2 
                         rounded-lg border border-[#0C397A] text-[#0C397A] 
                         hover:bg-[#F1FDF9] transition"
            >
              <FiList size={16} />
              View Questions
            </Link>

            {/* EDIT QUESTIONS */}
            <Link
              to={`/hr_staff/feedback/${s.id}/edit`}
              className="flex items-center justify-center gap-2 px-4 py-2 
                         rounded-lg border border-[#02C39A] text-[#02C39A]
                         hover:bg-[#F1FDF9] transition"
            >
              <FiEdit2 size={16} />
              Edit Questions
            </Link>

            {/* DELETE SURVEY */}
            <button
              onClick={() => onDelete(s.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 
                         rounded-lg border border-red-500 text-red-600 
                         hover:bg-red-50 transition"
            >
              <FiTrash2 size={16} />
              Delete Survey
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}
