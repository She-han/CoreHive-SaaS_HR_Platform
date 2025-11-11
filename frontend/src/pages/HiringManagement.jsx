import React, { useState } from "react";
import JobCard from "../components/JobCard";
import FilterBar from "../components/FilterBar";
//import pythonLogo from "../assets/python.png";

const HiringManagement = () => {
  const [filter, setFilter] = useState({ role: "", status: "" });

  const jobs = [
    {
      //avatar: pythonLogo,
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
      //avatar: pythonLogo,
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
      //avatar: pythonLogo,
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
    <div className="min-h-screen bg-white px-8 py-10">
      <h1 className="text-2xl font-bold text-[#0C397A] mb-2">Hiring Management</h1>
      <p className="text-[#9B9B9B] mb-8">Employees' Information</p>

      <FilterBar onFilterChange={handleFilterChange} />

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>
    </div>
  );
};

export default HiringManagement;
