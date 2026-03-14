import { FaEdit, FaBan, FaCheckCircle, FaTrash } from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { useState, useEffect } from "react";
import EmployeeModal from "./EmployeeModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link } from "react-router-dom";
import {
  getAllEmployees,
  toggleEmployeeStatus,
  deleteEmployee
} from "../../../api/employeeService";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/slices/authSlice";
import { generateEmployeeIDCard } from "../../../utils/idCardGenerator";

const MySwal = withReactContent(Swal);

export default function EmployeeTable({ search, filterBy }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  //For pagenated
  const [page, setPage] = useState(0); // current page
  const [size, setSize] = useState(7); // items per page
  const [totalPages, setTotalPages] = useState(0);

  const { user, token, isLoading: authLoading } = useSelector(selectAuth);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setEmployees([]);
      setTotalPages(0);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    getAllEmployees(page, size, token)
      .then((data) => {
        if (isCancelled) return;
        setEmployees(data?.items || []);
        setTotalPages(data?.totalPages || 0);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Error getting employees", err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, size, token, authLoading]);

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

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    const result = await Swal.fire({
      icon: 'warning',
      title: currentStatus ? 'Deactivate Employee?' : 'Activate Employee?',
      text: `Are you sure you want to ${action} this employee?`,
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#02C39A',
      cancelButtonColor: '#9B9B9B',
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      const updatedEmployee = await toggleEmployeeStatus(id, token);
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Employee ${updatedEmployee.isActive ? "activated" : "deactivated"} successfully!`,
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });

      // Update state to reflect change
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, isActive: updatedEmployee.isActive } : emp
        )
      );
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update employee status. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    }
  };

  const handleDeleteEmployee = async (id, employeeName) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Employee?',
      text: `Are you sure you want to delete ${employeeName}? This action cannot be undone!`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#9B9B9B',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    });
    
    if (!result.isConfirmed) return;

    try {
      await deleteEmployee(id, token);
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Employee has been deleted successfully.',
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });

      // Remove employee from state
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.message || 'Failed to delete employee. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    }
  };

  const handleGenerateIDCard = async (employee) => {
    try {
      // Get organization info from user data
      const organizationName = user?.organizationName || "Organization";
      const organizationUuid = user?.organizationUuid || employee.organizationUuid;
      
      // Ensure employee has organizationUuid for photo retrieval
      const employeeWithOrg = {
        ...employee,
        organizationUuid: organizationUuid
      };
      
      // Show loading
      Swal.fire({
        title: 'Generating ID Card...',
        text: 'Please wait while we create the ID card',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Generate ID card (photo will be fetched automatically from AI service)
      await generateEmployeeIDCard(employeeWithOrg, organizationName);
      
      // Success message
      Swal.fire({
        icon: 'success',
        title: 'ID Card Generated!',
        text: 'The ID card has been downloaded successfully',
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error generating ID card:', error);
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: 'Failed to generate ID card. Please try again.',
        confirmButtonColor: '#02C39A'
      });
    }
  };

  const handleRowClick = (employee) => {
    // Ensure organizationUuid is available for photo retrieval
    const employeeWithOrg = {
      ...employee,
      organizationUuid: employee.organizationUuid || user?.organizationUuid
    };
    setSelectedEmployee(employeeWithOrg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {/* Sticky Header */}
          <thead className="bg-[#F1FDF9] text-[#0C397A] font-semibold">
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

          <tbody className="bg-white divide-y divide-gray-200">
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
                  className="hover:bg-[#E6FFFA] transition cursor-pointer"
                  onClick={() => handleRowClick(emp)}
                >
                  <td className="p-3 font-medium text-[#333333]">
                    {emp.employeeCode}
                  </td>
                  <td className="p-3">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="p-3">{emp.designation}</td>
                  <td className="p-3">{emp.departmentDTO?.name}</td>
                  <td className="p-3">{emp.phone}</td>
                  <td className="px-4 py-2">
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

                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-3 flex-nowrap">
                      {/* EDIT ACTION */}
                      <div className="flex justify-center">
                        <Link
                          to={`/hr_staff/editemployee/${emp.id}`}
                          className="group flex items-center justify-center w-10 h-10 rounded border transition-all duration-300 bg-[#FFFFFF] border-[#05668D]/30 text-[#05668D] hover:bg-[#05668D] hover:text-[#FFFFFF] shadow-sm hover:shadow-md"
                          onClick={(e) => e.stopPropagation()}
                          title="Edit Employee"
                        >
                          <FaEdit size={16} />
                        </Link>
                      </div>

                      {/* DELETE ACTION */}
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`);
                          }}
                          className="group flex items-center justify-center w-10 h-10 rounded border transition-all duration-300 bg-[#FFFFFF] border-red-300 text-red-500 hover:bg-red-500 hover:text-[#FFFFFF] shadow-sm hover:shadow-md"
                          title="Delete Employee"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      {/* STATUS TOGGLE ACTION */}
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(emp.id, emp.isActive);
                          }}
                          className={`
          flex items-center justify-center gap-2 w-32 h-10 rounded border transition-all duration-300 text-[10px] font-bold uppercase tracking-wider shadow-sm hover:shadow-md
          ${
            emp.isActive
              ? "bg-[#FFFFFF] border-[#9B9B9B] text-[#333333] hover:bg-[#333333] hover:text-[#FFFFFF] hover:border-[#333333]"
              : "bg-[#F1FDF9] border-[#02C39A] text-[#02C39A] hover:bg-[#02C39A] hover:text-[#FFFFFF]"
          }
        `}
                        >
                          {emp.isActive ? (
                            <FaBan size={12} />
                          ) : (
                            <FaCheckCircle size={12} />
                          )}
                          <span>
                            {emp.isActive ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                      </div>

                      {/* ID CARD GENERATION ACTION */}
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateIDCard(emp);
                          }}
                          className="flex items-center justify-center gap-2 px-3 h-10 rounded border transition-all duration-300 bg-[#F1FDF9] border-[#02C39A] text-[#02C39A] hover:bg-[#02C39A] hover:text-[#FFFFFF] shadow-sm hover:shadow-md"
                          title="Generate ID Card"
                        >
                          <FiCreditCard size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-wide">
                            ID Card
                          </span>
                        </button>
                      </div>
                    </div>
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
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(page - 1)} //decreases page by 1 when clicked.
            disabled={page === 0} //disables the button if you’re on the first page, preventing negative page numbers.
          >
            Previous
          </button>
        </div>

        <div className="flex gap-2">
          {/* creates an array of length equal to the total pages returned from the API. */}
          {Array.from({ length: totalPages }).map(
            (
              _,
              idx //maps each index to a button.
            ) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${
                  idx === page
                    ? "bg-[#02C39A] text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  //highlights the current page with a green background; others stay white.
                }`}
                onClick={() => setPage(idx)} //clicking a page number sets the page state to that index
              >
                {idx + 1}
              </button>
            )
          )}
        </div>

        <div>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page + 1 === totalPages} //disables button if you’re on the last page.
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
