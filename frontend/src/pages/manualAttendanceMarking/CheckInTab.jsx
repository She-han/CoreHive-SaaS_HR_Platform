import React, { useEffect, useState } from "react";
import { getCheckInList, manualCheckIn, updateAttendanceStatus } from "../../api/manualAttendanceService";
import { Search, CheckCircle2, Clock, ChevronDown } from "lucide-react";

const CheckInTab = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const STATUS_OPTIONS = [
    "PRESENT",
    "ABSENT",
    "LATE",
    "HALF_DAY",
    "ON_LEAVE",
    "WORK_FROM_HOME"
  ];

  // Logic to apply your palette based on status
  const getModernStatusStyles = (status) => {
    switch (status) {
      case "PRESENT": 
        return "bg-[#F1FDF9] border-[#1ED292] text-[#1ED292]";
      case "ABSENT": 
        return "bg-red-50 border-red-500 text-red-500"; // Specific Red for Absence
      case "LATE": 
        return "bg-[#F1FDF9] border-[#05668D] text-[#05668D]";
      case "HALF_DAY": 
        return "bg-[#FFFFFF] border-[#9B9B9B] text-[#333333]";
      case "ON_LEAVE": 
        return "bg-[#FFFFFF] border-[#0C397A] text-[#0C397A]";
      case "WORK_FROM_HOME": 
        return "bg-[#F1FDF9] border-[#02C39A] text-[#02C39A]";
      default: 
        return "bg-[#FFFFFF] border-[#9B9B9B] text-[#9B9B9B]";
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
  try {
    const updated = await updateAttendanceStatus(
      employeeId,
      newStatus,
      null,      // OR pass a selected time later
      token
    );

    setEmployees(prev =>
      prev.map(emp =>
        emp.employeeId === employeeId
          ? { ...emp, ...updated }
          : emp
      )
    );
  } catch (err) {
    alert(err.message);
  }
};


  const fetchEmployees = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCheckInList(token);
      setEmployees(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCheckIn = async (employeeId) => {
    try {
      await manualCheckIn(employeeId, token);
      fetchEmployees();
    } catch (err) { alert(err.message); }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 bg-[#FFFFFF]">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" size={18} />
        <input
          type="text"
          placeholder="Search employees..."
          className="w-full pl-10 pr-4 py-2 border border-[#9B9B9B] rounded-lg text-sm text-[#333333] focus:ring-2 focus:ring-[#02C39A] focus:outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#9B9B9B]/20">
        <table className="min-w-full divide-y divide-[#9B9B9B]/10">
          <thead className="bg-[#F1FDF9]">
            <tr className="text-[#0C397A] text-[11px] font-bold uppercase tracking-widest">
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Attendance Update</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#9B9B9B]/10">
            {filteredEmployees.map((emp) => (
              <tr key={emp.employeeId} className="hover:bg-[#F1FDF9]/50 transition-all duration-200">
                <td className="p-4 font-semibold text-[#333333]">{emp.employeeName}</td>
                <td className="p-4 text-[#9B9B9B] font-mono text-xs">{emp.employeeCode}</td>
                
                {/* Modern Dropdown Selector */}
                <td className="p-4">
                  <div className="relative w-48">
                    <select
                      value={emp.status}
                      disabled={emp.checkOutTime !== null}
                      onChange={(e) => handleStatusChange(emp.employeeId, e.target.value)}
                      className={`
                        appearance-none w-full px-4 py-2 rounded-lg border-2 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer
                        focus:outline-none shadow-sm
                        ${getModernStatusStyles(emp.status)}
                        ${emp.status === "NOT_CHECKED_IN" ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]"}
                      `}
                    >
                      {emp.status === "NOT_CHECKED_IN" && (
                        <option value="NOT_CHECKED_IN">NOT CHECKED IN</option>
                      )}
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status} className="bg-white text-[#333333]">
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2 text-[#333333] font-medium text-xs">
                    <Clock size={14} className="text-[#02C39A]" />
                    {emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </div>
                </td>

                <td className="p-4 text-center">
                  {emp.status === "NOT_CHECKED_IN" &&
                    emp.status !== "ABSENT" &&
                    emp.status !== "ON_LEAVE" ? (
                    <button 
                      onClick={() => handleCheckIn(emp.employeeId)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg border-2 border-[#02C39A] text-[#02C39A] font-bold text-[10px] uppercase tracking-widest hover:bg-[#02C39A] hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      Check In
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-[#1ED292] font-bold text-[10px] uppercase tracking-widest bg-[#F1FDF9] px-4 py-2 rounded-full border border-[#1ED292]/20">
                      <CheckCircle2 size={14} /> Logged
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckInTab;