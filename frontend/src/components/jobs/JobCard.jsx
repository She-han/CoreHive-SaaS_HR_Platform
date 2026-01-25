import { Mail, Users, ExternalLink, Copy, Check, Calendar, Clock, Building2 } from "lucide-react";
import { useState } from "react";

const JobCard = ({ job }) => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(job.contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full overflow-hidden">
      
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
             {/* Dynamic "Days Ago" logic or Date */}
            <div className="flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-500">
              <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
              {job.postedDate}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
              {job.employmentType}
            </span>
          </div>
          
          <div className="flex items-center text-xs font-bold text-slate-400">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {job.availableVacancies}
          </div>
        </div>

        {/* Job Info */}
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors duration-300">
          {job.title}
        </h3>
        
        <div className="flex items-center mt-2 mb-5 text-slate-600">
          <Building2 className="w-4 h-4 mr-2 text-slate-300" />
          <span className="text-sm font-medium tracking-wide italic">{job.organizationName}</span>
        </div>

        <p className="text-[15px] text-slate-500 leading-relaxed line-clamp-3 font-normal">
          {job.description}
        </p>
      </div>

      {/* Footer: Deadlines & Actions */}
      <div className="px-8 py-6 bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-100 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              Application Deadline
            </span>
            <div className="flex items-center text-[13px] font-bold text-slate-700">
              <Clock className="w-4 h-4 mr-1.5 text-rose-400" />
              {job.closingDate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-grow group/input">
            <a 
              href={`mailto:${job.contactEmail}`}
              className="flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:ring-4 hover:ring-emerald-500/5 transition-all shadow-sm"
            >
              <div className="flex items-center min-w-0">
                <Mail className="w-4 h-4 mr-3 text-slate-400 group-hover/input:text-emerald-500 transition-colors" />
                <span className="truncate">{job.contactEmail}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover/input:text-emerald-500 transition-colors" />
            </a>
          </div>

          <button 
            onClick={copyEmail}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-300 shadow-sm ${
              copied 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "bg-white border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
            }`}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;