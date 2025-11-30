// src/pages/hrstaff/payroll/PayrollDashboard.jsx
import { Link } from "react-router-dom";
import {
  FaMoneyCheckAlt,
  FaListAlt,
  FaPlayCircle,
  FaChartBar,
} from "react-icons/fa";

export default function PayrollDashboard() {
  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">

      {/* Header Section (Matches EmployeeManagement.jsx) */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Payroll Management</h1>
          <p className="text-[#9B9B9B] font-medium">
            Manage salaries, payroll runs & payslips
          </p>
        </div>
      </div>

      {/* Cards Grid - Scrollable Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">

          {/* Salary Structure */}
          <Link
            to="/hr_staff/payroll/salary-structure"
            className="group bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#02C39A] text-white text-3xl group-hover:bg-[#1ED292] transition-all">
                <FaMoneyCheckAlt />
              </div>
              <h2 className="text-lg font-semibold text-[#333333] group-hover:text-[#02C39A]">
                Salary Structure
              </h2>
              <p className="text-sm text-[#9B9B9B]">
                View and configure salary breakdowns.
              </p>
            </div>
          </Link>

          {/* Run Payroll */}
          <Link
            to="/hr_staff/payroll/run"
            className="group bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#05668D] text-white text-3xl group-hover:bg-[#0C397A] transition-all">
                <FaPlayCircle />
              </div>
              <h2 className="text-lg font-semibold text-[#333333] group-hover:text-[#05668D]">
                Run Payroll
              </h2>
              <p className="text-sm text-[#9B9B9B]">
                Calculate employee salaries.
              </p>
            </div>
          </Link>

          {/* Payslip List */}
          <Link
            to="/hr_staff/payroll/payslips"
            className="group bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#0C397A] text-white text-3xl group-hover:bg-[#05668D] transition-all">
                <FaListAlt />
              </div>
              <h2 className="text-lg font-semibold text-[#333333] group-hover:text-[#0C397A]">
                Payslip List
              </h2>
              <p className="text-sm text-[#9B9B9B]">
                Browse employee monthly payslips.
              </p>
            </div>
          </Link>

          {/* Payroll Reports */}
          <Link
            to="/hr_staff/payroll/reports"
            className="group bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#333333] text-white text-3xl group-hover:bg-black transition-all">
                <FaChartBar />
              </div>
              <h2 className="text-lg font-semibold text-[#333333] group-hover:text-black">
                Payroll Reports
              </h2>
              <p className="text-sm text-[#9B9B9B]">
                View payroll analytics & summaries.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
