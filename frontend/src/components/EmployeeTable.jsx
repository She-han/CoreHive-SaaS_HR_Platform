import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import EmployeeModal from "./EmployeeModal"; // ✅ import modal

export default function EmployeeTable({ search, filterBy }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/employees")
      .then((res) => setEmployees(res.data))
      .catch(console.error);
  }, []);

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="overflow-x-auto relative">
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
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b hover:bg-[#F1FDF9] transition cursor-pointer"
              onClick={() => handleRowClick(emp)}
            >
              <td className="p-3 font-medium text-[#333333]">{emp.employeeCode}</td>
              <td className="p-3">{emp.firstName} {emp.lastName}</td>
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
              <td
                className="p-3 flex justify-center gap-4"
                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking icons
              >
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

      {/* ✅ Include Modal Component */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
