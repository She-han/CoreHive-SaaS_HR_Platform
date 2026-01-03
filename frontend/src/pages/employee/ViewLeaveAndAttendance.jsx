import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getTodayAttendance, getAttendanceHistory } from "../../api/attendanceApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Alert from "../../components/common/Alert";

export default function ViewLeaveAndAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const today = await getTodayAttendance();
        setAttendance({
          checkIn: today.checkInTime
            ? new Date(today.checkInTime).toLocaleTimeString()
            : null,
          checkOut: today.checkOutTime
            ? new Date(today.checkOutTime).toLocaleTimeString()
            : null,
          status: today.status || "ABSENT",
          lateMinutes: today.status === "LATE" ? 30 : 0,
        });

        const historyData = await getAttendanceHistory();
        setHistory(
          historyData.map(h => ({
            date: new Date(h.date).toLocaleDateString(),
            status: h.status,
            checkIn: h.checkInTime
              ? new Date(h.checkInTime).toLocaleTimeString()
              : "-",
            checkOut: h.checkOutTime
              ? new Date(h.checkOutTime).toLocaleTimeString()
              : "-",
          }))
        );

        const summaryCalc = {
          present: historyData.filter(h => h.status === "PRESENT").length,
          absent: historyData.filter(h => h.status === "ABSENT").length,
          leave: historyData.filter(h => h.status === "LEAVE").length,
          totalHours: historyData.reduce((acc, h) => {
            if (h.checkInTime && h.checkOutTime) {
              const diff = new Date(h.checkOutTime) - new Date(h.checkInTime);
              return acc + diff / (1000 * 60 * 60);
            }
            return acc;
          }, 0).toFixed(2),
        };

        setSummary(summaryCalc);
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Alert type="error" message={error} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto animate-fade-in space-y-8">

        {/* PAGE HEADER */}
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Attendance Dashboard
        </h1>

        {/* TODAY'S ATTENDANCE */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Today’s Attendance
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Status:</strong> {attendance.status}</p>
            <p><strong>Late Minutes:</strong> {attendance.lateMinutes}</p>
            <p><strong>Check-In:</strong> {attendance.checkIn || "--"}</p>
            <p><strong>Check-Out:</strong> {attendance.checkOut || "--"}</p>
          </div>
        </div>

        {/* MONTHLY SUMMARY */}
        {summary && (
          <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow border border-[#f1f5f9]">
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
        )}

        {/* ATTENDANCE HISTORY */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow border border-[#f1f5f9]">
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
                    className="transition even:bg-gray-50 hover:bg-[var(--color-primary-50)]"
                  >
                    <td className="p-4 text-sm text-gray-700 border-t">{row.date}</td>
                    <td className="p-4 border-t">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : row.status === "ABSENT"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-t">{row.checkIn}</td>
                    <td className="p-4 text-sm text-gray-700 border-t">{row.checkOut}</td>
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
