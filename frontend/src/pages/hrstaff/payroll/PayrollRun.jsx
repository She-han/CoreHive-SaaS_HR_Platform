import { useState } from "react";
import axios from "axios";
import { FiCalendar, FiClock, FiPlayCircle } from "react-icons/fi";

const BASE = "http://localhost:8080/api";

export default function PayrollRun() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    try {
      setLoading(true);

      await axios.post(`${BASE}/payroll/run`, {
        year,
        month,
      });

      alert("Payroll generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to run payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#F1FDF9] min-h-screen">

      {/* TITLE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#333333]">Run Monthly Payroll</h1>
        <p className="text-[#9B9B9B] text-sm">
          Select a month & year to process payroll for all employees
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E9F7F3] max-w-3xl">

        {/* SECTION HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#05668D] text-white p-3 rounded-xl">
            <FiCalendar size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#333333]">
              Payroll Processing Period
            </h2>
            <p className="text-sm text-[#9B9B9B]">
              Choose the month & year for which payroll will be generated.
            </p>
          </div>
        </div>

        {/* INPUTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-[#333]">Select Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#02C39A]"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#333]">Select Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#02C39A]"
            >
              {[...Array(12).keys()].map((m) => (
                <option key={m + 1} value={m + 1}>
                  {m + 1} – {new Date(0, m).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-[#F1FDF9] p-4 rounded-xl border border-[#DFF7EB] flex items-start gap-3 mb-6">
          <FiClock className="text-[#02C39A] mt-1" size={20} />
          <p className="text-sm text-[#333]">
            The payroll process will calculate employee salary, allowances,
            deductions & generate payslips for the selected period as you provided salary structure.
          </p>
        </div>

        {/* RUN BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={run}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg shadow 
              ${loading ? "bg-gray-400" : "bg-[#05668D] hover:bg-[#0C397A] transition"}`}
          >
            <FiPlayCircle size={20} />
            {loading ? "Processing..." : "Run Payroll"}
          </button>
        </div>

      </div>

      {/* FOOT NOTE */}
      <p className="text-center text-sm text-[#9B9B9B] mt-6">
        Once payroll is processed, payslips will be available in the Payslip List.
      </p>
    </div>
  );
}
