import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function LeaveRequest() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    // Simulated leave types – replace with API call
    setLeaveTypes([
      { id: 1, name: "Casual Leave" },g
      { id: 2, name: "Sick Leave" },
      { id: 3, name: "Annual Leave" },
    ]);

    // Simulated leave history – replace with API call
    setHistory([
      { type: "Casual Leave", start: "2025-01-12", end: "2025-01-14", days: 3, status: "APPROVED" },
      { type: "Sick Leave", start: "2025-01-05", end: "2025-01-05", days: 1, status: "PENDING" },
      { type: "Annual Leave", start: "2024-12-20", end: "2024-12-22", days: 3, status: "REJECTED" },
    ]);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submitLeave = () => alert("Leave request submitted!");

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto animate-fade-in space-y-8">

        {/* PAGE HEADER */}
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
          Leave Request Portal
        </h1>

        {/* APPLY FOR LEAVE CARD */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9] animate-slide-up">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Apply for Leave
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Leave Type</label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
              />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Reason</label>
              <textarea
                name="reason"
                rows="3"
                value={form.reason}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-1 outline-none"
                placeholder="Explain the reason for your leave..."
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-6">
            <button
              onClick={submitLeave}
              className="bg-[var(--color-primary-500)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out hover:bg-[var(--color-primary-600)] hover:-translate-y-[1px] hover:shadow-[0_4px_6px_-1px_rgba(2,195,154,0.2)]"
            >
              Submit Leave Request
            </button>
          </div>
        </div>

        {/* LEAVE HISTORY CARD */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9] animate-slide-up">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-5">Leave Request History</h2>

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Start</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">End</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Days</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, index) => (
                  <tr key={index} className="transition even:bg-gray-50 hover:bg-[var(--color-primary-50)]">
                    <td className="p-4 text-sm border-t">{row.type}</td>
                    <td className="p-4 text-sm border-t">{row.start}</td>
                    <td className="p-4 text-sm border-t">{row.end}</td>
                    <td className="p-4 text-sm border-t">{row.days}</td>
                    <td className="p-4 border-t">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : row.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
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

      </div>
    </DashboardLayout>
  );
}
