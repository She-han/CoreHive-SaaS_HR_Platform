import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import formatAmount from "../../../components/FormatAmount";

const BASE = "http://localhost:8080/api";

export default function PayslipList() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [payslips, setPayslips] = useState([]);
  const [animatingRow, setAnimatingRow] = useState(null);

  // const formatRs = (value) => {
  //   if (!value) return "Rs. 0.00";
  //   return (
  //     "Rs. " +
  //     Number(value).toLocaleString("en-LK", {
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 2,
  //     })
  //   );
  // };

  const loadPayslips = () => {
    axios
      .get(`${BASE}/payroll/payslips?year=${year}&month=${month}`)
      .then((res) => setPayslips(res.data));
  };

  const markPaid = (id) => {
    if (!window.confirm("Are you sure you want to mark this employee as PAID?")) {
      return;
    }

    setAnimatingRow(id);

    axios.post(`${BASE}/payroll/${id}/pay`).then(() => {
      setTimeout(() => {
        loadPayslips();
        setAnimatingRow(null);
      }, 300);
    });
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">

      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#333333]">Monthly Payslips</h1>
        <p className="text-[#9B9B9B] font-medium">Employee payroll details</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 shrink-0">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-[#9B9B9B] rounded-lg p-2 text-sm text-[#333333]"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-[#9B9B9B] rounded-lg p-2 text-sm text-[#333333]"
        >
          {[...Array(12).keys()].map((m) => (
            <option key={m + 1}>{m + 1}</option>
          ))}
        </select>

        <button
          onClick={loadPayslips}
          className="px-4 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#1ED292] transition-all"
        >
          Load
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto border border-[#9B9B9B] rounded-lg shadow-sm bg-white">
        <table className="w-full">
          
          {/* Matching Header with Navy Theme */}
          <thead className="bg-[#0C397A] text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Basic</th>
              <th className="p-3 text-left">Allowances (Rs.)</th>
              <th className="p-3 text-left">Deductions (Rs.)</th>
              <th className="p-3 text-left">Net Salary (Rs.)</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {payslips.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-[#F1FDF9] transition-all ${
                  animatingRow === p.id ? "opacity-50" : "opacity-100"
                } hover:bg-[#F1FDF9]`}
              >
                <td className="p-3 text-[#333333]">{p.employeeName}</td>

                <td className="p-3 text-[#333333]">
                  {formatAmount(p.basicSalary)}
                </td>

                <td className="p-3 text-[#02C39A] font-semibold">
                  {formatAmount(p.allowances)}
                </td>

                <td className="p-3 text-[#333333] font-semibold">
                  {formatAmount(p.deductions)}
                </td>

                <td className="p-3 text-[#05668D] font-bold">
                  {formatAmount(p.netSalary)}
                </td>

                {/* Status Badge */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-2 ${
                      p.paymentStatus === "PAID"
                        ? "bg-[#1ED292]/20 text-[#02C39A]"
                        : "bg-[#9B9B9B]/20 text-[#333333]"
                    }`}
                  >
                    {p.paymentStatus === "PAID" && (
                      <FaCheckCircle className="text-[#02C39A]" />
                    )}
                    {p.paymentStatus}
                  </span>
                </td>

                {/* Action Button */}
                <td className="p-3">
                  {p.paymentStatus === "PENDING" ? (
                    <button
                      onClick={() => markPaid(p.id)}
                      className="flex items-center gap-2 bg-[#05668D] text-white px-3 py-1 rounded hover:bg-[#0C397A] transition-all"
                    >
                      <FiCheck size={16} />
                      Pay
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-1 rounded bg-[#1ED292]/20 text-[#02C39A] text-sm font-semibold animate-fadeIn">
                      <FaCheckCircle size={16} />
                      Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
