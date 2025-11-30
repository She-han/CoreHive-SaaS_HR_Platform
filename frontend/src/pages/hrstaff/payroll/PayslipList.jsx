import { useEffect, useState } from "react";
import axios from "axios";

const BASE = "http://localhost:8080/api";

export default function PayslipList() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [payslips, setPayslips] = useState([]);

  const loadPayslips = () => {
    axios
      .get(`${BASE}/payroll/payslips?year=${year}&month=${month}`)
      .then((res) => setPayslips(res.data));
  };

  const markPaid = (id) => {
    axios.post(`${BASE}/payroll/${id}/pay`).then(() => loadPayslips());
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  return (
    <div className="p-8 overflow-auto">
      <h1 className="text-2xl font-bold text-[#333333]">Monthly Payslips</h1>
      <p className="text-[#9B9B9B] font-medium mb-6">Employee payroll details</p>

      <div className="flex gap-4 mb-4">

        <select value={year} onChange={(e) => setYear(e.target.value)} className="border p-2 rounded">
          {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border p-2 rounded">
          {[...Array(12).keys()].map((m) => <option key={m + 1}>{m + 1}</option>)}
        </select>

        <button onClick={loadPayslips} className="px-4 py-2 bg-[#02C39A] text-white rounded">
          Load
        </button>

      </div>

      <table className="w-full border shadow">
        <thead className="bg-[#F1FDF9]">
          <tr>
            <th className="p-3">Employee</th>
            <th className="p-3">Basic</th>
            <th className="p-3">Allowances</th>
            <th className="p-3">Deductions</th>
            <th className="p-3">Net</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        
        <tbody>
          {payslips.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">{p.employeeName}</td>
              <td className="p-3">{p.basicSalary}</td>
              <td className="p-3">{p.allowances}</td>
              <td className="p-3">{p.deductions}</td>
              <td className="p-3 font-semibold">{p.netSalary}</td>
              <td className="p-3">{p.paymentStatus}</td>
              <td className="p-3">
                {p.paymentStatus === "PENDING" && (
                  <button
                    onClick={() => markPaid(p.id)}
                    className="px-3 py-1 rounded bg-[#0C397A] text-white"
                  >
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
