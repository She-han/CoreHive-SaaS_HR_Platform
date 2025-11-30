import { useEffect, useState } from "react";
import axios from "axios";

const BASE = "http://localhost:8080/api";

export default function PayrollReports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${BASE}/payroll/all`).then((res) => setData(res.data));
  }, []);

  return (
    <div className="p-8 overflow-auto">
      <h1 className="text-2xl font-bold text-[#333333]">Payroll Reports</h1>
      <p className="text-[#9B9B9B] font-medium mb-6">Complete payroll history</p>

      <table className="w-full border shadow">
        <thead className="bg-[#F1FDF9]">
          <tr>
            <th className="p-3">Employee ID</th>
            <th className="p-3">Year</th>
            <th className="p-3">Month</th>
            <th className="p-3">Net Salary</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((rec) => (
            <tr key={rec.id} className="border-b">
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
  );
}
