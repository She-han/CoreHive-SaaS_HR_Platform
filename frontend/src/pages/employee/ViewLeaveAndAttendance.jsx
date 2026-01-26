import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getTodayAttendance,
  getAttendanceHistory
} from "../../api/attendanceApi";
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
          lateMinutes: today.status === "LATE" ? 30 : 0
        });

        const historyData = await getAttendanceHistory();
        setHistory(
          historyData.map((h) => ({
            date: new Date(h.date).toLocaleDateString(),
            status: h.status,
            checkIn: h.checkInTime
              ? new Date(h.checkInTime).toLocaleTimeString()
              : "-",
            checkOut: h.checkOutTime
              ? new Date(h.checkOutTime).toLocaleTimeString()
              : "-"
          }))
        );

        // Get current month's date range
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthHistory = historyData.filter(h => {
          const recordDate = new Date(h.date);
          return recordDate >= firstDayOfMonth && recordDate <= now;
        });

        const summaryCalc = {
          present: currentMonthHistory.filter((h) => h.status === "PRESENT").length,
          absent: currentMonthHistory.filter((h) => h.status === "ABSENT").length,
          leave: currentMonthHistory.filter((h) => h.status === "LEAVE").length,
          totalOtHours: currentMonthHistory
            .reduce((acc, h) => {
              // OT hours from backend response
              if (h.otHours) {
                return acc + parseFloat(h.otHours);
              }
              return acc;
            }, 0)
            .toFixed(2)
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
            <p>
              <strong>Status:</strong> {attendance.status}
            </p>
            <p>
              <strong>Late Minutes:</strong> {attendance.lateMinutes}
            </p>
            <p>
              <strong>Check-In:</strong> {attendance.checkIn || "--"}
            </p>
            <p>
              <strong>Check-Out:</strong> {attendance.checkOut || "--"}
            </p>
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
                <p className="text-sm text-gray-600">Total OT Hours</p>
                <p className="text-xl font-bold">{summary.totalOtHours} hrs</p>
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY CALENDAR */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow border border-[#f1f5f9]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-5">
            Attendance Calendar
          </h2>
          
          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                
                // Get first day of month and total days
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                // Create calendar grid
                const calendarDays = [];
                
                // Empty cells before month starts
                for (let i = 0; i < firstDay; i++) {
                  calendarDays.push(
                    <div key={`empty-${i}`} className="aspect-square" />
                  );
                }
                
                // Actual days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = new Date(year, month, day).toLocaleDateString();
                  const dayRecord = history.find(h => h.date === dateStr);
                  const status = dayRecord?.status || null;
                  const isToday = day === now.getDate();
                  
                  // Determine background color based on status
                  let bgColor = 'bg-white hover:bg-gray-50';
                  let textColor = 'text-gray-700';
                  let borderColor = 'border-gray-200';
                  
                  if (status === 'PRESENT') {
                    bgColor = 'bg-[var(--color-primary-50)] hover:bg-green-100';
                    textColor = 'text-green-700';
                    borderColor = 'border-green-200';
                  } else if (status === 'ABSENT') {
                    bgColor = 'bg-red-50 hover:bg-red-100';
                    textColor = 'text-red-700';
                    borderColor = 'border-red-200';
                  } else if (status === 'LEAVE' || status === 'ON_LEAVE') {
                    bgColor = 'bg-yellow-50 hover:bg-yellow-100';
                    textColor = 'text-yellow-700';
                    borderColor = 'border-yellow-200';
                  } else if (status === 'LATE') {
                    bgColor = 'bg-orange-50 hover:bg-orange-100';
                    textColor = 'text-orange-700';
                    borderColor = 'border-orange-200';
                  } else if (status === 'HALF_DAY') {
                    bgColor = 'bg-blue-50 hover:bg-blue-100';
                    textColor = 'text-blue-700';
                    borderColor = 'border-blue-200';
                  }
                  
                  calendarDays.push(
                    <div
                      key={day}
                      className={`aspect-square border ${borderColor} rounded-lg ${bgColor} flex flex-col items-center justify-center transition-all ${
                        isToday ? 'ring-2 ring-[#02C39A] ring-offset-1' : ''
                      }`}
                      title={dayRecord ? `${status} - ${dayRecord.checkIn} to ${dayRecord.checkOut}` : 'No record'}
                    >
                      <span className={`text-sm font-semibold ${textColor}`}>
                        {day}
                      </span>
                      {status && (
                        <span className="text-[8px] font-bold uppercase mt-0.5 opacity-70">
                          {status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : status === 'LEAVE' || status === 'ON_LEAVE' ? 'L' : status === 'LATE' ? 'LT' : status === 'HALF_DAY' ? 'HD' : ''}
                        </span>
                      )}
                    </div>
                  );
                }
                
                return calendarDays;
              })()}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[var(--color-primary-50)] border border-green-200"></div>
                <span className="text-xs text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
                <span className="text-xs text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-200"></div>
                <span className="text-xs text-gray-600">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-50 border border-orange-200"></div>
                <span className="text-xs text-gray-600">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200"></div>
                <span className="text-xs text-gray-600">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-[#02C39A]"></div>
                <span className="text-xs text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE HISTORY */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-6 shadow border border-[#f1f5f9]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-5">
            Attendance History
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-600">
                    Check-In
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-600">
                    Check-Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, index) => (
                  <tr
                    key={index}
                    className="transition even:bg-gray-50 hover:bg-[var(--color-primary-50)]"
                  >
                    <td className="p-4 text-sm text-gray-700 border-t">
                      {row.date}
                    </td>
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
                    <td className="p-4 text-sm text-gray-700 border-t">
                      {row.checkIn}
                    </td>
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
    </DashboardLayout>
  );
}
