import React, { useEffect, useState } from "react";
import { getPendingCheckouts, manualCheckOut } from "../../api/manualAttendanceService";
import { Clock, CheckCircle, Timer } from "lucide-react";

const CheckOutTab = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

 const fetchPending = async () => {
  if (!token) return;
  setLoading(true);
  try {
    const data = await getPendingCheckouts(token);
    setEmployees(data); // ABSENT & ON_LEAVE already filtered
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchPending(); }, []);

  // Helper to calculate worked hours and minutes
  const calculateWorkedHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffInMs = end - start;
    
    const totalMinutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const handleCheckOut = async (employeeId) => {
    try {
      const updated = await manualCheckOut(employeeId, token);
      setEmployees(prev => prev.map(emp => 
        emp.employeeId === updated.employeeId ? { ...emp, ...updated } : emp
      ));
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#F1FDF9] text-[#05668D] font-semibold">
          <tr>
            <th className="p-4 text-left">Employee Information</th>
            <th className="p-4 text-left">Check-In</th>
            <th className="p-4 text-left">Check-Out</th>
            <th className="p-4 text-left">Worked Hours</th> {/* NEW COLUMN */}
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
             <tr><td colSpan="5" className="text-center p-10 text-[#9B9B9B]">Loading...</td></tr>
          ) : employees.map((emp) => (
            <tr key={emp.employeeId} className="hover:bg-[#F1FDF9]/40 transition">
              <td className="p-4">
                <div className="font-bold text-[#333333]">{emp.employeeName}</div>
                <div className="text-[10px] text-[#9B9B9B] font-bold uppercase tracking-widest">{emp.employeeCode}</div>
              </td>
              
              <td className="p-4">
                <div className="flex items-center gap-2 text-[#333333] font-medium">
                  <Clock size={14} className="text-[#02C39A]" />
                  {emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                </div>
              </td>

              <td className="p-4">
                {emp.checkOutTime ? (
                  <div className="flex items-center gap-2 text-[#05668D] font-bold">
                    <CheckCircle size={14} /> 
                    {new Date(emp.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                ) : (
                  <span className="text-[#9B9B9B] italic text-xs">Not Checked Out</span>
                )}
              </td>

              {/* WORKED HOURS DISPLAY */}
              <td className="p-4">
                {emp.checkOutTime ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#F1FDF9] border border-[#02C39A]/20 rounded-md w-fit">
                    <Timer size={14} className="text-[#02C39A]" />
                    <span className="font-bold text-[#333333]">
                      {calculateWorkedHours(emp.checkInTime, emp.checkOutTime)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#9B9B9B] text-xs">—</span>
                )}
              </td>

              <td className="p-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => handleCheckOut(emp.employeeId)}
                    disabled={
                        !!emp.checkOutTime ||
                        emp.status === "ABSENT" ||
                        emp.status === "ON_LEAVE"
                      }
                    className={`
                      flex items-center justify-center gap-2 w-32 h-10 rounded border transition-all duration-300 text-[10px] font-bold uppercase tracking-wider
                      ${emp.checkOutTime 
                        ? "bg-gray-50 border-gray-200 text-[#9B9B9B] cursor-not-allowed" 
                        : "bg-white border-[#05668D] text-[#05668D] hover:bg-[#05668D] hover:text-white shadow-sm"}
                    `}
                  >
                    {emp.checkOutTime ? "Finalized" : "Check Out"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckOutTab;