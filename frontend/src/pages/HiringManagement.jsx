import { useState } from "react";
import JobCard from "../components/JobCard";
import { FaPlus } from "react-icons/fa";
import FilterBar from "../components/FilterBar";
import { Link } from "react-router-dom";

export default function HiringManagement() {
  const [filter, setFilter] = useState({ role: "", status: "" });

  const jobs = [
    {
      title: "Senior Python Developer",
      description: "Develop and maintain web applications...",
      department: "Engineering",
      employeeType: "Full-time",
      status: "Open",
      vacancies: 5,
      postedDate: "2024-07-25",
      closingDate: "2024-08-25",
    },
    {
      title: "HR Coordinator",
      description: "Coordinate and support HR operations...",
      department: "Human Resources",
      employeeType: "Part-time",
      status: "Draft",
      vacancies: 2,
      postedDate: "2024-07-25",
      closingDate: "2024-08-25",
    },
    {
      title: "Full-Stack Engineer",
      description: "Build scalable full-stack applications...",
      department: "IT Department",
      employeeType: "Contract",
      status: "Closed",
      vacancies: 3,
      postedDate: "2024-08-01",
      closingDate: "2024-09-01",
    },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(filter.role.toLowerCase()) &&
      (filter.status ? job.status === filter.status : true)
  );

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Hiring Management
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            Job Postings & Recruitment Overview
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by role..."
            value={filter.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border border-[#9B9B9B] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#02C39A]"
          />
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border border-[#9B9B9B] rounded-lg p-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>

          <Link
            to="/add-job"
            className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292]"
          >
            <FaPlus /> Add Job
          </Link>
        </div>
      </div>

      {/* ===== SCROLLABLE CARD SECTION ===== */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#02C39A]/40 scrollbar-track-gray-100 rounded-md pr-1">
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {filteredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        ) : (
          <div className="text-center text-[#9B9B9B] mt-10">
            No job postings found.
          </div>
        )}
      </div>
    </div>
  );
}
