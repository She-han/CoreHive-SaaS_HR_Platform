import { Mail } from "lucide-react";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#02C39A]/20 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div className="p-6">
        {/* Job title */}
        <h3 className="text-lg font-bold text-[#333333]">
          {job.title}
        </h3>

        {/* Organization */}
        <p className="text-sm text-[#05668D] font-medium mt-1">
          {job.organizationName}
        </p>

        {/* Description */}
        <p className="text-sm text-[#9B9B9B] mt-3 line-clamp-3">
          {job.description}
        </p>

        {/* Meta */}
        <div className="mt-4 space-y-1 text-sm text-[#333333]">
          <p>
            <span className="font-medium">Employment:</span>{" "}
            {job.employmentType}
          </p>
          <p>
            <span className="font-medium">Vacancies:</span>{" "}
            {job.availableVacancies}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-[#05668D]">
          <Mail className="w-4 h-4 mr-2" />
          {job.contactEmail}
        </div>

        <button className="px-4 py-2 text-sm font-semibold text-white bg-[#02C39A] rounded-lg hover:bg-[#1ED292] transition-all duration-200">
          Apply
        </button>
      </div>
    </div>
  );
};

export default JobCard;
