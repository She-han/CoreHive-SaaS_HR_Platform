import { useState } from "react";
import {
  getAttendanceSummaryReport,
  downloadSummaryExcel,
  getEmployeeAttendanceDetail,
  downloadDetailExcel
} from "../../api/attendanceApi";

// ----------------------------------------------------------------------
// HELPER: Download Logic
// ----------------------------------------------------------------------
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function AttendanceReports() {
  const [activeTab, setActiveTab] = useState("summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Shared data state
  const [report, setReport] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------------
  // ACTIONS
  // ----------------------------------------------------------------------
  const handleLoadSummary = async () => {
    if (!startDate || !endDate) return alert("Please select date range");
    setLoading(true);
    try {
      const data = await getAttendanceSummaryReport(startDate, endDate);
      setReport(data);
      setActiveTab("summary");
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setLoading(true);
    setActiveTab("employee");
    try {
      const data = await getEmployeeAttendanceDetail(employee.employeeId, startDate, endDate);
      setEmployeeDetails(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSummary = async () => {
    const blob = await downloadSummaryExcel(startDate, endDate);
    downloadFile(blob, `Summary_${startDate}_to_${endDate}.xlsx`);
  };

  const handleDownloadEmployee = async () => {
    const blob = await downloadDetailExcel(selectedEmployee.employeeId, startDate, endDate);
    downloadFile(blob, `Attendance_${selectedEmployee.employeeName}.xlsx`);
  };

  return (
    <div className="p-8 bg-[#F1FDF9] min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* CONTROLS BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Start Date</label>
              <input 
                type="date" 
                className="border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none p-2 text-sm"
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">End Date</label>
              <input 
                type="date" 
                className="border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none p-2 text-sm"
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <button 
              onClick={handleLoadSummary}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-all font-medium shadow-md"
            >
              Generate Report
            </button>
          </div>

          {report.length > 0 && (
            <button 
              onClick={handleDownloadSummary}
              className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="Path d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'" /></svg>
              Export Summary
            </button>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === "summary" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Summary View
          </button>
          <button
            onClick={() => setActiveTab("employee")}
            disabled={!selectedEmployee}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === "employee" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
            } ${!selectedEmployee && "opacity-30 cursor-not-allowed"}`}
          >
            {selectedEmployee ? `Details: ${selectedEmployee.employeeName}` : "Employee Details"}
          </button>
        </div>

        {/* TAB CONTENT */}
        <main className="transition-all duration-300">
          {activeTab === "summary" ? (
            <SummaryTab report={report} loading={loading} onViewEmployee={handleViewEmployee} />
          ) : (
            <EmployeeTab 
              details={employeeDetails} 
              loading={loading} 
              employee={selectedEmployee} 
              onDownload={handleDownloadEmployee}
              onBack={() => setActiveTab("summary")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: Summary Table
// ----------------------------------------------------------------------
function SummaryTab({ report, loading, onViewEmployee }) {
  if (loading) return <SkeletonLoader />;
  if (report.length === 0) return <EmptyState message="Select a date range to view attendance summary." />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Present</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Absent</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Late</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Attendance %</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {report.map((row) => (
            <tr key={row.employeeId} className="hover:bg-slate-50 transition-colors group">
              <td className="p-4">
                <div className="font-semibold text-slate-900">{row.employeeName}</div>
                <div className="text-xs text-slate-500">{row.department}</div>
              </td>
              <td className="p-4 text-center text-emerald-600 font-medium">{row.present}</td>
              <td className="p-4 text-center text-rose-500 font-medium">{row.absent}</td>
              <td className="p-4 text-center text-amber-500 font-medium">{row.late}</td>
              <td className="p-4 text-center">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                  {row.attendancePercentage}%
                </span>
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onViewEmployee(row)}
                  className="text-emerald-600 hover:text-emerald-800 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full group-hover:bg-emerald-100 transition-all"
                >
                  View Detail →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: Employee Detail Table
// ----------------------------------------------------------------------
function EmployeeTab({ details, loading, employee, onDownload, onBack }) {
  if (loading) return <SkeletonLoader />;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1">
          ← Back to List
        </button>
        <button onClick={onDownload} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all">
          Download Statement (PDF/Excel)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Shift In/Out</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Working Hours</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {details.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{row.date}</div>
                  <div className="text-xs text-slate-400">{row.day}</div>
                </td>
                <td className="p-4 font-mono text-xs">
                   <span className="text-emerald-600">{row.checkInTime || "--:--"}</span> 
                   <span className="mx-2 text-slate-300">|</span>
                   <span className="text-rose-400">{row.checkOutTime || "--:--"}</span>
                </td>
                <td className="p-4 text-center text-slate-600">{row.workingHours || "0.0"}</td>
                <td className="p-4 text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    row.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// UI UTILS
// ----------------------------------------------------------------------
const EmptyState = ({ message }) => (
  <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
    <div className="text-slate-300 mb-2">📁</div>
    <p className="text-slate-400 font-medium">{message}</p>
  </div>
);

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-16 bg-slate-200 rounded-lg w-full"></div>
    ))}
  </div>
);