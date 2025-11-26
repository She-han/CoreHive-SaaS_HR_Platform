import { useEffect, useState } from "react";
import axios from "axios";

export default function MonitorAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/attendance?date=2025-11-10")
      .then((res) => setAttendance(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = attendance.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* FILTER BAR */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#9B9B9B] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#02C39A]"
        />
      </div>

      {/* TABLE */}
      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-[#F1FDF9] text-[#333333]">
          <tr>
            <th className="p-3 text-left">Employee</th>
            <th className="text-left">Department</th>
            <th className="text-left">Check-In</th>
            <th className="text-left">Check-Out</th>
            <th className="text-left">Working Hours</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((row, i) => (
            <tr key={i} className="border-b hover:bg-[#F1FDF9]">
              <td className="p-3">{row.name}</td>
              <td>{row.dept}</td>
              <td>{row.checkIn || "-"}</td>
              <td>{row.checkOut || "-"}</td>
              <td>
                {row.workingMinutes
                  ? `${Math.floor(row.workingMinutes / 60)}h ${
                      row.workingMinutes % 60
                    }m`
                  : "-"}
              </td>
              <td
                className={`font-semibold ${
                  row.status === "Present" ? "text-[#02C39A]" : "text-red-500"
                }`}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
