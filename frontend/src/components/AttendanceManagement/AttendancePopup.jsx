import React from "react";

export default function AttendancePopup({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg animate-fadeIn">

        <h2 className="text-lg font-bold mb-4">Attendance Details</h2>

        <p><strong>Date:</strong> {data.date}</p>
        <p><strong>Check In:</strong> {data.checkIn}</p>
        <p><strong>Check Out:</strong> {data.checkOut}</p>
        <p><strong>Total Worked:</strong> {data.worked}</p>
        <p><strong>Status:</strong> {data.status}</p>

        {data.lateMinutes !== undefined && (
          <p><strong>Late Minutes:</strong> {data.lateMinutes} min</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-[#02C39A] text-white py-2 rounded-lg"
        >
          Close
        </button>

      </div>
    </div>
  );
}
