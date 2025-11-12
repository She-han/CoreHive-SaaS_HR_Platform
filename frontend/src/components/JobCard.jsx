import React from "react";
import { Calendar, Briefcase, Users, Edit3, Trash2 } from "lucide-react";

const JobCard = ({
  id,
  avatar,
  title,
  description,
  department,
  employeeType,
  status,
  vacancies,
  postedDate,
  closingDate,
  onDelete
}) => {
  // Themed status colors
  const statusColors = {
    Open: "bg-[#1ED292]/15 text-[#1ED292] border border-[#1ED292]/40",
    Draft: "bg-[#9B9B9B]/10 text-[#9B9B9B] border border-[#9B9B9B]/30",
    Closed: "bg-[#333333]/10 text-[#333333] border border-[#333333]/30",
  };

  return (
    <div className="relative bg-[#F1FDF9] border border-[#02C39A]/25 rounded-2xl shadow-[0_3px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out hover:-translate-y-[3px] p-6 md:p-7 flex flex-col justify-between">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border border-[#02C39A]/40 flex items-center justify-center">
            <img src={avatar} alt={title} className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h2 className="text-[#0C397A] font-semibold text-lg md:text-xl leading-tight">
              {title}
            </h2>
            <p className="text-[#9B9B9B] text-sm">{description}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs md:text-sm font-semibold rounded-full whitespace-nowrap ${statusColors[status]}`}
        >
          {status}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#02C39A]/20 mb-4"></div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#333333]">
        <p className="flex items-center gap-2">
          <Briefcase size={16} className="text-[#05668D]" />
          <span>
            <span className="font-medium text-[#333333]">Department:</span>{" "}
            {department}
          </span>
        </p>

        <p className="flex items-center gap-2">
          <Users size={16} className="text-[#05668D]" />
          <span>
            <span className="font-medium text-[#333333]">Vacancies:</span>{" "}
            {vacancies}
          </span>
        </p>

        <p className="flex items-center gap-2">
          <Calendar size={16} className="text-[#05668D]" />
          <span>
            <span className="font-medium text-[#333333]">Posted:</span>{" "}
            {postedDate}
          </span>
        </p>

        <p className="flex items-center gap-2">
          <Calendar size={16} className="text-[#05668D]" />
          <span>
            <span className="font-medium text-[#333333]">Closing:</span>{" "}
            {closingDate}
          </span>
        </p>

        <p className="flex items-center gap-2 sm:col-span-2">
          <span className="font-medium text-[#05668D]">
            {employeeType}
          </span>
        </p>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="border-t border-[#02C39A]/15 mt-5 pt-3 flex justify-end gap-3">
        <button className="flex items-center gap-1 text-[#05668D] hover:text-[#02C39A] text-sm font-medium px-3 py-2 rounded-lg hover:bg-white transition-all">
          <Edit3 size={16} /> Edit
        </button>
        <button 
        onClick={()=>onDelete(id)}
        className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all">
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
