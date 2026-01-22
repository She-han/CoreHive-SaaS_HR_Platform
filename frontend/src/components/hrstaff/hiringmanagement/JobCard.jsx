import React from "react";
import {
  Calendar,
  Users,
  Edit3,
  Trash2,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";

const JobCard = ({
  id,
  employeeType,
  title,
  description,
  status,
  vacancies,
  postedDate,
  closingDate,
  contactEmail,
  onDelete
}) => {

  const statusStyles = {
    Open: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
    Draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    Closed: "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200
      shadow-sm hover:shadow-lg transition-all duration-300
      hover:-translate-y-1 p-5 flex flex-col gap-5">

      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="text-slate-900 font-semibold text-base leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 text-sm mt-1 line-clamp-2 max-w-[260px]">
            {description}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        {/* Vacancies */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <Users size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Vacancies
            </p>
            <p className="font-semibold text-slate-800">{vacancies}</p>
          </div>
        </div>

        {/* Posted */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <Calendar size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Posted
            </p>
            <p className="font-medium text-slate-800">{postedDate}</p>
          </div>
        </div>

        {/* Closing */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <Calendar size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Closing
            </p>
            <p className="font-medium text-rose-600">{closingDate}</p>
          </div>
        </div>

        {/* Email */}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-2 text-blue-600
              hover:text-blue-700 transition text-sm font-medium"
          >
            <Mail size={16} />
            <span className="truncate max-w-[170px]">
              {contactEmail}
            </span>
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">

        <span className="text-xs font-semibold px-3 py-1 rounded-full
          bg-emerald-100 text-emerald-700 uppercase tracking-wide">
          {employeeType}
        </span>

        <div className="flex gap-2">
          <Link
            to={`/hr_staff/editejobposting/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-slate-600 hover:text-blue-600
              hover:bg-blue-50 transition text-sm font-medium"
          >
            <Edit3 size={14} /> Edit
          </Link>

          <button
            onClick={() => onDelete(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-white bg-rose-500 hover:bg-rose-600
              transition text-sm font-medium shadow-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
