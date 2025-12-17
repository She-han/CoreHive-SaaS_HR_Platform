import React, { useState ,useEffect} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import { getAllDepartments   } from "../../../api/departmentApi";
import { createEmployee } from "../../../api/employeeService" 
import { useSelector } from "react-redux";
 import { selectUser } from "../../../store/slices/authSlice";


export default function AddEmployee() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    employeeCode: "",
    department: "",
    email: "",
    phone: "",
    salaryType: "Monthly",
    basicSalary: "",
    leaveCount: "",
    dateJoined: "",
    status: "Active",
  });

    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);

     const user = useSelector(selectUser); // get token from Redux
  const token = user?.token;



  useEffect(() => {
    if (token) {
      console.log("Fetching departments with token:", token);
      getAllDepartments(token)
        .then(res => {
          console.log("Departments API response:", res);
          setDepartments(res.data || []);
        })
        .catch(err => console.error("Error loading departments", err));
    }
  }, [token]);
  

  

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{
        await createEmployee(formData, token);

        Swal.fire({
      title: "Success!",
      text: "Employee added successfully",
      icon: "success",
      confirmButtonColor: "#02C39A",
    }).then(()=>{
        navigate("/hr_staff/employeemanagement");
    });

   

    }catch(error){
      console.error("Error adding employee:", error);
     Swal.fire({
      title: "Error!",
      text: "Failed to save employee",
      icon: "error",
      confirmButtonColor: "#d33",
    });

    console.error("Save error:", error);
    }
  }

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  return (
    <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center p-6">
      <div className="w-full max-w-5xl h-full bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col">

        {/* Header (Fixed) */}
        <div className="p-6 ">
          <h1 className="text-3xl font-bold text-[#0C397A] text-center">Add Employee</h1>
          <p className="text-gray-500 text-center mt-1">Fill in the employee details</p>
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* ---------------------- PERSONAL INFO BOX ---------------------- */}
          <Box title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <Field label="Employee Code">
                <input
                  name="employeeCode"
                  placeholder="EMP-001"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

              <Field label="First Name">
                <input
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-box"
                    required
                />
                </Field>

                <Field label="Last Name">
                <input
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-box"
                    required
                />
                </Field>

                <Field label="Designation">
                <input
                    name="designation"
                    placeholder="Software Engineer"
                    value={formData.designation}
                    onChange={handleChange}
                    className="input-box"
                    required
                />
                </Field>



              <Field label="Department">
                <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-box"
                    required
                >
                    <option value="">Select Department</option>
                    {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>
                        {dep.name}
                    </option>
                    ))}
                </select>
                </Field>



              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

              <Field label="Phone Number">
                <input
                  name="phone"
                  placeholder="0771234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

            </div>
          </Box>

          {/* ---------------------- JOB & SALARY BOX ---------------------- */}
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
                  placeholder="50000"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

              <Field label="Leave Count">
                <input
                  type="number"
                  name="leaveCount"
                  placeholder="12"
                  value={formData.leaveCount}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

              <Field label="Date Joined">
                <input
                  type="date"
                  name="dateJoined"
                  value={formData.dateJoined}
                  onChange={handleChange}
                  className="input-box"
                  required
                />
              </Field>

            </div>
          </Box>

          {/* ---------------------- STATUS BOX ---------------------- */}
          <Box title="Employment Status">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
          </Box>
        </div>

        {/* Footer (Fixed) */}
        {/* Footer (Fixed Buttons) */}
<div className="p-6  bg-white rounded-b-2xl flex justify-end gap-4">

  {/* Cancel Button */}
  <button
    type="button"
    onClick={() => window.history.back()} //go to Employee Management page
    className="px-6 py-3 rounded-xl border border-gray-400 text-gray-700 
               hover:bg-gray-100 transition font-medium"
  >
    Cancel
  </button>

  {/* Save Button */}
  <button
    onClick={handleSubmit}
    className="px-6 py-3 rounded-xl bg-[#02C39A] hover:bg-[#029e7d] 
               text-white font-semibold shadow-md transition"
  >
    Save Employee
  </button>
</div>

      </div>
    </div>
  );
}

/* REUSABLE FIELD COMPONENT */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

/* REUSABLE BOX SECTION */
function Box({ title, children }) {
  return (
    <div className="p-5 bg-white border border-gray-300 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-[#05668D] mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* GLOBAL INPUT STYLE */
const style = `
.input-box {
  @apply w-full p-3 border border-gray-400 rounded-xl 
  bg-white text-sm placeholder-gray-400
  focus:ring-2 focus:ring-[#02C39A] focus:border-[#02C39A] transition;
}
`;
