import React from "react";
import { User, UserCheck } from "lucide-react";

const formatTime = (dateTime) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const TodayAttendanceList = ({ title, data, mode }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* HEADER */}
      <div
        className={`px-6 py-4 flex items-center ${
          mode === "checkin"
            ? "bg-[#02C39A]"
            : "bg-[#05668D]"
        }`}
      >
        <UserCheck className="text-white mr-2" />
        <h3 className="text-lg font-bold text-white">
          {title} ({data.length})
        </h3>
      </div>

      {/* LIST */}
      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No records found
          </p>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="text-gray-600" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.employeeName || `Employee #${item.employeeId}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    In:{" "}
                    <span className="text-green-600">
                      {formatTime(item.checkInTime)}
                    </span>
                    {"  "}
                    Out:{" "}
                    <span className="text-orange-600">
                      {formatTime(item.checkOutTime)}
                    </span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                Done
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayAttendanceList;
