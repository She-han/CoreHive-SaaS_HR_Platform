import { useState } from "react";
import { getAnnualEmployeeGrowthReport } from "../../../api/HrReportsApi";

export default function AnnualReport() {
  const [year, setYear] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {
    try {
      const res = await getAnnualEmployeeGrowthReport(year);
      setData(res);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-[#0C397A] mb-4">
        Annual Employee Growth
      </h2>

      <div className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Year"
          className="border p-2 rounded"
          value={year}
          onChange={e => setYear(e.target.value)}
        />
        <button
          onClick={loadReport}
          className="bg-[#05668D] text-white px-4 rounded"
        >
          View
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data).map(([month, count]) => (
            <div
              key={month}
              className="bg-[#F1FDF9] p-3 rounded text-center"
            >
              <p className="text-[#9B9B9B]">Month {month}</p>
              <p className="text-lg font-bold text-[#333333]">
                {count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
