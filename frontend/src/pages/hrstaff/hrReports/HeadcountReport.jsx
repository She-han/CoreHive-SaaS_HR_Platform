import { useEffect, useState } from "react";
import { getHeadcountReport } from "../../../api/HrReportsApi";
import { Users, Briefcase, Building2, TrendingUp, Award, ChevronRight } from "lucide-react";

export default function HeadcountReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeadcountReport()
      .then(setData)
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#02C39A]"></div>
        <p className="mt-4 text-[#9B9B9B] font-medium animate-pulse">Loading CoreHive Analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 bg-[#F1FDF9]/30 min-h-screen">
      {/* 1. Header & Total Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#0C397A] tracking-tight">Headcount</h2>
          <p className="text-[#9B9B9B] font-medium">Detailed workforce distribution across the organization.</p>
        </div>
        <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-sm border-l-4 border-[#02C39A] flex items-center gap-6">
          <div>
            <p className="text-[#9B9B9B] text-xs font-bold uppercase tracking-widest">Total Active Staff</p>
            <p className="text-4xl font-black text-[#333333]">{data.totalEmployees}</p>
          </div>
          <div className="p-3 bg-[#F1FDF9] rounded-full">
            <Users className="text-[#02C39A]" size={32} />
          </div>
        </div>
      </div>

      {/* 2. Main Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Department Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Building2 className="text-[#05668D]" size={20} />
            <h3 className="text-[#0C397A] font-bold text-lg uppercase tracking-wide">By Department</h3>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F1FDF9]/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[#05668D] text-xs font-bold uppercase">Department</th>
                  <th className="px-6 py-4 text-right text-[#05668D] text-xs font-bold uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byDepartment.map(([name, count]) => (
                  <tr key={name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#333333]">{name}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-[#F1FDF9] text-[#05668D] px-3 py-1 rounded-lg font-bold">
                        {count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Designation Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Award className="text-[#1ED292]" size={20} />
            <h3 className="text-[#0C397A] font-bold text-lg uppercase tracking-wide">By Designation</h3>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F1FDF9]/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[#1ED292] text-xs font-bold uppercase">Job Title / Role</th>
                  <th className="px-6 py-4 text-right text-[#1ED292] text-xs font-bold uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byDesignation.map(([name, count]) => (
                  <tr key={name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#333333]">{name}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#0C397A]">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 3. Growth & Insights Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#0C397A] p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Structure Analysis</h4>
            <p className="text-blue-100/70 max-w-md text-sm">
              Your organization currently operates with <strong>{data.byDepartment.length}</strong> departments and 
              <strong> {data.byDesignation.length}</strong> unique roles. 
              The largest group is <strong>{data.byDepartment[0]?.[0]}</strong>.
            </p>
          </div>
          <button className="relative z-10 whitespace-nowrap bg-[#02C39A] hover:bg-[#1ED292] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-black/20">
            Export Report
          </button>
          {/* Decorative background circle */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#F1FDF9] flex flex-col justify-center items-center text-center">
            <TrendingUp size={32} className="text-[#1ED292] mb-2" />
            <p className="text-[#9B9B9B] text-xs font-bold uppercase">Efficiency Index</p>
            <p className="text-3xl font-black text-[#333333]">94%</p>
        </div>
      </div>
    </div>
  );
}