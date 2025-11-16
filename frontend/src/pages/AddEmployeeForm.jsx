import { useState } from "react";
import { Link } from "react-router-dom";

export default function AddEmployeeForm({ onClose }) {
  const [formData, setFormData] = useState({
    id: "",
    organization_uuid: "",
    app_user_id: "",
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    designation: "",
    department_id: "",
    basic_salary: "",
    date_of_joining: "",
    is_active: false,
    salary_type: "Monthly",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee Data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0C397A]/20 backdrop-blur-sm flex justify-center items-center z-50 px-4 overflow-y-auto py-6">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <Link
          to="/EmployeeManagement"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#333333] hover:text-[#05668D] text-xl font-semibold"
        >
          ✕
        </Link>

        <h2 className="text-2xl font-semibold text-[#0C397A] mb-6 text-center">
          Add New Employee
        </h2>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID & Org */}
          <ResponsiveRow>
            <InputField
              label="Employee ID"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="E.g., EMP001"
            />
            <InputField
              label="Organization UUID"
              name="organization_uuid"
              value={formData.organization_uuid}
              onChange={handleChange}
              placeholder="Org-1234"
            />
          </ResponsiveRow>

          {/* Code & User */}
          <ResponsiveRow>
            <InputField
              label="App User ID"
              name="app_user_id"
              value={formData.app_user_id}
              onChange={handleChange}
              placeholder="User123"
            />
            <InputField
              label="Employee Code"
              name="employee_code"
              value={formData.employee_code}
              onChange={handleChange}
              placeholder="EMP-CODE"
            />
          </ResponsiveRow>

          {/* Name */}
          <ResponsiveRow>
            <InputField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="John"
            />
            <InputField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Doe"
            />
          </ResponsiveRow>

          {/* Contact */}
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          <InputField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 771234567"
          />

          {/* Designation & Department */}
          <ResponsiveRow>
            <InputField
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
            <InputField
              label="Department ID"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              placeholder="DPT01"
            />
          </ResponsiveRow>

          {/* Salary & Joining */}
          <ResponsiveRow>
            <InputField
              label="Basic Salary"
              name="basic_salary"
              type="number"
              value={formData.basic_salary}
              onChange={handleChange}
              placeholder="75000"
            />
            <InputField
              label="Date of Joining"
              name="date_of_joining"
              type="date"
              value={formData.date_of_joining}
              onChange={handleChange}
            />
          </ResponsiveRow>

          {/* Salary Type & Active */}
          <ResponsiveRow>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Salary Type
              </label>
              <select
                name="salary_type"
                value={formData.salary_type}
                onChange={handleChange}
                className="w-full border border-[#9B9B9B] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#02C39A] bg-[#F1FDF9]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 accent-[#02C39A]"
              />
              <label className="text-sm font-medium text-[#333333]">Active</label>
            </div>
          </ResponsiveRow>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-[#02C39A] text-white font-medium px-8 py-2 rounded-lg hover:bg-[#1ED292] transition-all duration-200 shadow-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Reusable Input Field */
function InputField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#333333] mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-[#9B9B9B] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#02C39A] bg-[#F1FDF9] text-[#333333] placeholder:text-[#9B9B9B]"
      />
    </div>
  );
}

/* Reusable Row Container */
function ResponsiveRow({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
