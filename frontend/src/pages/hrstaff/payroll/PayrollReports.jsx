import { useEffect, useState } from "react";
import axios from "axios";

const BASE = "http://localhost:8080/api";

export default function PayrollReports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${BASE}/payroll/all`).then((res) => setData(res.data));
  }, []);

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">

      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#333333]">Payroll Reports</h1>
        <p className="text-[#9B9B9B] font-medium">
          Complete payroll history
        </p>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto border rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-[#F1FDF9] sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Month</th>
              <th className="p-3 text-left">Net Salary</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((rec) => (
              <tr key={rec.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{rec.employeeId}</td>
                <td className="p-3">{rec.periodYear}</td>
                <td className="p-3">{rec.periodMonth}</td>
                <td className="p-3">{rec.netSalary}</td>
                <td className="p-3">{rec.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
