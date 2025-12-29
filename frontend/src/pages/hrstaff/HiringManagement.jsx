import { useState , useEffect } from "react";
import JobCard from "../../components/hrstaff/hiringmanagement/JobCard";
import { FaPlus } from "react-icons/fa";
import FilterBar from "../../components/hrstaff/FilterBar";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


const MySwal = withReactContent(Swal);//allowing you to use React elements inside popups.

export default function HiringManagement() {
  const [filter, setFilter] = useState({ role: "", status: "" });

   const [jobs, setJobs] = useState([]); //Array of job objects fetched from backend.
  const [loading, setLoading] = useState(true);

  // Fetch job postings from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/job-postings");
        setJobs(res.data);
      } catch (error) {
        console.error("Error fetching job postings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  //[] means this effect runs only once (on initial load).

   //Delete job posting with confirmation popup
  const handleDeleteJob = async (id) => {
    const result = await MySwal.fire({
      title: "Delete Job Posting?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#02C39A",
      background: "#FFFFFF",
      color: "#333333",
      iconColor: "#05668D",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/job-postings/${id}`);
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));

        MySwal.fire({
          title: "Deleted!",
          text: "The job posting has been removed",
          icon: "success",
          confirmButtonColor: "#1ED292",
          background: "#F1FDF9",
          color: "#0C397A",
          iconColor: "#1ED292",
        });
      } catch (error) {
        console.error("Error deleting job posting:", error);
        MySwal.fire({
          title: "Error",
          text: "Failed to delete job posting. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
          background: "#FFFFFF",
          color: "#333333",
          iconColor: "#d33",
        });
      }
    }
  };

  const filteredJobs = jobs.filter((job) => {
  const roleMatch = job.title.toLowerCase().includes(filter.role.toLowerCase());
  const statusMatch = filter.status
    ? job.status?.toLowerCase() === filter.status.toLowerCase()
    : true;

  return roleMatch && statusMatch;
});


  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8"> {/*Creates a full-screen white container with padding.*/}
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
            placeholder="Search by status..."
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
            to="/hr_staff/addjobform"
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
      {filteredJobs.map((job) => (
        <JobCard
          key={job.id}
          id={job.id}
          avatar={job.avatar}
          title={job.title}
          description={job.description}
          department={job.department}
          employeeType={
            job.employmentType
              ? job.employmentType.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
              : ""
          }
          status={
            job.status
              ? job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()
              : ""
          }
          vacancies={job.availableVacancies}
          postedDate={job.postedDate}
          closingDate={job.closingDate}
          onDelete={handleDeleteJob} 
        />
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
