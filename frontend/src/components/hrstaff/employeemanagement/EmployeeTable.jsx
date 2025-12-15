import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import EmployeeModal from "./EmployeeModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";

const MySwal = withReactContent(Swal);

export default function EmployeeTable({ search, filterBy }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/employees");
      
      // Extract data from ApiResponse wrapper
      if (response.data.success && Array.isArray(response.data.data)) {
        setEmployees(response.data.data);
      } else {
        console.error('Invalid response format:', response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      MySwal.fire({
        title: "Error",
        text: "Failed to load employees. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtering Logic
  const filteredEmployees = employees.filter((emp) => {
    const text = search.toLowerCase();

    switch (filterBy) {
      case "name":
        return (
          emp.firstName?.toLowerCase().includes(text) ||
          emp.lastName?.toLowerCase().includes(text)
        );

      case "employeeCode":
        return emp.employeeCode?.toLowerCase().includes(text);

      case "designation":
        return emp.designation?.toLowerCase().includes(text);

      case "department":
        // Note: department is now just an ID, not an object with name
        // You'll need to map this with department data if needed
        return emp.departmentId?.toString().includes(text);

      case "status": {
        const status = emp.isActive ? "active" : "inactive";
        return status.includes(text);
      }

      default:
        return true;
    }
  });

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Delete Employee?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      background: "#FFFFFF",
      color: "#333333",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#02C39A",
      iconColor: "#05668D",
      customClass: {
        popup: "rounded-2xl shadow-lg",
        title: "font-semibold text-[#333333]",
        confirmButton: "px-5 py-2 font-semibold rounded-lg",
        cancelButton: "px-5 py-2 font-semibold rounded-lg",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/employees/${id}`);
        
        if (response.data.success) {
          setEmployees((prev) => prev.filter((emp) => emp.id !== id));

          await MySwal.fire({
            title: "Deleted!",
            text: "The employee record has been removed.",
            icon: "success",
            confirmButtonColor: "#1ED292",
            background: "#F1FDF9",
            color: "#0C397A",
            iconColor: "#1ED292",
            customClass: {
              popup: "rounded-2xl shadow-md",
              title: "font-semibold",
            },
          });
        } else {
          throw new Error(response.data.message || 'Delete failed');
        }
      } catch (error) {
        await MySwal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to delete employee. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
          background: "#FFFFFF",
          color: "#333333",
          iconColor: "#d33",
          customClass: {
            popup: "rounded-2xl shadow-md",
          },
        });
      }
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
                <td colSpan="7" className="text-center p-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02C39A]"></div>
                    <span className="ml-3 text-gray-500">Loading employees...</span>
                  </div>
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
                  <td className="p-3">
                    {/* Display department ID for now - you can map this to department name later */}
                    {emp.departmentId ? `Dept ${emp.departmentId}` : 'N/A'}
                  </td>
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
                    to={`/hr_staff/EmployeeManagement/editemployee/${emp.id}`}  // Match the route path
                    className="text-[#05668D] hover:text-[#02C39A]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEdit />
                  </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(emp.id);
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
                  {search ? `No employees found matching "${search}"` : "No employees found."}
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