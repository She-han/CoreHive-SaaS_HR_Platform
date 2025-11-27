import { useState } from "react";
import EmployeeTable from "../../components/hrstaff/employeemanagement/EmployeeTable";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddEmployee from "../../components/hrstaff/employeemanagement/AddEmployee";

export default function EmployeeManagement() {
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("name");

  return (
    <div className="w-full h-screen bg-white shadow-md flex flex-col p-8">
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">Employee Management</h1>
          <p className="text-[#9B9B9B] font-medium">
            Employees’ Information
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder={`Search by ${filterBy}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#9B9B9B] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#02C39A]"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-[#9B9B9B] rounded-lg p-2 text-sm"
          >
            <option value="name">Name</option>
            <option value="employeeCode">Employee Code</option>
            <option value="designation">Designation</option>
            <option value="department">Department</option>
            <option value="status">Status</option>
          </select>
          <Link to="/hr_staff/addemployee" className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292]">
            <FaPlus /> Add Employee
          </Link>
        </div>
      </div>

       {/* Scrollable Employee Table */}
      <div className="flex-1 overflow-y-auto">
        <EmployeeTable search={search} filterBy={filterBy} />
      </div>
    </div>
  );
}
