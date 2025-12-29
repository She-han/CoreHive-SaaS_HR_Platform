import { useEffect, useState } from "react";
import axios from "axios";

export default function MonthlyReport() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/hr/reports/monthly?year=2025&month=11")
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#333333] mb-4">Monthly Report</h2>

      <pre className="bg-white p-4 rounded shadow">
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  );
}
