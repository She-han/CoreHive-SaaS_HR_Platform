import React from "react";
import { Calendar, Briefcase, Trash2, Edit } from "lucide-react";

const JobCard = ({
  avatar,
  title,
  description,
  department,
  employeeType,
  status,
  vacancies,
  postedDate,
  closingDate,
}) => {
  const statusColors = {
    Open: "bg-[#1ED292] text-white",
    Draft: "bg-[#9B9B9B] text-white",
    Closed: "bg-[#333333] text-white",
  };

  return (
    <div className="bg-[#F1FDF9] border border-[#02C39A]/30 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all">
      {/* Top Section */}
      <div className="flex items-center gap-3 mb-3">
        <img src={avatar} alt={title} className="w-8 h-8 rounded-full bg-white p-1 border" />
        <div>
          <h2 className="text-[#0C397A] font-semibold text-lg">{title}</h2>
          <p className="text-[#9B9B9B] text-sm">{description}</p>
        </div>
      </div>

      <hr className="border-[#02C39A]/20 my-3" />

      {/* Details */}
      <div className="space-y-1 text-sm text-[#333333]">
        <p><strong>Department:</strong> {department}</p>
        <p><strong>Employment Type:</strong> <span className="text-[#05668D]">{employeeType}</span></p>
        <p><strong>Available Vacancy:</strong> {vacancies}</p>
        <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[status]}`}>{status}</span></p>
        <p className="flex items-center gap-2"><Calendar size={16}/> <strong>Posted:</strong> {postedDate}</p>
        <p className="flex items-center gap-2"><Calendar size={16}/> <strong>Closing:</strong> {closingDate}</p>
      </div>

      {/* Action Icons */}
      <div className="flex justify-end gap-3 mt-4">
        <button className="text-[#05668D] hover:text-[#02C39A] transition"><Edit size={18} /></button>
        <button className="text-[#333333] hover:text-red-500 transition"><Trash2 size={18} /></button>
      </div>
    </div>
  );
};

export default JobCard;
