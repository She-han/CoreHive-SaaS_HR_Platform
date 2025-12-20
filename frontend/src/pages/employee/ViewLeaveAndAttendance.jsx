import React, { useEffect, useState } from "react";

export default function ViewLeaveAndAttendance() {
const [attendance, setAttendance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAttendance({
      checkIn: "09:10 AM",
      checkOut: null,
      status: "PRESENT",
      lateMinutes: 10,
    });

    setSummary({
      present: 18,
      absent: 2,
      leave: 1,
      totalHours: 120,
    });

    setHistory([
      { date: "2025-02-10", status: "PRESENT", checkIn: "9:00", checkOut: "17:45" },
      { date: "2025-02-09", status: "ABSENT", checkIn: "-", checkOut: "-" },
      { date: "2025-02-08", status: "LEAVE", checkIn: "-", checkOut: "-" },
    ]);

    setLoading(false);
  }, []);

  const handleCheckIn = () => alert("Checked In!");
  const handleCheckOut = () => alert("Checked Out!");

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold font-serif text-(--color-text-primary) mb-6">
        Attendance Dashboard
      </h1>

      {/* TODAY’S ATTENDANCE */}
      <div className="
        bg-[var(--color-background-white)]
        rounded-xl p-6 
        shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
        border border-[#f1f5f9] 
        animate-slide-up
      ">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Today’s Attendance
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Status:</strong> {attendance.status}</p>
          <p><strong>Late Minutes:</strong> {attendance.lateMinutes}</p>
          <p><strong>Check-In:</strong> {attendance.checkIn || "--"}</p>
          <p><strong>Check-Out:</strong> {attendance.checkOut || "--"}</p>
        </div>

        {/* CHECK-IN / CHECK-OUT BUTTONS */}
        <div className="mt-6">
          {!attendance.checkIn ? (
            <button
              onClick={handleCheckIn}
              className="
                bg-[var(--color-primary-500)]
                text-white
                px-6 py-3 rounded-lg font-medium
                transition-all duration-200 ease-in-out
                cursor-pointer inline-flex items-center justify-center
                text-base leading-[1.5] select-none min-h-[44px]
                hover:bg-[var(--color-primary-600)] hover:-translate-y-[1px]
                hover:shadow-[0_4px_6px_-1px_rgba(2,195,154,0.2)]
              "
            >
              Check In
            </button>
          ) : !attendance.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="
                bg-red-500 text-white
                px-6 py-3 rounded-lg font-medium
                transition-all duration-200 ease-in-out
                cursor-pointer inline-flex items-center justify-center
                text-base min-h-[44px]
                hover:bg-red-600 hover:-translate-y-[1px]
              "
            >
              Check Out
            </button>
          ) : (
            <p className="text-green-600 font-medium mt-2">
              You have completed today's attendance.
            </p>
          )}
        </div>
      </div>

      {/* MONTHLY SUMMARY */}
      <div className="
        bg-[var(--color-background-white)]
        rounded-xl p-6 mt-8
        shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
        border border-[#f1f5f9] animate-slide-up
      ">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          This Month Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-[var(--color-primary-50)]">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-xl font-bold">{summary.present}</p>
          </div>

          <div className="p-4 rounded-lg bg-red-50">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-xl font-bold">{summary.absent}</p>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50">
            <p className="text-sm text-gray-600">Leave</p>
            <p className="text-xl font-bold">{summary.leave}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xl font-bold">{summary.totalHours} hrs</p>
          </div>
        </div>
      </div>

      {/* ATTENDANCE HISTORY */}
      
      <div className="
  bg-[var(--color-background-white)]
  rounded-xl p-6 mt-8
  shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
  border border-[#f1f5f9] animate-slide-up
">
  <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-5">
    Attendance History
  </h2>

  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
          <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
          <th className="p-4 text-sm font-semibold text-gray-600">Check-In</th>
          <th className="p-4 text-sm font-semibold text-gray-600">Check-Out</th>
        </tr>
      </thead>

      <tbody>
        {history.map((row, index) => (
          <tr
            key={index}
            className="
              transition
              even:bg-gray-50
              hover:bg-[var(--color-primary-50)]
            "
          >
            {/* Date */}
            <td className="p-4 text-sm text-gray-700 border-t">{row.date}</td>

            {/* Status Badge */}
            <td className="p-4 border-t">
              {row.status === "PRESENT" && (
                <span className="
                  bg-green-100 text-green-700 
                  px-3 py-1 rounded-full text-xs font-medium
                ">
                  Present
                </span>
              )}

              {row.status === "ABSENT" && (
                <span className="
                  bg-red-100 text-red-700 
                  px-3 py-1 rounded-full text-xs font-medium
                ">
                  Absent
                </span>
              )}

              {row.status === "LEAVE" && (
                <span className="
                  bg-yellow-100 text-yellow-700 
                  px-3 py-1 rounded-full text-xs font-medium
                ">
                  Leave
                </span>
              )}
            </td>

            {/* Check-in */}
            <td className="p-4 text-sm text-gray-700 border-t">
              {row.checkIn}
            </td>

            {/* Check-out */}
            <td className="p-4 text-sm text-gray-700 border-t">
              {row.checkOut}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


    </div>
  );
}
