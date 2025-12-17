import { Link } from "react-router-dom";
import { FaMoneyBill, FaCogs, FaFileInvoice, FaChartBar } from "react-icons/fa";

export default function PayrollDashboard() {
  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#333333]">Payroll Management</h1>
        <p className="text-[#9B9B9B] font-medium">
          Manage salary structures, monthly payroll, payslips & reports
        </p>
      </div>

      {/* NAV GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Salary Structure */}
        <Link
          to="/hr_staff/payroll/salary-structure"
          className="p-6 bg-[#F1FDF9] rounded-xl border border-[#02C39A] shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <FaCogs className="text-4xl text-[#05668D]" />
            <div>
              <h2 className="text-xl font-semibold text-[#333333]">Salary Structure</h2>
              <p className="text-sm text-[#9B9B9B]">Define basic pay, allowances, deductions</p>
            </div>
          </div>
        </Link>

        {/* 2. Payroll Run */}
        <Link
          to="/hr_staff/payroll/payroll-run"
          className="p-6 bg-[#F1FDF9] rounded-xl border border-[#02C39A] shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <FaMoneyBill className="text-4xl text-[#1ED292]" />
            <div>
              <h2 className="text-xl font-semibold text-[#333333]">Payroll Run</h2>
              <p className="text-sm text-[#9B9B9B]">Process monthly salary calculations</p>
            </div>
          </div>
        </Link>

        {/* 3. Payslips */}
        <Link
          to="/hr_staff/payroll/payslips"
          className="p-6 bg-[#F1FDF9] rounded-xl border border-[#02C39A] shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <FaFileInvoice className="text-4xl text-[#0C397A]" />
            <div>
              <h2 className="text-xl font-semibold text-[#333333]">Payslip List</h2>
              <p className="text-sm text-[#9B9B9B]">View & download employee payslips</p>
            </div>
          </div>
        </Link>

        {/* 4. Reports */}
        <Link
          to="/hr_staff/payroll/reports"
          className="p-6 bg-[#F1FDF9] rounded-xl border border-[#02C39A] shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <FaChartBar className="text-4xl text-[#02C39A]" />
            <div>
              <h2 className="text-xl font-semibold text-[#333333]">Payroll Reports</h2>
              <p className="text-sm text-[#9B9B9B]">Salary summaries & tax reports</p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
