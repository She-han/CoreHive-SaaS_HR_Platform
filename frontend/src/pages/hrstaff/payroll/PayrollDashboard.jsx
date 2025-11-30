// src/pages/hrstaff/payroll/PayrollDashboard.jsx
import { Link } from "react-router-dom";
import { FaMoneyCheckAlt, FaListAlt, FaPlayCircle, FaChartBar } from "react-icons/fa";

export default function PayrollDashboard() {
  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-[#F1FDF9] to-white min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-[#05668D]">
          Payroll Management
        </h1>
        <p className="text-[#556] mt-1">
          Manage salaries, run payroll, and view reports simply.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

          {/* Salary Structure */}
          <Link
            to="/hr_staff/payroll/salary-structure"
            className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="p-4 rounded-xl bg-[#02C39A] text-white text-3xl group-hover:bg-[#1ED292] transition-all duration-300">
                <FaMoneyCheckAlt />
              </div>
              <h2 className="text-xl font-semibold text-[#333333] group-hover:text-[#02C39A]">
                Salary Structure
              </h2>
              <p className="text-sm text-gray-500">
                View and configure salary breakdowns.
              </p>
            </div>
          </Link>

          {/* Run Payroll */}
          <Link
            to="/hr_staff/payroll/run"
            className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="p-4 rounded-xl bg-[#05668D] text-white text-3xl group-hover:bg-[#0C397A] transition-all duration-300">
                <FaPlayCircle />
              </div>
              <h2 className="text-xl font-semibold text-[#333333] group-hover:text-[#05668D]">
                Run Payroll
              </h2>
              <p className="text-sm text-gray-500">
                Calculate employee salaries for a selected period.
              </p>
            </div>
          </Link>

          {/* Payslip List */}
          <Link
            to="/hr_staff/payroll/payslips"
            className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="p-4 rounded-xl bg-[#0C397A] text-white text-3xl group-hover:bg-[#05668D] transition-all duration-300">
                <FaListAlt />
              </div>
              <h2 className="text-xl font-semibold text-[#333333] group-hover:text-[#0C397A]">
                Payslip List
              </h2>
              <p className="text-sm text-gray-500">
                Browse monthly payslips for employees.
              </p>
            </div>
          </Link>

          {/* Payroll Reports */}
          <Link
            to="/hr_staff/payroll/reports"
            className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="p-4 rounded-xl bg-[#333333] text-white text-3xl group-hover:bg-black transition-all duration-300">
                <FaChartBar />
              </div>
              <h2 className="text-xl font-semibold text-[#333333] group-hover:text-black">
                Payroll Reports
              </h2>
              <p className="text-sm text-gray-500">
                View analytics & month-wise payroll summaries.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
