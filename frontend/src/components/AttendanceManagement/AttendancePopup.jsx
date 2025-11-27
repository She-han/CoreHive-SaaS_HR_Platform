import React from "react";
import { X } from "lucide-react"; // icon (already available in most setups)

export default function AttendancePopup({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">

      <div className="w-full max-w-sm bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl animate-scaleIn overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#02C39A] to-[#0C397A] text-white px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold tracking-wide">Attendance Summary</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white hover:text-gray-200 transition" />
          </button>
        </div>

        {/* Content */}
  
        <div className="p-6 space-y-4 text-gray-700">
          
          <DetailRow label="Date" value={data.date} />
          <DetailRow label="Check In" value={data.checkIn} />
          <DetailRow label="Check Out" value={data.checkOut} />
          <DetailRow label="Hours Worked" value={data.worked} />

            

          {/* <DetailRow label="Late minutes" value={data.lateMinutes > 0 ? `${data.lateMinutes} minutes` : "On Time"} /> */}
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600">Status</span>
            <StatusBadge status={data.status} />
          </div>

          {data.lateMinutes > 0 && (
            <DetailRow label="Late By" value={`${data.lateMinutes} minutes`} />
          )}
        </div>

        {/* Button */}
        <div className="p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#02C39A] hover:bg-[#029e80] text-white font-medium rounded-xl shadow-md transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---- SINGLE DETAIL ITEM ---- */
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ---- STATUS BADGE ---- */
function StatusBadge({ status }) {
  const colors = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-600",
    LEAVE: "bg-blue-100 text-blue-600",
    HOLIDAY: "bg-gray-200 text-gray-600"
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${colors[status] || "bg-gray-200 text-gray-700"}`}>
      {status}
    </span>
  );
}
