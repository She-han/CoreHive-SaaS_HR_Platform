import { useState } from "react";
import { getMonthlyEmployeeReport } from "../../../api/HrReportsApi";
import {
  CalendarDays,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Search,
  Loader2,
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  Activity
} from "lucide-react";

export default function MonthlyEmployeeReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      const result = await getMonthlyEmployeeReport(month, year);
      setData(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusIconMap = {
    PRESENT: <CheckCircle size={18} className="text-[#1ED292]" />,
    ABSENT: <XCircle size={18} className="text-red-400" />,
    LATE: <Clock size={18} className="text-amber-500" />,
    ON_LEAVE: <CalendarDays size={18} className="text-[#05668D]" />,
    WORK_FROM_HOME: <Home size={18} className="text-[#02C39A]" />,
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Filter Header (Matches Annual Report Search Bar) */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#F1FDF9] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#F1FDF9] rounded-2xl">
            <Activity className="text-[#05668D]" size={24} />
          </div>
          <div>
            <h3 className="text-[#0C397A] font-bold text-lg">Monthly Workforce Insights</h3>
            <p className="text-[#9B9B9B] text-xs font-medium uppercase tracking-widest">Attendance & Hiring Metrics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Month Select */}
          <div className="flex-1 md:w-40 flex items-center gap-2 px-4 py-2 bg-[#F1FDF9] rounded-xl border border-transparent focus-within:border-[#02C39A] transition-all">
            <Calendar size={16} className="text-[#9B9B9B]" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#333333] outline-none w-full appearance-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div className="w-24 md:w-28 flex items-center gap-2 px-4 py-2 bg-[#F1FDF9] rounded-xl border border-transparent focus-within:border-[#02C39A] transition-all">
            <input
              type="number"
              className="bg-transparent text-sm font-bold text-[#333333] outline-none w-full"
              value={year}
              onChange={e => setYear(e.target.value)}
            />
          </div>

          <button
            onClick={loadReport}
            disabled={loading}
            className="bg-[#02C39A] hover:bg-[#1ED292] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#02C39A]/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Generate
          </button>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Main Content: Attendance Grid (Matches Distribution Grid) */}
          <div className="xl:col-span-3 bg-white p-6 rounded-[2rem] shadow-sm border border-[#F1FDF9]">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[#333333] font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-[#1ED292]" />
                Attendance Summary
              </h4>
              <button className="text-[#05668D] hover:bg-[#F1FDF9] p-2 rounded-lg transition-colors">
                <Download size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.attendance.map(([status, count]) => (
                <div
                  key={status}
                  className="group relative bg-[#F1FDF9]/40 hover:bg-white hover:shadow-xl hover:shadow-[#0C397A]/5 border border-transparent hover:border-[#F1FDF9] p-5 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-[#F1FDF9] transition-colors">
                      {statusIconMap[status] || <Activity size={18} />}
                    </div>
                    <p className="text-[#9B9B9B] text-[10px] font-black uppercase tracking-widest group-hover:text-[#02C39A]">
                      {status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-[#0C397A]">{count}</p>
                    <ArrowUpRight size={16} className="text-[#1ED292] mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: New Hires (Matches Annual Insights Sidebar) */}
          <div className="xl:col-span-1">
            <div className="bg-[#0C397A] p-8 rounded-[2rem] text-white h-full flex flex-col justify-between relative overflow-hidden shadow-xl shadow-[#0C397A]/20">
              <div className="relative z-10">
                <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mb-2">New Acquisitions</p>
                <div className="flex items-center gap-4">
                  <h2 className="text-6xl font-black">{data.newHires}</h2>
                  <div className="p-2 bg-[#02C39A] rounded-lg">
                    <UserPlus size={24} className="text-white" />
                  </div>
                </div>
                
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <p className="text-blue-100/60 text-[10px] font-bold uppercase">Reporting Period</p>
                    <p className="text-lg font-bold">
                      {months[month - 1]} {year}
                    </p>
                  </div>
                  <p className="text-sm text-blue-100/80 leading-relaxed">
                    Growth velocity for this month is 
                    <span className="text-[#02C39A] font-bold ml-1">Stable</span>. 
                    {data.newHires > 0 ? " New talent integrated successfully." : " No new hires recorded."}
                  </p>
                </div>
              </div>
              
              {/* Decorative graphic */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#02C39A]/10 rounded-full blur-3xl"></div>
              
              <button className="relative z-10 w-full mt-8 py-3 bg-[#02C39A] hover:bg-[#1ED292] text-white font-bold rounded-xl transition-all transform active:scale-95 shadow-lg">
                View Staff Details
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State (Matches Annual Report Placeholder) */
        <div className="bg-white rounded-[2rem] p-20 border border-dashed border-[#9B9B9B]/30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#F1FDF9] rounded-2xl flex items-center justify-center mb-4 text-[#9B9B9B]">
            <CalendarDays size={32} />
          </div>
          <h4 className="text-[#333333] font-bold text-lg">Monthly Analytics Ready</h4>
          <p className="text-[#9B9B9B] text-sm max-w-xs mt-2">
            Choose a specific month and year to visualize attendance trends and hiring data.
          </p>
        </div>
      )}
    </div>
  );
}