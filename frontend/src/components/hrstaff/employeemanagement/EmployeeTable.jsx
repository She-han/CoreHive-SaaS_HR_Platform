import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import EmployeeModal from "./EmployeeModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link } from "react-router-dom";
 import {getAllEmployees , deactivateEmployee} from "../../../api/employeeService"

const MySwal = withReactContent(Swal);

export default function EmployeeTable({ search, filterBy }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading , setLoading] = useState(false);
   const orgUuid = "org-uuid-001";

  
   useEffect(() => {
    setLoading(true);
    getAllEmployees(orgUuid)
      .then((data) => {
        console.log("API returned:", data); // 👈 ADD THIS
      setEmployees(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error for getting employees", err))
      .finally(() => setLoading(false));
  }, []);

  //Filtering Logic
  const filteredEmployees = employees.filter((emp) => {
    const text = search.toLowerCase();

    switch (filterBy) {
      case "name":
        return (
          emp.firstName.toLowerCase().includes(text) ||
          emp.lastName.toLowerCase().includes(text)
        );

      case "employeeCode":
        return emp.employeeCode.toLowerCase().includes(text);

      case "designation":
        return emp.designation.toLowerCase().includes(text);

      case "department":
        return emp.department?.name?.toLowerCase().includes(text);

      case "status":{
        const status = emp.isActive ? "active" : "inactive";
        return status.includes(text);
      }

      default:
        return true;
    }
  });


// Inside your React component
const handleDeactivate = async (id) => {
   console.log("orgUuid:", orgUuid, "employeeId:", id);
  try {
    // Call the service function to deactivate the employee
    await deactivateEmployee(orgUuid, id);

    // Show a success message
    alert("Employee deactivated successfully!");

    // Update your state so the UI reflects the change
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === id ? { ...emp, isActive: false } : emp
      )
    );
  } catch (error) {
    // Handle errors
    console.error("Error deactivating employee:", error);
    alert("Failed to deactivate employee");
  }
};


  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="flex flex-col w-full h-[80vh] border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#02C39A]/50 scrollbar-track-gray-100">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="bg-[#F1FDF9] text-[#0C397A] sticky top-0 z-10 shadow-sm">
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
  {loading ? (
    <tr>
      <td colSpan="7" className="text-center p-5">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#02C39A] border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-500 mt-2">Loading employees...</p>
      </td>
    </tr>
  ) : filteredEmployees.length > 0 ? (
    filteredEmployees.map((emp) => (
      <tr
        key={emp.id}
        className="border-b hover:bg-[#F1FDF9] transition cursor-pointer"
        onClick={() => handleRowClick(emp)}
      >
        <td className="p-3 font-medium text-[#333333]">{emp.employeeCode}</td>
        <td className="p-3">{emp.firstName} {emp.lastName}</td>
        <td className="p-3">{emp.designation}</td>
        <td className="p-3">{emp.department?.name}</td>
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
          <Link
            to={`/hr_staff/editemployee/${emp.id}`}
            className="text-[#05668D] hover:text-[#02C39A]"
            onClick={(e) => e.stopPropagation()}
          >
            <FaEdit />
          </Link>

          <button
            className="text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDeactivate(emp.id);
            }}
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center p-5 text-gray-500">
        No employees found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Modal */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
