// src/pages/public/CareersPage.jsx
import { useEffect, useState } from "react";
import { fetchPublicJobs } from "../api/publicJobsApi";
import JobCard from "../components/jobs/JobCard";

const PublicJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
  const loadJobs = async () => {
    try {
      const res = await fetchPublicJobs(page);
      setJobs(res?.items || []);
    } catch (error) {
      console.error("Failed to load public jobs", error);
      setJobs([]);
    }
  };

  loadJobs();
}, [page]);


  return (
    <div className="bg-[#F1FDF9] min-h-screen">
      {/* Hero */}
      <section className="text-center py-14 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0C397A]">
          Find Your Next Career Opportunity
        </h1>
        <p className="mt-3 text-[#9B9B9B] max-w-2xl mx-auto">
          Explore job openings from trusted organizations using CoreHive.
        </p>
      </section>

      {/* Job Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PublicJobs;
