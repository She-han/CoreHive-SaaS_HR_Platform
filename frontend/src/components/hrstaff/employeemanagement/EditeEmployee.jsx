import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { getSingleEmployee } from "../../../api/employeeService"; 
import { getAllDepartments } from "../../../api/departmentApi";
import { useSelector } from "react-redux";
 import { selectUser } from "../../../store/slices/authSlice";
 import { updateEmployee } from "../../../api/employeeService";


export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);

   const user = useSelector(selectUser); // get token from Redux
  const token = user?.token;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    employeeCode: "",
    department: "",
    email: "",
    phone: "",
    salaryType: "MONTHLY",
    basicSalary: "",
    leaveCount: "",
    dateJoined: "",
    status: "Active",
  });

  // Load employee data
  useEffect(() => {
    if (!id || !token) return;

      getSingleEmployee(id , token)
     .then((employee) => {
      setEmployee(employee);

      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        designation: employee.designation || "",
        employeeCode: employee.employeeCode || "",
        department: employee.departmentId || "",
        email: employee.email || "",
        phone: employee.phone || "",
        salaryType: employee.salaryType || "MONTHLY",
        basicSalary: employee.basicSalary || "",
        leaveCount: employee.leaveCount || "",
        dateJoined: employee.dateOfJoining || "",
        status: employee.isActive ? "Active" : "NonActive",
        });
      })
        .catch((err) => {
      console.error("Failed to load employee", err);
    });
}, [id, token]);

  // Load departments
  useEffect(() => {
       getAllDepartments()
      .then((res) => setDepartments(res.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) =>{
    const { name, value } = e.target;
    setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      return Swal.fire({
        title: "Error",
        text: "First name and last name are required",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }

    

    try {

      const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      designation: formData.designation,
      employeeCode: formData.employeeCode,
      department: formData.department || null,              // send null if not selected
      email: formData.email,
      phone: formData.phone,
      salaryType: formData.salaryType,
      basicSalary: formData.basicSalary ? formData.basicSalary : null, // null if empty
      leaveCount: formData.leaveCount ? Number(formData.leaveCount) : 0, // convert to number
      dateJoined: formData.dateJoined ? formData.dateJoined : null,      // null if empty
      status: formData.status,
    };
      
    const updated = await updateEmployee(id, payload, token);
    console.log("Updated employee:", updated);
  

      Swal.fire({
        title: "Updated!",
        text: "Employee updated successfully",
        icon: "success",
        confirmButtonColor: "#02C39A",
      }).then(() => navigate("/hr_staff/employeemanagement"));
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update employee",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center p-6">
      <div className="w-full max-w-5xl h-full bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col">

        <div className="p-6">
          <h1 className="text-3xl font-bold text-[#0C397A] text-center">
            Edit Employee
          </h1>
          <p className="text-gray-500 text-center mt-1">Update employee details</p>
        </div>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* PERSONAL INFO */}
          <Box title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <Field label="Employee Code">
                <input
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

              <Field label="First Name">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Last Name">
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Designation">
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Department">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-box"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Phone">
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

            </div>
          </Box>

          {/* JOB & SALARY */}
          <Box title="Job & Salary Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <Field label="Salary Type">
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="input-box"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </Field>

              <Field label="Basic Salary">
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Leave Count">
                <input
                  name="leaveCount"
                  value={formData.leaveCount}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

              <Field label="Date Joined">
                <input
                  type="date"
                  name="dateJoined"
                  value={formData.dateJoined}
                  onChange={handleChange}
                  className="input-box"
                />
              </Field>

            </div>
          </Box>

          {/* STATUS */}
          <Box title="Employment Status">
            <Field label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-box"
              >
                <option value="Active">Active</option>
                <option value="NonActive">NonActive</option>
              </select>
            </Field>
          </Box>

        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-6 bg-white flex justify-end gap-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-[#02C39A] text-white"
          >
            Save Employee
          </button>

        </div>

      </div>
    </div>
  );
}

/* Components */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div className="p-5 bg-white border border-gray-300 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-[#05668D] mb-4">{title}</h3>
      {children}
    </div>
  );
}
