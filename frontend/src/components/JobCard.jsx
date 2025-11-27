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
  onDelete,
}) => {
  const statusStyles = {
    Open: "bg-[#1ED292]/20 text-[#1ED292] border border-[#1ED292]/40",
    Draft: "bg-[#9B9B9B]/15 text-[#9B9B9B] border border-[#9B9B9B]/30",
    Closed: "bg-[#333333]/15 text-[#333333] border border-[#333333]/30",
  };

  return (
    <div className="relative bg-gradient-to-br from-[#FFFFFF] via-[#F1FDF9] to-[#EBFAF5] border border-[#02C39A]/30 rounded-2xl shadow-[0_5px_20px_rgba(2,195,154,0.1)] hover:shadow-[0_8px_25px_rgba(2,195,154,0.25)] hover:-translate-y-[5px] transition-all duration-300 ease-out p-7 flex flex-col gap-6 overflow-hidden">
      
      {/* Top-right decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#02C39A]/15 to-transparent rounded-bl-[100px]" />

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-[#02C39A]/30 rounded-xl flex items-center justify-center shadow-inner">
            <img src={avatar} alt={title} className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-[#0C397A] font-semibold text-xl leading-snug tracking-tight">
              {title}
            </h2>
            <p className="text-[#666666] text-sm mt-1 max-w-[260px]">
              {description}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs md:text-sm font-semibold rounded-full ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#02C39A]/15"></div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm text-[#333333]">
        {/* Department */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#02C39A]/10 border border-[#02C39A]/20">
            <Briefcase size={18} className="text-[#05668D]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] text-xs uppercase font-semibold tracking-wide">
              Department
            </p>
            <p className="font-semibold text-[#05668D]">{department}</p>
          </div>
        </div>

        {/* Vacancies */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#1ED292]/10 border border-[#1ED292]/25">
            <Users size={18} className="text-[#1ED292]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] text-xs uppercase font-semibold tracking-wide">
              Vacancies
            </p>
            <p className="font-semibold text-[#02C39A]">{vacancies}</p>
          </div>
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0C397A]/10 border border-[#0C397A]/20">
            <Calendar size={18} className="text-[#0C397A]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] text-xs uppercase font-semibold tracking-wide">
              Posted
            </p>
            <p className="text-[#333333] font-semibold">{postedDate}</p>
          </div>
        </div>

        {/* Closing Date */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#333333]/10 border border-[#333333]/20">
            <Calendar size={18} className="text-[#333333]" />
          </div>
          <div>
            <p className="text-[#9B9B9B] text-xs uppercase font-semibold tracking-wide">
              Closing
            </p>
            <p className="text-[#E63946] font-semibold">{closingDate}</p>
          </div>
        </div>
      </div>

      {/* EMPLOYEE TYPE */}
      <div className="text-center">
        <span className="inline-block bg-[#02C39A]/15 text-[#02C39A] font-semibold px-6 py-1.5 rounded-full text-sm tracking-wide uppercase">
          {employeeType}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 border-t border-[#02C39A]/15 pt-3">
        <button className="flex items-center gap-1 text-[#05668D] hover:text-[#02C39A] text-sm font-medium px-4 py-2 rounded-lg bg-[#02C39A]/5 hover:bg-[#02C39A]/10 transition-all duration-200">
          <Edit3 size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="flex items-center gap-1 text-[#FFFFFF] bg-[#FF4D4F] hover:bg-[#E63946] text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
