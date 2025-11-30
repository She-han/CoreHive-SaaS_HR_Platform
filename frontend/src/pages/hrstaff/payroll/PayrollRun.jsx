import { useState } from "react";
import axios from "axios";

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
        month
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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#333333]">Run Monthly Payroll</h1>
      <p className="text-[#9B9B9B] font-medium mb-6">
        Select the period and generate payroll
      </p>

      <div className="flex gap-4">

        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border p-2 rounded">
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border p-2 rounded">
          {[...Array(12).keys()].map((m) => (
            <option key={m + 1} value={m + 1}>{m + 1}</option>
          ))}
        </select>

        <button
          onClick={run}
          disabled={loading}
          className={`px-5 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-[#05668D]"}`}
        >
          {loading ? "Processing..." : "Run Payroll"}
        </button>

      </div>
    </div>
  );
}
