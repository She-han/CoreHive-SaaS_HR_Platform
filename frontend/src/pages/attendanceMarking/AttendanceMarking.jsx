import React, { useState } from "react";
import CheckInTab from "../manualAttendanceMarking/CheckInTab";
import CheckOutTab from "../manualAttendanceMarking/CheckOutTab";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { LogIn, LogOut } from "lucide-react";

const AttendanceMarking = () => {
  const [activeTab, setActiveTab] = useState("checkin");
  const user = useSelector(selectUser);
  const token = user?.token;

  return (
    <div style={{ backgroundColor: '#F1FDF9' }} className="w-full h-screen shadow-md flex flex-col p-8">
      {/* HEADER MATCHING EMPLOYEE MANAGEMENT */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Attendance Manual Marking</h1>
          <p className="text-[#9B9B9B] font-medium">Record daily staff entry and exit times manually</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-3 mt-4 md:mt-0 bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab("checkin")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "checkin"
                ? "bg-[#02C39A] text-white shadow-sm"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9] hover:text-[#333333]"
            }`}
          >
            <LogIn size={16} /> Check-In
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "checkout"
                ? "bg-[#05668D] text-white shadow-sm"
                : "text-[#9B9B9B] hover:bg-[#F1FDF9] hover:text-[#333333]"
            }`}
          >
            <LogOut size={16} /> Check-Out
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        {activeTab === "checkin" ? <CheckInTab token={token} /> : <CheckOutTab token={token} />}
      </div>
    </div>
  );
};

export default AttendanceMarking;