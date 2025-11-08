export default function EmployeeTable() {
  const employees = [
    // Sample employee data
    { name: "John Doe", type: "Monthly", dept: "HR", salary: "75,000", status: "Active" },
    { name: "Jane Smith", type: "Daily", dept: "IT", salary: "3,000", status: "Inactive" },
    { name: "Robert Brown", type: "Daily", dept: "Finance", salary: "2,500", status: "Inactive" },
    { name: "Emily Johnson", type: "Daily", dept: "IT", salary: "2,500", status: "Active" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        {/* Table for Medium & Larger Screens */}
        <table className="hidden sm:table min-w-full text-sm">
          <thead>
            <tr className="border-b text-left bg-gray-100">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Department</th>
              <th className="p-3 font-semibold">Salary</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.type}</td>
                <td className="p-3">{emp.dept}</td>
                <td className="p-3">{emp.salary}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Card Layout for Mobile Screens */}
        <div className="sm:hidden space-y-4">
          {employees.map((emp, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-gray-900">{emp.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {emp.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium text-gray-900">Type:</span> {emp.type}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Department:</span> {emp.dept}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Salary:</span> {emp.salary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
