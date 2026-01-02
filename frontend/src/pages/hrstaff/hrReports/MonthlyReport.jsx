import { useState } from "react";
import { getMonthlyEmployeeReport } from "../../../api/HrReportsApi";
import { CalendarDays, UserPlus, CheckCircle2, Search, FileDown, Loader2 } from "lucide-react";

export default function MonthlyReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!month || !year) return;
    setLoading(true);
    try {
      const data = await getMonthlyEmployeeReport(month, year);
      setReport(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#F1FDF9] flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F1FDF9] rounded-xl border border-transparent focus-within:border-[#02C39A] transition-all">
          <CalendarDays size={18} className="text-[#05668D]" />
          <select 
            className="bg-transparent text-sm font-bold text-[#333333] outline-none"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#F1FDF9] rounded-xl border border-transparent focus-within:border-[#02C39A] transition-all">
          <input
            type="number"
            placeholder="Year"
            className="bg-transparent text-sm font-bold text-[#333333] outline-none w-20"
            value={year}
            onChange={e => setYear(e.target.value)}
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="bg-[#0C397A] hover:bg-[#05668D] text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Generate Report
        </button>
      </div>

      {report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F1FDF9] relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[#9B9B9B] text-xs font-black uppercase tracking-widest">New Talent Acquisitions</p>
                <h3 className="text-5xl font-black text-[#1ED292] mt-2">{report.newHires}</h3>
                <p className="text-[#333333] text-sm mt-2 font-medium">Employees joined this month</p>
              </div>
              <UserPlus className="absolute -right-4 -bottom-4 text-[#F1FDF9] group-hover:text-[#1ED292]/10 transition-colors" size={120} />
            </div>

            <div className="bg-[#05668D] p-6 rounded-3xl shadow-lg text-white">
              <div className="flex justify-between items-start mb-4">
                <CheckCircle2 size={24} className="text-[#02C39A]" />
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded">Attendance</span>
              </div>
              <p className="text-blue-100/70 text-sm">Monthly Attendance Summary</p>
              <h4 className="text-2xl font-bold mt-1">
                {report.attendance ? `${report.attendance}% Average` : "Data Pending"}
              </h4>
              <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-[#02C39A] h-full transition-all duration-1000" 
                  style={{ width: `${report.attendance || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Details Table/Visual Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#F1FDF9] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-[#0C397A] font-bold text-lg">Growth Analysis</h3>
                <p className="text-[#9B9B9B] text-xs uppercase tracking-tighter">Detailed breakdown for {new Date(0, month-1).toLocaleString('en-US', { month: 'long' })} {year}</p>
              </div>
              <button className="p-2 hover:bg-[#F1FDF9] rounded-lg text-[#05668D] transition-colors">
                <FileDown size={20} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-[#F1FDF9] rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="text-[#02C39A]" size={32} />
              </div>
              <h4 className="text-[#333333] font-bold text-xl">Monthly Insights Generated</h4>
              <p className="text-[#9B9B9B] max-w-xs mt-2 text-sm">
                The hiring rate for this period shows a stability trend. 
                Attendance levels are currently tracking within the <span className="text-[#02C39A] font-bold">optimal</span> range.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[#9B9B9B] text-[10px] font-bold uppercase">Retention</p>
                    <p className="text-[#0C397A] font-bold">98.2%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[#9B9B9B] text-[10px] font-bold uppercase">Absence</p>
                    <p className="text-[#0C397A] font-bold">1.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/50 border-2 border-dashed border-[#9B9B9B]/20 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
             <CalendarDays size={40} className="text-[#9B9B9B]/40" />
          </div>
          <h3 className="text-[#333333] font-bold text-lg">No Report Selected</h3>
          <p className="text-[#9B9B9B] text-sm max-w-xs mt-1">
            Please select a month and year above to generate the monthly workforce growth analytics.
          </p>
        </div>
      )}
    </div>
  );
}