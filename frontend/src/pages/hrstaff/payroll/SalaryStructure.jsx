export default function SalaryStructure() {
  return (
    <div className="p-8 bg-white w-full h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Salary Structure</h1>
          <p className="text-[#9B9B9B]">Manage employee salary details</p>
        </div>

        <button className="px-4 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#1ED292]">
          Add Salary Structure
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#0C397A] text-white">
            <th className="p-3 text-left">Employee</th>
            <th className="p-3 text-left">Basic</th>
            <th className="p-3 text-left">Allowances</th>
            <th className="p-3 text-left">Deductions</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3">Kavindu Perera</td>
            <td className="p-3">Rs. 80,000</td>
            <td className="p-3">Rs. 15,000</td>
            <td className="p-3">Rs. 3,000</td>
            <td className="p-3">
              <button className="text-[#05668D] hover:text-[#02C39A]">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
