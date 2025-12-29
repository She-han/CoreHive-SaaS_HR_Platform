import { useState } from "react";
import MonitorAttendance from "./MonitorAttendance";
import MarkDailyAttendance from "./MarkDailyAttendance";
import MonthlyReport from "./MonthlyReport";

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState("monitor");

  return (
    
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            Attendance Management
          </h1>
          <p className="text-[#9B9B9B] font-medium">
            Monitor attendance & generate attendance reports
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "monitor"
                ? "bg-[#02C39A] text-white"
                : "bg-[#F1FDF9] text-[#333333] border border-[#9B9B9B]"
            }`}
            onClick={() => setActiveTab("monitor")}
          >
            Monitor
          </button>

          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "daily"
                ? "bg-[#02C39A] text-white"
                : "bg-[#F1FDF9] text-[#333333] border border-[#9B9B9B]"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Mark Daily Attendance
          </button>

          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "monthly"
                ? "bg-[#02C39A] text-white"
                : "bg-[#F1FDF9] text-[#333333] border border-[#9B9B9B]"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "monitor" && <MonitorAttendance />}
        {activeTab === "daily" && <MarkDailyAttendance />}
        {activeTab === "monthly" && <MonthlyReport />}
      </div>
    </div>
  );
}
