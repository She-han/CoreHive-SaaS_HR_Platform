import { useState } from "react";
import { getAnnualEmployeeGrowthReport } from "../../../api/HrReportsApi";
import { BarChart, TrendingUp, Calendar, Search, ArrowUpRight, Download, Loader2 } from "lucide-react";

export default function AnnualReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    if (!year) return;
    setLoading(true);
    try {
      const res = await getAnnualEmployeeGrowthReport(year);
      setData(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    return new Date(0, monthNum - 1).toLocaleString('en-US', { month: 'short' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#F1FDF9] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#F1FDF9] rounded-2xl">
            <BarChart className="text-[#05668D]" size={24} />
          </div>
          <div>
            <h3 className="text-[#0C397A] font-bold text-lg">Annual Growth Analytics</h3>
            <p className="text-[#9B9B9B] text-xs font-medium uppercase tracking-widest">Yearly hiring velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-32 flex items-center gap-2 px-4 py-2 bg-[#F1FDF9] rounded-xl border border-transparent focus-within:border-[#02C39A] transition-all">
            <Calendar size={16} className="text-[#9B9B9B]" />
            <input
              type="number"
              placeholder="Year"
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
            Analyze
          </button>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Visual Grid */}
          <div className="xl:col-span-3 bg-white p-6 rounded-[2rem] shadow-sm border border-[#F1FDF9]">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[#333333] font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-[#1ED292]" />
                Monthly Hiring Distribution
              </h4>
              <button className="text-[#05668D] hover:bg-[#F1FDF9] p-2 rounded-lg transition-colors">
                <Download size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(data).map(([month, count]) => (
                <div
                  key={month}
                  className="group relative bg-[#F1FDF9]/40 hover:bg-white hover:shadow-xl hover:shadow-[#0C397A]/5 border border-transparent hover:border-[#F1FDF9] p-5 rounded-2xl transition-all duration-300"
                >
                  <p className="text-[#9B9B9B] text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-[#02C39A]">
                    {getMonthName(month)}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-black text-[#0C397A]">{count}</p>
                    {count > 0 && <ArrowUpRight size={16} className="text-[#1ED292] mb-1" />}
                  </div>
                  {/* Subtle bar visual */}
                  <div className="absolute bottom-0 left-0 h-1 bg-[#1ED292] rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100" 
                       style={{ width: count > 0 ? '40%' : '0%' }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Annual Insights Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-[#0C397A] p-8 rounded-[2rem] text-white h-full flex flex-col justify-between relative overflow-hidden shadow-xl shadow-[#0C397A]/20">
              <div className="relative z-10">
                <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mb-2">Annual Total</p>
                <h2 className="text-5xl font-black mb-4">
                  {Object.values(data).reduce((a, b) => a + b, 0)}
                </h2>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <p className="text-blue-100/60 text-[10px] font-bold uppercase">Peak Month</p>
                    <p className="text-lg font-bold">
                      {getMonthName(Object.entries(data).sort((a,b) => b[1] - a[1])[0][0])}
                    </p>
                  </div>
                  <p className="text-sm text-blue-100/80 leading-relaxed">
                    Hiring trends for {year} show a 
                    <span className="text-[#02C39A] font-bold ml-1">Positive</span> growth trajectory.
                  </p>
                </div>
              </div>
              
              {/* Decorative graphic */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#02C39A]/10 rounded-full blur-3xl"></div>
              <button className="relative z-10 w-full mt-8 py-3 bg-[#02C39A] hover:bg-[#1ED292] text-white font-bold rounded-xl transition-all transform active:scale-95 shadow-lg">
                View Full Audit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] p-20 border border-dashed border-[#9B9B9B]/30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#F1FDF9] rounded-2xl flex items-center justify-center mb-4 text-[#9B9B9B]">
            <BarChart size={32} />
          </div>
          <h4 className="text-[#333333] font-bold text-lg">Annual Growth Data</h4>
          <p className="text-[#9B9B9B] text-sm max-w-xs mt-2">
            Select a fiscal year to visualize the organization's hiring velocity and monthly trends.
          </p>
        </div>
      )}
    </div>
  );
}