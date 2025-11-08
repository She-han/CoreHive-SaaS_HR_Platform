export default function EmployeeTable() {
  const employees = [
    { name: "John Doe", type: "Monthly", dept: "HR", salary: "75,000", status: "Active" },
    { name: "Jane Smith", type: "Daily", dept: "IT", salary: "3,000", status: "Inactive" },
    { name: "Robert Brown", type: "Daily", dept: "Finance", salary: "2,500", status: "Inactive" },
    { name: "Emily Johnson", type: "Daily", dept: "IT", salary: "2,500", status: "Active" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Department</th>
            <th className="p-2">Salary</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2">{emp.name}</td>
              <td className="p-2">{emp.type}</td>
              <td className="p-2">{emp.dept}</td>
              <td className="p-2">{emp.salary}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {emp.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
