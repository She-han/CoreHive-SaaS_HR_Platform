export default function PayrollReports() {
  return (
    <div className="p-8 bg-white w-full h-screen">

      <h1 className="text-2xl font-bold text-[#333333]">Payroll Reports</h1>
      <p className="text-[#9B9B9B] mb-6">Generate downloadable payroll reports</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="p-6 bg-[#F1FDF9] rounded-lg border border-[#02C39A]">
          <h2 className="font-semibold text-[#333333]">Monthly Payroll Summary</h2>
          <button className="mt-3 px-4 py-2 bg-[#05668D] text-white rounded-lg hover:bg-[#02C39A]">
            Download
          </button>
        </div>

        <div className="p-6 bg-[#F1FDF9] rounded-lg border border-[#02C39A]">
          <h2 className="font-semibold text-[#333333]">Allowance Report</h2>
          <button className="mt-3 px-4 py-2 bg-[#05668D] text-white rounded-lg hover:bg-[#02C39A]">
            Download
          </button>
        </div>

      </div>

    </div>
  );
}
