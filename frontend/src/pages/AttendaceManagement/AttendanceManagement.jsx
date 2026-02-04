import { useState } from "react";
import MonitorAttendance from "./MonitorAttendance";
import MonthlyReport from "./MonthlyReport";

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState("monitor");

  return (
    <div
      style={{ backgroundColor: "#F1FDF9" }}
      className="w-full bg-white shadow-md flex flex-col p-8"
    >
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

      
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "monitor" && <MonitorAttendance />}
        
      </div>
    </div>
  );
}
