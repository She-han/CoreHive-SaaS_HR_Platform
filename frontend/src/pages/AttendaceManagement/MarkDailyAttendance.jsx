import { useEffect, useState } from "react";
import axios from "axios";

export default function MarkDailyAttendance() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/hr/reports/daily?date=2025-11-25")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="p-4">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#02C39A] text-white p-4 rounded-lg">Present: {summary.summary.present}</div>
        <div className="bg-[#0C397A] text-white p-4 rounded-lg">Absent: {summary.summary.absent}</div>
        <div className="bg-[#05668D] text-white p-4 rounded-lg">Late: {summary.summary.late}</div>
        <div className="bg-[#1ED292] text-white p-4 rounded-lg">Leave: {summary.summary.onLeave}</div>
      </div>

      <pre className="bg-white p-4 rounded shadow">
        {JSON.stringify(summary.data, null, 2)}
      </pre>
    </div>
  );
}
