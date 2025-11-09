import { useState } from "react";
import EmployeeTable from "../components/EmployeeTable";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddEmployeeForm from "./AddEmployeeForm.jsx";

export default function EmployeeManagement() {
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("name");

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
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
          </select>
          <Link to="/AddEmployeeForm" className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292]">
            <FaPlus /> Add Employee
          </Link>
        </div>
      </div>

      <EmployeeTable search={search} filterBy={filterBy} />
    </div>
  );
}
