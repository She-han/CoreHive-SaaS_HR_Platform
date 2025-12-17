export default function PayrollRun() {
  return (
    <div className="p-8 bg-white w-full h-screen flex flex-col">

      <h1 className="text-2xl font-bold text-[#333333]">Run Monthly Payroll</h1>
      <p className="text-[#9B9B9B] mb-6">Select a month and generate payroll</p>

      <div className="max-w-lg bg-[#F1FDF9] p-6 rounded-lg border border-[#02C39A]">
        <label className="text-[#333333] font-semibold">Select Month</label>
        <input
          type="month"
          className="w-full border border-[#9B9B9B] p-2 rounded-lg mt-2"
        />

        <button className="w-full mt-4 py-2 bg-[#05668D] text-white rounded-lg hover:bg-[#02C39A]">
          Generate Payroll
        </button>
      </div>
    </div>
  );
}
