import React, { useState, useEffect } from "react";
import { X, Clock, Calendar } from "lucide-react";

const STATUS_OPTIONS = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "ON_LEAVE",
  "WORK_FROM_HOME"
];

const EditAttendanceModal = ({ employee, selectedDate, onClose, onSave }) => {
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [status, setStatus] = useState("PRESENT");

  useEffect(() => {
    if (employee) {
      // Format existing times if they exist
      if (employee.checkInTime) {
        const date = new Date(employee.checkInTime);
        setCheckInTime(
          `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`
        );
      }
      if (employee.checkOutTime) {
        const date = new Date(employee.checkOutTime);
        setCheckOutTime(
          `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`
        );
      }
      setStatus(employee.status || "PRESENT");
    }
  }, [employee]);

  const handleSubmit = () => {
    // Convert time strings to LocalDateTime format (ISO 8601)
    const checkInDateTime = checkInTime
      ? `${selectedDate}T${checkInTime}:00`
      : null;
    const checkOutDateTime = checkOutTime
      ? `${selectedDate}T${checkOutTime}:00`
      : null;

    onSave({
      employeeId: employee.employeeId,
      date: selectedDate,
      checkInTime: checkInDateTime,
      checkOutTime: checkOutDateTime,
      status,
    });
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#333333]">
              Edit Attendance
            </h3>
            <p className="text-sm text-[#9B9B9B] mt-1">
              {employee.employeeName} ({employee.employeeCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9B9B] hover:text-[#333333] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Date Display */}
        <div className="mb-4 flex items-center gap-2 text-[#05668D] bg-[#F1FDF9] px-3 py-2 rounded-lg">
          <Calendar size={16} />
          <span className="text-sm font-medium">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Check-In Time */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#333333] mb-2">
            <Clock size={14} className="inline mr-1" />
            Check-In Time
          </label>
          <input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full px-4 py-2 border border-[#9B9B9B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
          />
        </div>

        {/* Check-Out Time */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#333333] mb-2">
            <Clock size={14} className="inline mr-1" />
            Check-Out Time
          </label>
          <input
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full px-4 py-2 border border-[#9B9B9B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05668D]"
          />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#333333] mb-2">
            Attendance Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-[#9B9B9B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#9B9B9B] text-[#9B9B9B] rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#01a17f] transition-colors font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
