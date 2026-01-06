import React from "react";
import { Calendar, Briefcase, Users, Edit3, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const JobCard = ({
  id,
  // avatar,
  title,
  description,
  department,
  employeeType,
  status,
  vacancies,
  postedDate,
  closingDate,
  onDelete,
}) => {
  const statusStyles = {
    Open: "bg-[#1ED292]/20 text-[#1ED292] border border-[#1ED292]/40",
    Draft: "bg-[#9B9B9B]/15 text-[#9B9B9B] border border-[#9B9B9B]/30",
    Closed: "bg-[#333333]/15 text-[#333333] border border-[#333333]/30",
  };

  return (
   <div className="relative bg-white border border-[#02C39A]/30 rounded-2xl shadow-[0_4px_15px_rgba(2,195,154,0.1)] hover:shadow-[0_6px_20px_rgba(2,195,154,0.2)] hover:-translate-y-[3px] transition-all duration-300 ease-out p-5 flex flex-col gap-4 overflow-hidden">
      {/* Top-right decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#02C39A]/15 to-transparent rounded-bl-[100px]" />

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* <div className="w-12 h-12 bg-white border border-[#02C39A]/30 rounded-lg flex items-center justify-center shadow-inner">
            <img src={avatar} alt={title} className="w-8 h-8 object-contain" />
          </div> */}
          <div>
            <h2 className="text-[#0C397A] font-semibold text-lg leading-snug tracking-tight">
              {title}
            </h2>
            <p className="text-[#666666] text-xs mt-1 max-w-[220px]">{description}</p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#02C39A]/15"></div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs text-[#333333]">
        {/* Department */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#02C39A]/10 border border-[#02C39A]/20">
            <Briefcase size={16} className="text-[#05668D]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] uppercase font-semibold tracking-wide">Department</p>
            <p className="font-semibold text-[#05668D]">{department}</p>
          </div>
        </div>

        {/* Vacancies */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#1ED292]/10 border border-[#1ED292]/25">
            <Users size={16} className="text-[#1ED292]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] uppercase font-semibold tracking-wide">Vacancies</p>
            <p className="font-semibold text-[#02C39A]">{vacancies}</p>
          </div>
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#0C397A]/10 border border-[#0C397A]/20">
            <Calendar size={16} className="text-[#0C397A]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] uppercase font-semibold tracking-wide">Posted</p>
            <p className="text-[#333333] font-semibold">{postedDate}</p>
          </div>
        </div>

        {/* Closing Date */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#333333]/10 border border-[#333333]/20">
            <Calendar size={16} className="text-[#333333]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] uppercase font-semibold tracking-wide">Closing</p>
            <p className="text-[#E63946] font-semibold">{closingDate}</p>
          </div>
        </div>
      </div>

      {/* EMPLOYEE TYPE */}
      <div className="text-center">
        <span className="inline-block bg-[#02C39A]/15 text-[#02C39A] font-semibold px-4 py-1.5 rounded-full text-xs tracking-wide uppercase">
          {employeeType}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 border-t border-[#02C39A]/15 pt-2">
        <Link
          to={`/hr_staff/editejobposting/${id}`}
          className="flex items-center gap-1 text-[#05668D] hover:text-[#02C39A] text-xs font-medium px-3 py-1.5 rounded-lg bg-[#02C39A]/5 hover:bg-[#02C39A]/10 transition-all duration-200"
        >
          <Edit3 size={14} /> Edit
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="flex items-center gap-1 text-white bg-[#FF4D4F] hover:bg-[#E63946] text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
