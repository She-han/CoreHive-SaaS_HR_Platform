import { useEffect, useState } from "react";
import axios from "axios";
import formatAmount from "../../../components/FormatAmount";

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
        <p className="text-[#9B9B9B] font-medium">Complete payroll history</p>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto border border-[#9B9B9B] rounded-lg shadow-sm bg-white">
        <table className="w-full">
          <thead className="bg-[#0C397A] text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Month</th>
              <th className="p-3 text-left">Net Salary (Rs.)</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((rec) => (
              <tr
                key={rec.id}
                className="border-b border-[#F1FDF9] hover:bg-[#F1FDF9] transition"
              >
                <td className="p-3 text-[#333333]">{rec.employeeId}</td>
                <td className="p-3 text-[#333333]">{rec.periodYear}</td>
                <td className="p-3 text-[#333333]">{rec.periodMonth}</td>

                {/* Net Salary */}
                <td className="p-3 font-semibold text-[#05668D]">
                  {formatAmount(rec.netSalary)}
                </td>

                {/* Status Badge */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold 
                    ${
                      rec.paymentStatus === "PAID"
                        ? "bg-[#1ED292]/20 text-[#02C39A]"
                        : "bg-[#9B9B9B]/20 text-[#333333]"
                    }
                  `}
                  >
                    {rec.paymentStatus}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
