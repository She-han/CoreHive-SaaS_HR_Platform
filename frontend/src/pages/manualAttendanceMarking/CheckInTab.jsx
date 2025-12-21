import React, { useEffect, useState } from "react";
import { getCheckInList, manualCheckIn , updateAttendanceStatus } from "../../api/manualAttendanceService";
import { Search, CheckCircle2, Clock } from "lucide-react";

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

    const handleStatusChange = async (employeeId, newStatus) => {
  try {
    const updated = await updateAttendanceStatus(employeeId, newStatus, token);

    setEmployees(prev =>
      prev.map(emp =>
        emp.employeeId === employeeId
          ? { ...emp, status: updated.status }
          : emp
      )
    );
  } catch (err) {
    // Axios backend error
    if (err.response && err.response.data) {
      const message = err.response.data.message || "Something went wrong";
      alert(message); // Show backend error
    } else {
      alert(err.message); // Fallback
    }
  }
};



  const fetchEmployees = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCheckInList(token);
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCheckIn = async (employeeId) => {
    try {
      await manualCheckIn(employeeId, token);
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" size={18} />
        <input
          type="text"
          placeholder="Search by employee name..."
          className="w-full pl-10 pr-4 py-2 border border-[#9B9B9B] rounded-lg text-sm focus:ring-2 focus:ring-[#02C39A] focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#F1FDF9] text-[#0C397A] font-semibold">
            <tr>
              <th className="p-4 text-left">Employee Name</th>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Check-In Time</th> {/* NEW COLUMN */}
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center p-10 text-[#9B9B9B]">Loading...</td></tr>
            ) : filteredEmployees.map((emp) => (
              <tr key={emp.employeeId} className="hover:bg-[#E6FFFA] transition">
                <td className="p-4 font-medium text-[#333333]">
                  {emp.employeeName}
                </td>
                <td className="p-4 text-[#9B9B9B] font-mono">{emp.employeeCode}</td>
                <td className="p-4">
                    <select
                        value={emp.status}
                        disabled={emp.status === "NOT_CHECKED_IN"}
                        onChange={(e) => handleStatusChange(emp.employeeId, e.target.value)}
                        className="px-3 py-2 border rounded-md text-xs font-semibold
                                border-gray-300 focus:ring-2 focus:ring-[#02C39A]"
                    >
                        {emp.status === "NOT_CHECKED_IN" && (
                        <option value="NOT_CHECKED_IN">NOT CHECKED IN</option>
                        )}

                        {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>
                            {status.replace("_", " ")}
                        </option>
                        ))}
                    </select>
                    </td>
                {/* CHECK-IN TIME DISPLAY */}
                <td className="p-4">
                  <div className="flex items-center gap-2 text-[#333333]">
                    <Clock size={14} className="text-[#02C39A]" />
                    <span className="font-medium">
                      {emp.checkInTime 
                        ? new Date(emp.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : "--:--"}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex justify-center">
                    {emp.status === "NOT_CHECKED_IN" ? (
                      <button 
                        onClick={() => handleCheckIn(emp.employeeId)}
                        className="flex items-center justify-center gap-2 w-32 h-10 rounded border border-[#02C39A] bg-[#F1FDF9] text-[#02C39A] hover:bg-[#02C39A] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm"
                      >
                        Check In
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-[#02C39A] font-bold text-xs uppercase tracking-tight">
                        <CheckCircle2 size={16} /> Recorded
                      </div>
                    )}
                  </div>
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