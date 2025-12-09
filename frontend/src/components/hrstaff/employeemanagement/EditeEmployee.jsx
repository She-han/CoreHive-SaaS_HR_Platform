import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import Webcam from "react-webcam";
import apiClient from "../../../api/axios";
import { Camera, RefreshCw, Check, User, X, AlertCircle, Loader2 } from "lucide-react";

// ===== Face API =====
const AI_SERVICE_URL = 'http://localhost:8001';

const registerFaceWithAI = async (employeeId, organizationUuid, imageBlob) => {
  const formData = new FormData();
  formData.append('employee_id', String(employeeId));
  formData.append('organization_uuid', organizationUuid);
  formData.append('image', imageBlob, 'face.jpg');

  console.log("Calling face register API:", { employeeId, organizationUuid });

  const response = await fetch(`${AI_SERVICE_URL}/api/face/register`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log("Face register response:", data);
  
  if (!response.ok) throw new Error(data.detail || 'Face registration failed');
  return data;
};

const checkFaceStatus = async (employeeId, organizationUuid) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/face/status/${organizationUuid}/${employeeId}`);
    if (!response.ok) return { registered: false };
    return await response.json();
  } catch {
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

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [organizationUuid, setOrganizationUuid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Face states
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [capturedFace, setCapturedFace] = useState(null);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [checkingFaceStatus, setCheckingFaceStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data - match backend DTO field names exactly
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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('corehive_user') || '{}');
        const orgUuid = user.organizationUuid;
        setOrganizationUuid(orgUuid);

        // Load employee
        const employeeRes = await apiClient.get(`/employees/${id}`);
        const empData = employeeRes.data;
        setEmployee(empData);
        
        setFormData({
          firstName: empData.firstName || "",
          lastName: empData.lastName || "",
          designation: empData.designation || "",
          employeeCode: empData.employeeCode || "",
          department: empData.departmentId || "",
          email: empData.email || "",
          phone: empData.phone || "",
          salaryType: empData.salaryType || "MONTHLY",
          basicSalary: empData.basicSalary ? String(empData.basicSalary) : "",
          leaveCount: empData.leaveCount || "",
          dateJoined: empData.dateOfJoining || "",
          status: empData.isActive !== false ? "Active" : "NonActive",
        });

        // Check face status
        if (orgUuid) {
          const status = await checkFaceStatus(empData.id, orgUuid);
          setFaceRegistered(status.registered);
        }
        setCheckingFaceStatus(false);

        // Load departments
        const deptRes = await apiClient.get("/org-admin/departments");
        setDepartments(deptRes.data.data || deptRes.data || []);

      } catch (error) {
        console.error("Error loading data:", error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load employee data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedFace(imageSrc);
  };

  const retakePhoto = () => setCapturedFace(null);

  const confirmFace = () => {
    setShowFaceCapture(false);
    Swal.fire({
      icon: 'success',
      title: 'Photo Captured!',
      text: 'Face will be registered after saving.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data matching backend DTO
      const updateData = {
        organizationUuid: organizationUuid,
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        department: formData.department ? Number(formData.department) : null,
        email: formData.email,
        phone: formData.phone,
        salaryType: formData.salaryType,
        basicSalary: formData.basicSalary || "0",
        leaveCount: formData.leaveCount ? Number(formData.leaveCount) : 0,
        dateJoined: formData.dateJoined,
        status: formData.status,
      };

      console.log("Updating employee with:", updateData);

      await apiClient.put(`/employees/${id}`, updateData);

      // Register face if photo captured
      if (capturedFace && organizationUuid) {
        try {
          console.log("Registering face...");
          const imageBlob = base64ToBlob(capturedFace);
          await registerFaceWithAI(id, organizationUuid, imageBlob);
          setFaceRegistered(true);
          console.log("Face registered!");
        } catch (faceError) {
          console.error("Face error:", faceError);
          Swal.fire({
            icon: 'warning',
            title: 'Employee Updated',
            text: 'Employee saved but face registration failed: ' + faceError.message,
            confirmButtonColor: "#02C39A",
          });
          navigate("/hr_staff/employeemanagement");
          return;
        }
      }

      Swal.fire({
        title: "Updated!",
        text: capturedFace ? "Employee and face updated!" : "Employee updated!",
        icon: "success",
        confirmButtonColor: "#02C39A",
      }).then(() => navigate("/hr_staff/employeemanagement"));

    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to update",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoConstraints = { width: 480, height: 360, facingMode: "user" };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#02C39A]" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center p-6">
      <div className="w-full max-w-5xl h-full bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col">

        <div className="p-6">
          <h1 className="text-3xl font-bold text-[#0C397A] text-center">Edit Employee</h1>
          <p className="text-gray-500 text-center mt-1">
            {employee?.firstName} {employee?.lastName}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* PERSONAL INFO */}
          <Box title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Employee Code">
                <input name="employeeCode" value={formData.employeeCode} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="First Name">
                <input name="firstName" value={formData.firstName} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Last Name">
                <input name="lastName" value={formData.lastName} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Designation">
                <input name="designation" value={formData.designation} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Department">
                <select name="department" value={formData.department} onChange={handleChange} className="input-box" required>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Email">
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Phone">
                <input name="phone" value={formData.phone} onChange={handleChange} className="input-box" required />
              </Field>
            </div>
          </Box>

          {/* JOB & SALARY */}
          <Box title="Job & Salary Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Salary Type">
                <select name="salaryType" value={formData.salaryType} onChange={handleChange} className="input-box">
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </Field>
              <Field label="Basic Salary">
                <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Leave Count">
                <input type="number" name="leaveCount" value={formData.leaveCount} onChange={handleChange} className="input-box" required />
              </Field>
              <Field label="Date Joined">
                <input type="date" name="dateJoined" value={formData.dateJoined} onChange={handleChange} className="input-box" required />
              </Field>
            </div>
          </Box>

          {/* STATUS */}
          <Box title="Employment Status">
            <Field label="Status">
              <select name="status" value={formData.status} onChange={handleChange} className="input-box">
                <option value="Active">Active</option>
                <option value="NonActive">Inactive</option>
              </select>
            </Field>
          </Box>

          {/* FACE REGISTRATION */}
          <Box title="Face Registration (For Attendance)">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Register or update face for attendance system.
              </p>

              {checkingFaceStatus ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking status...</span>
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg w-fit ${
                  faceRegistered ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {faceRegistered ? (
                    <><Check className="w-5 h-5" /><span className="font-medium">Face Registered ✓</span></>
                  ) : (
                    <><AlertCircle className="w-5 h-5" /><span className="font-medium">Face Not Registered</span></>
                  )}
                </div>
              )}

              {!showFaceCapture && !capturedFace && (
                <button
                  type="button"
                  onClick={() => setShowFaceCapture(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <Camera className="w-5 h-5" />
                  {faceRegistered ? 'Update Face' : 'Register Face'}
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
                    <button type="button" onClick={capturePhoto} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
                      <Camera className="w-5 h-5" /> Capture
                    </button>
                    <button type="button" onClick={() => setShowFaceCapture(false)} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
                      <X className="w-5 h-5" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {capturedFace && (
                <div className="space-y-4">
                  <div className="relative max-w-md">
                    <img src={capturedFace} alt="Captured" className="rounded-xl w-full" />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> New Photo
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={retakePhoto} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
                      <RefreshCw className="w-5 h-5" /> Retake
                    </button>
                    <button type="button" onClick={confirmFace} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
                      <Check className="w-5 h-5" /> Confirm
                    </button>
                  </div>
                </div>
              )}

              {capturedFace && !showFaceCapture && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg w-fit">
                  <User className="w-5 h-5" />
                  <span className="font-medium">New photo ready - save to register</span>
                </div>
              )}
            </div>
          </Box>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white rounded-b-2xl flex justify-end gap-4 border-t">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-gray-400 text-gray-700 hover:bg-gray-100" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-[#02C39A] hover:bg-[#029e7d] text-white font-semibold flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

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