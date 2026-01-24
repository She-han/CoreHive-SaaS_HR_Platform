import { useState } from "react";
import {
  getAttendanceSummaryReport,
  downloadSummaryExcel
} from "../../api/attendanceApi";

export default function AttendanceReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState([]);

  // Load preview
  const loadReport = async () => {
    const data = await getAttendanceSummaryReport(startDate, endDate);
    setReport(data);
  };

  // Download Excel
  const downloadExcel = async () => {
    const blob = await downloadSummaryExcel(startDate, endDate);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-summary.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-[#F1FDF9] min-h-screen">
      <h2 className="text-xl font-bold text-[#333333] mb-4">
        Attendance Report
      </h2>

      {/* FILTER */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          className="border px-3 py-2 rounded-md"
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded-md"
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={loadReport}
          className="bg-[#02C39A] text-white px-4 py-2 rounded-lg"
        >
          View Report
        </button>

        {report.length > 0 && (
          <button
            onClick={downloadExcel}
            className="bg-[#05668D] text-white px-4 py-2 rounded-lg"
          >
            Download Excel
          </button>
        )}
      </div>

      {/* PREVIEW TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0C397A] text-white">
            <tr>
              <th className="p-3">Employee</th>
              <th>Department</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Leave</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row) => (
              <tr
                key={row.employeeId}
                className="border-b hover:bg-[#F1FDF9]"
              >
                <td className="p-3">{row.employeeName}</td>
                <td>{row.department}</td>
                <td>{row.present}</td>
                <td>{row.absent}</td>
                <td>{row.late}</td>
                <td>{row.leave}</td>
                <td className="font-semibold text-[#02C39A]">
                  {row.attendancePercentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
