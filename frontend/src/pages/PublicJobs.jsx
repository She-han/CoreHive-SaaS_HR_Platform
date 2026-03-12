import { useEffect, useState } from "react";
import { fetchPublicJobs } from "../api/publicJobsApi";
import JobCard from "../components/jobs/JobCard";
// Note: Using standard Lucide-style SVG icons for zero-dependency copy-paste
import { SearchIcon, BriefcaseIcon } from "lucide-react"; 
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const PublicJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const res = await fetchPublicJobs(page);
        const items = res?.items || [];
        setJobs(items);
        setFilteredJobs(items);
      } catch (error) {
        console.error("Failed to load public jobs", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [page]);

  // Handle Keyword Search
useEffect(() => {
  const term = searchTerm.toLowerCase();

  const results = jobs.filter((job) =>
    job.title?.toLowerCase().includes(term) ||
    job.organizationName?.toLowerCase().includes(term) ||
    job.description?.toLowerCase().includes(term)
  );

  setFilteredJobs(results);
}, [searchTerm, jobs]);



  return (
    <>
    <Navbar/>
    <div className="bg-[#F1FDF9] min-h-screen font-sans text-[#333333]">
      {/* --- Hero Section --- */}
      <section className="bg-gradient-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] pt-20 pb-32 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 mb-4 text-xl font-bold tracking-widest text-[#02C39A] uppercase bg-white/10 rounded-full">
            CoreHive Careers
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Find Your Next Career Opportunity
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Explore premium openings from industry-leading organizations powered by CoreHive technology.
          </p>
        </div>
      </section>

      {/* --- Search Bar Container --- */}
      <section className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-col md:flex-row gap-3 border border-gray-100">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-[#9B9B9B]" />
            </div>
            <input
              type="text"
              placeholder="Search by job title, keywords, or company..."
              className="block w-full pl-11 pr-4 py-4 bg-[#F1FDF9] border-none rounded-xl focus:ring-2 focus:ring-[#02C39A] transition-all outline-none text-[#333333]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#02C39A] hover:bg-[#1ED292] text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-[#02C39A]/20 active:scale-95">
            Search
          </button>
        </div>
      </section>

      {/* --- Main Content --- */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#0C397A]">Current Openings</h2>
            <p className="text-[#9B9B9B] text-sm mt-1">Showing {filteredJobs.length} available positions</p>
          </div>
          <div className="hidden md:block">
             <button className="text-[#05668D] font-semibold flex items-center gap-2 hover:opacity-80">
               <BriefcaseIcon size={18} />
               Alerts Off
             </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
             ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job.jobId} className="group transform hover:-translate-y-2 transition-all duration-300">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white inline-block p-8 rounded-full shadow-sm mb-4">
               <SearchIcon size={48} className="text-[#9B9B9B]" />
            </div>
            <h3 className="text-xl font-bold text-[#333333]">No jobs found</h3>
            <p className="text-[#9B9B9B]">Try adjusting your search keywords or clear filters.</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-[#05668D] underline font-medium"
            >
              View all jobs
            </button>
          </div>
        )}
      </main>
    </div>
    <Footer/>
    </>
  );
};

export default PublicJobs;