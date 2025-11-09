import { FaEdit, FaTrash } from "react-icons/fa"; //Imports Font icons (edit 🖊️ and trash 🗑️) 
import { useState } from "react";

export default function EmployeeTable({ search, filterBy }) {
  const [employees] = useState([
    { id: 1, employeeCode: "EMP001", name: "John Doe", designation: "HR Officer", department: "HR", phone: "(+94)77 123 4567", isActive: true },
    { id: 2, employeeCode: "EMP002", name: "Jane Smith", designation: "Software Engineer", department: "IT", phone: "(+94)77 987 6543", isActive: false },
    { id: 3, employeeCode: "EMP003", name: "Michael Brown", designation: "Project Manager", department: "IT", phone: "(+94)71 234 5678", isActive: true },
  ]);

  const filteredEmployees = employees.filter((emp) =>
    emp[filterBy].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F1FDF9] text-[#0C397A]">
          <tr>
            <th className="p-3">Emp Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">Designation</th>
            <th className="p-3">Department</th>
            <th className="p-3">Contact</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b hover:bg-[#F1FDF9] transition"
            >
              <td className="p-3 font-medium text-[#333333]">{emp.employeeCode}</td>
              <td className="p-3">{emp.name}</td>
              <td className="p-3">{emp.designation}</td>
              <td className="p-3">{emp.department}</td>
              <td className="p-3">{emp.phone}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    emp.isActive
                      ? "bg-[#1ED292]/10 text-[#1ED292]"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {emp.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-3 flex justify-center gap-4">
                <button className="text-[#05668D] hover:text-[#02C39A]">
                  <FaEdit />
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
