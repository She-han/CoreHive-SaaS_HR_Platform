import { useState } from "react";
import { getMonthlyEmployeeReport } from "../../../api/HrReportsApi";

export default function MonthlyReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      const data = await getMonthlyEmployeeReport(month, year);
      setReport(data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-[#0C397A] mb-4">
        Monthly HR Report
      </h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="number"
          placeholder="Month"
          className="border p-2 rounded"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          className="border p-2 rounded"
          value={year}
          onChange={e => setYear(e.target.value)}
        />
        <button
          onClick={fetchReport}
          className="bg-[#02C39A] text-white px-4 rounded"
        >
          Generate
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F1FDF9] p-4 rounded">
            <p className="text-[#9B9B9B]">New Hires</p>
            <p className="text-2xl font-bold text-[#1ED292]">
              {report.newHires}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
