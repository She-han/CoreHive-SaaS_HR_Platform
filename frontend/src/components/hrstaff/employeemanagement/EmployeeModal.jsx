// 📄 src/components/EmployeeModal.jsx
import React from "react";

export default function EmployeeModal({ employee, isOpen, onClose }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[420px] p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        {/* Avatar + Name */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F1FDF9] flex items-center justify-center text-2xl text-[#0C397A] font-semibold">
            {employee.firstName?.[0] || "?"}
          </div>
          <h2 className="mt-3 text-xl font-semibold text-[#333333]">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-[#05668D]">{employee.designation}</p>
        </div>

        {/* Employee Info */}
        <div className="space-y-2 text-sm text-[#333333]">
          <p>
            <b>Employee Code:</b> {employee.employeeCode}
          </p>
          <p>
            <b>Department:</b> {employee.departmentDTO?.name || "—"}
          </p>
          <p>
            <b>Email:</b> {employee.email || "—"}
          </p>
          <p>
            <b>Phone:</b> {employee.phone || "—"}
          </p>
          <p>
            <b>Salary Type:</b> {employee.salaryType || "—"}
          </p>
          <p>
            <b>Basic Salary:</b> Rs.{" "}
            {employee.basicSalary?.toLocaleString() || "—"}
          </p>
          <p>
            <b>Leave Count:</b> {employee.leaveCount || 0}
          </p>
          <p>
            <b>Date Joined:</b> {employee.dateOfJoining || "Not Available"}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span
              className={`font-semibold ${
                employee.isActive ? "text-[#1ED292]" : "text-red-500"
              }`}
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-between">
          <button className="bg-[#0C397A] text-white px-4 py-2 rounded-lg hover:bg-[#05668D]">
            Edit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
