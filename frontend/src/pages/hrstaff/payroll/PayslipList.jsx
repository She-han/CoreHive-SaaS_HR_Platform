export default function PayslipList() {
  return (
    <div className="p-8 bg-white w-full h-screen">

      <h1 className="text-2xl font-bold text-[#333333]">Payslip List</h1>
      <p className="text-[#9B9B9B] mb-6">View and download generated payslips</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 border rounded-lg shadow-md bg-[#F1FDF9]">
          <h2 className="text-lg font-semibold text-[#333333]">Kavindu Perera</h2>
          <p className="text-[#9B9B9B] text-sm">Month: November 2025</p>
          <button className="mt-3 px-4 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#1ED292]">
            Download PDF
          </button>
        </div>
      </div>

    </div>
  );
}
