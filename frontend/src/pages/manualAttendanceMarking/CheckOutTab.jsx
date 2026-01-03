import React, { useEffect, useState } from "react";
import { getTodayAttendance, manualCheckOut } from "../../api/manualAttendanceService";
import { Clock, CheckCircle } from "lucide-react";

// Professional Status Styles Configuration
// Full Status Styles for Your Enum
const STATUS_STYLES = {
  PRESENT: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    label: "Present"
  },
  LATE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Late Entry"
  },
  HALF_DAY: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    label: "Half Day"
  },
  WORK_FROM_HOME: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
    label: "Work From Home"
  },
  DEFAULT: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    label: "Checked In"
  }
};


const CheckOutTab = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayAttendance = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTodayAttendance(token);
      // Filter out those who shouldn't be in the manual checkout list
      const filtered = data.filter(emp => emp.status !== "ABSENT" && emp.status !== "ON_LEAVE");
      setEmployees(filtered);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [token]);

  const handleCheckOut = async (employeeId) => {
    try {
      await manualCheckOut(employeeId, token);
      // Refresh the list to show updated checkout times and status
      fetchTodayAttendance();
    } catch (err) {
      alert(err.message || "Failed to check out employee");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-4 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#F1FDF9]">
          <tr>
            <th className="p-4 text-left text-[#05668D] font-bold uppercase tracking-wider text-[11px]">Employee Information</th>
            <th className="p-4 text-left text-[#05668D] font-bold uppercase tracking-wider text-[11px]">Check-In</th>
            <th className="p-4 text-left text-[#05668D] font-bold uppercase tracking-wider text-[11px]">Check-Out</th>
            <th className="p-4 text-left text-[#05668D] font-bold uppercase tracking-wider text-[11px]">Status</th>
            <th className="p-4 text-center text-[#05668D] font-bold uppercase tracking-wider text-[11px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center p-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-[#02C39A] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#9B9B9B] font-medium">Fetching records...</span>
                </div>
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-12 text-[#9B9B9B]">No active attendance records found today.</td>
            </tr>
          ) : (
            employees.map(emp => {
              const style = STATUS_STYLES[emp.status] || STATUS_STYLES.DEFAULT;
              
              return (
                <tr key={emp.employeeId} className="hover:bg-[#F1FDF9]/30 transition-colors">
                  {/* Info Column */}
                  <td className="p-4">
                    <div className="font-bold text-[#333333] leading-tight">{emp.employeeName}</div>
                    <div className="text-[10px] text-[#9B9B9B] font-bold uppercase tracking-widest mt-1">
                      {emp.employeeCode}
                    </div>
                  </td>

                  {/* Check-In Column */}
                  <td className="p-4 text-[#333333]">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-[#02C39A]" />
                      {emp.checkInTime
                        ? new Date(emp.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "--:--"
                      }
                    </div>
                  </td>

                  {/* Check-Out Column */}
                  <td className="p-4">
                    {emp.checkOutTime ? (
                      <div className="flex items-center gap-2 text-[#05668D] font-bold">
                        <CheckCircle size={14} className="text-[#05668D]" />
                        {new Date(emp.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ) : (
                      <span className="text-[#9B9B9B] italic text-xs bg-gray-50 px-2 py-1 rounded">Pending...</span>
                    )}
                  </td>

                  {/* Status Column with Professional Badge */}
                  <td className="p-4">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                      ${style.bg} ${style.text} ${style.border}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${style.dot} ${emp.status === 'PRESENT' ? 'animate-pulse' : ''}`}></span>
                      {style.label}
                    </span>
                  </td>

                  {/* Action Column */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleCheckOut(emp.employeeId)}
                      disabled={!!emp.checkOutTime}
                      className={`
                        group relative inline-flex items-center justify-center gap-2 w-36 h-9 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all duration-200
                        ${emp.checkOutTime
                          ? "bg-gray-50 border-gray-200 text-[#9B9B9B] cursor-not-allowed"
                          : "bg-white border-[#05668D] text-[#05668D] hover:bg-[#05668D] hover:text-white hover:shadow-md active:scale-95"}
                      `}
                    >
                      {emp.checkOutTime ? (
                        <>COMPLETED</>
                      ) : (
                        <>MANUAL CHECK-OUT</>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CheckOutTab;