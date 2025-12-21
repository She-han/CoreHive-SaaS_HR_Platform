import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import apiClient from "../../../api/axios";
import * as designationApi from "../../../api/designationApi";
import { Camera, RefreshCw, Check, User, X, Plus, ChevronDown } from "lucide-react";

// ===== Face Registration API =====
const AI_SERVICE_URL = 'http://localhost:8001';

const registerFaceWithAI = async (employeeId, organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('employee_id', String(employeeId));
  formData.append('organization_uuid', organizationUuid);
  formData.append('image', imageBlob, 'face.jpg');

  const response = await fetch(`${AI_SERVICE_URL}/api/face/register`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Face registration failed');
  return data;
};

const checkFaceStatus = async (employeeId, organizationUuid) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/face/status/${organizationUuid}/${employeeId}`);
    if (!response.ok) return { registered: false };
    
    const data = await response.json();
    console.log("Face status check result:", data);
    
    return data;
  } catch (error) {
    console.error("Face status check failed:", error);
    return { registered: false };
  }
};

const base64ToBlob = (base64) => {
  const byteString = atob(base64.split(',')[1]);
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export default function AddEmployee() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    department: "",
    email: "",
    phone: "",
    nationalId: "",  // ADD THIS
    salaryType: "MONTHLY",
    basicSalary: "",
    leaveCount: "",
    dateJoined: "",
    status: "Active",
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [capturedFace, setCapturedFace] = useState(null);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [organizationUuid, setOrganizationUuid] = useState(null);
  const designationInputRef = useRef(null);
 
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('corehive_user') || '{}');
    setOrganizationUuid(user.organizationUuid);
    
    apiClient.get("/org-admin/departments")
      .then(res => {
        console.log("Departments loaded:", res.data);
        setDepartments(res.data.data || res.data);
      })
      .catch(err => console.error("Error loading departments", err));
    
    designationApi.getAllDesignations()
      .then(res => {
        console.log("Designations loaded:", res.data);
        setDesignations(res.data.data || res.data);
        setFilteredDesignations(res.data.data || res.data);
      })
      .catch(err => console.error("Error loading designations", err));
  }, []);

 // ===== Fetch next auto-generated employee code =====
useEffect(() => {
  if (!organizationUuid) return;

  const fetchNextCode = async () => {
    try {
      const response = await apiClient.get("/employees/next-code");
      const code = response.data.data || response.data;
      setFormData(prev => ({
        ...prev,
        employeeCode: code
      }));
    } catch (err) {
      console.error("Failed to fetch employee code", err);
      Swal.fire("Error", "Failed to generate employee code", "error");
    }
  };

  fetchNextCode();
}, [organizationUuid]);




  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDesignationChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, designation: value });
    
    if (value.trim()) {
      const filtered = designations.filter(d =>
        d.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDesignations(filtered);
      setShowDesignationDropdown(true);
    } else {
      setFilteredDesignations(designations);
      setShowDesignationDropdown(true);
    }
  };

  const selectDesignation = (designationName) => {
    setFormData({ ...formData, designation: designationName });
    setShowDesignationDropdown(false);
  };

  const createNewDesignation = async (name) => {
    try {
      const response = await designationApi.createDesignation({ name });
      const newDesignation = response.data.data || response.data;
      
      setDesignations([...designations, newDesignation]);
      setFormData({ ...formData, designation: newDesignation.name });
      setShowDesignationDropdown(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Designation Created!',
        text: `"${newDesignation.name}" has been added.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error creating designation:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create designation. Please try again.',
      });
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedFace(imageSrc);
    }
  };

  const retakePhoto = () => {
    setCapturedFace(null);
  };

  const confirmFace = () => {
    setShowFaceCapture(false);
    Swal.fire({
      icon: 'success',
      title: 'Photo Captured!',
      text: 'Face photo will be registered after saving employee.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if designation exists, if not create it first
      const designationExists = designations.some(
        d => d.name.toLowerCase() === formData.designation.toLowerCase()
      );

      if (!designationExists && formData.designation.trim()) {
        await createNewDesignation(formData.designation);
      }

      // Map frontend field names to backend DTO field names
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        nationalId: formData.nationalId,  // ADD THIS
        salaryType: formData.salaryType,
        basicSalary: formData.basicSalary,
        leaveCount: formData.leaveCount,
        dateOfJoining: formData.dateJoined,
        status: formData.status,
      };
      
      console.log("Sending employee data:", employeeData);
      
      const response = await apiClient.post("/employees", employeeData);
      const savedEmployee = response.data.data || response.data;
      console.log("Employee saved:", savedEmployee);

      // Step 2: Register face if photo captured
      if (capturedFace && savedEmployee.id && organizationUuid) {
        try {
          console.log("Registering face for employee:", savedEmployee.id);
          const imageBlob = base64ToBlob(capturedFace);
          await registerFaceWithAI(savedEmployee.id, organizationUuid, imageBlob);
          setFaceRegistered(true);
          console.log("Face registered successfully!");
        } catch (faceError) {
          console.error("Face registration failed:", faceError);
          Swal.fire({
            icon: 'warning',
            title: 'Employee Added',
            text: 'Employee saved but face registration failed. You can register face later.',
            confirmButtonColor: "#02C39A",
          });
          navigate("/hr_staff/employeemanagement");
          return;
        }
      }

      // Success
      Swal.fire({
        title: "Success!",
        text: capturedFace 
          ? "Employee added and face registered successfully!" 
          : "Employee added successfully!",
        icon: "success",
        confirmButtonColor: "#02C39A",
      }).then(() => {
        navigate("/hr_staff/employeemanagement");
      });

    } catch (error) {
      console.error("Error adding employee:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to add employee. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "user",
  };

  return (
    <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center p-6">
      <div className="w-full max-w-5xl h-full bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col">

        <div className="p-6">
          <h1 className="text-3xl font-bold text-[#0C397A] text-center">Add Employee</h1>
          <p className="text-gray-500 text-center mt-1">Fill in the employee details</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* PERSONAL INFO */}
          <Box title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Employee Code" required>
                <input
                name="employeeCode"
                value={formData.employeeCode || "Generating..."}
                readOnly
                className="input-box bg-gray-100 cursor-not-allowed"
              />
              </Field>
              <Field label="First Name" required>
                <input name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Last Name" required>
                <input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className="input-box" required />
              </Field>
              
              {/* National ID Field - ADD THIS */}
              <Field label="National ID" required>
                <input name="nationalId" placeholder="199812345678" value={formData.nationalId} onChange={handleChange} className="input-box" required />
              </Field>
              
              <Field label="Designation" required>
                <div className="relative">
                  <input
                    ref={designationInputRef}
                    name="designation"
                    placeholder="Type or select designation"
                    value={formData.designation}
                    onChange={handleDesignationChange}
                    onFocus={() => setShowDesignationDropdown(true)}
                    className="input-box pr-10"
                    required
                    autoComplete="off"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  
                  {showDesignationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDesignations.length > 0 ? (
                        filteredDesignations.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => selectDesignation(d.name)}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            {d.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          No designations found
                        </div>
                      )}
                      
                      {formData.designation.trim() && !designations.some(d => d.name.toLowerCase() === formData.designation.toLowerCase()) && (
                        <div
                          onClick={() => createNewDesignation(formData.designation)}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-600 font-medium border-t border-gray-200 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add "{formData.designation}" as new designation
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Field>
              
              <Field label="Department" required>
                <select name="department" value={formData.department} onChange={handleChange} className="input-box" required>
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Email" required>
                <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Phone Number" required>
                <input name="phone" placeholder="0771234567" value={formData.phone} onChange={handleChange} className="input-box" required />
              </Field>
            </div>
          </Box>

          {/* JOB & SALARY */}
          <Box title="Job & Salary Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Salary Type" required>
                <select name="salaryType" value={formData.salaryType} onChange={handleChange} className="input-box" required>
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </Field>
              <Field label="Basic Salary" required>
                <input type="number" name="basicSalary" placeholder="50000" value={formData.basicSalary} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Leave Count" required>
                <input type="number" name="leaveCount" placeholder="12" value={formData.leaveCount} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Date Joined" required>
                <input type="date" name="dateJoined" value={formData.dateJoined} onChange={handleChange} className="input-box" required />
              </Field>
            </div>
          </Box>

          {/* STATUS */}
          <Box title="Employment Status">
            <Field label="Status" required>
              <select name="status" value={formData.status} onChange={handleChange} className="input-box" required>
                <option value="Active">Active</option>
                <option value="NonActive">NonActive</option>
              </select>
            </Field>
          </Box>

          {/* FACE REGISTRATION */}
          <Box title="Face Registration (Optional - For Attendance)">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Capture employee's face photo for face recognition attendance system.
              </p>

              {!showFaceCapture && !capturedFace && (
                <button
                  type="button"
                  onClick={() => setShowFaceCapture(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
              )}

              {showFaceCapture && !capturedFace && (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 max-w-md">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="w-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-44 border-3 border-dashed rounded-[80px] border-green-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    >
                      <Camera className="w-5 h-5" />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFaceCapture(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {capturedFace && (
                <div className="space-y-4">
                  <div className="relative max-w-md">
                    <img src={capturedFace} alt="Captured Face" className="rounded-xl w-full" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Captured
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={confirmFace}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    >
                      <Check className="w-5 h-5" />
                      Confirm Photo
                    </button>
                  </div>
                </div>
              )}

              {capturedFace && !showFaceCapture && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg w-fit">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Face photo ready for registration</span>
                </div>
              )}
            </div>
          </Box>
        </div>

        <div className="p-6 bg-white rounded-b-2xl flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-gray-400 text-gray-700 hover:bg-gray-100 transition font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#02C39A] hover:bg-[#029e7d] text-white font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Employee'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
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