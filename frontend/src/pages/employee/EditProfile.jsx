import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Alert from "../../components/common/Alert";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  getCurrentEmployeeProfile,
  updateCurrentEmployeeProfile
} from "../../api/employeeApi";

const EditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Photo states
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    designation: "",
    nationalId: "",
    department: "",
    dateOfJoining: "",
    salaryType: "",
    leaveCount: 0,
    basicSalary: 0,
    status: "Active"
  });

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCurrentEmployeeProfile();

      if (response.success) {
        const employee = response.data;

        setFormData({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          phone: employee.phone || "",
          email: employee.email || "",
          designation: employee.designation || "",
          nationalId: employee.nationalId || "",
          department: employee.departmentId || "",
          dateOfJoining: employee.dateOfJoining || "",
          salaryType: employee.salaryType || "MONTHLY",
          leaveCount: employee.leaveCount || 0,
          basicSalary: employee.basicSalary || 0,
          status: employee.isActive ? "Active" : "Inactive"
        });

        if (employee.profileImage) {
          setPhotoPreview(employee.profileImage);
        }
      } else {
        setError(response.message || "Failed to load profile");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (photoFile) {
        payload.append("profileImage", photoFile);
      }

      const response = await updateCurrentEmployeeProfile(payload);

      if (response.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/employee/profile"), 1500);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen px-10 py-10">
        <div className="bg-white p-10 rounded-xl shadow w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Edit Profile</h2>
            <button
              onClick={() => navigate("/employee/profile")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {/* PROFILE PHOTO */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Change Photo
              </span>
            </label>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <Input label="National ID" name="nationalId" value={formData.nationalId} disabled className="bg-gray-100" />
              </div>
            </div>

            <hr />

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Employment Information
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Managed by HR department
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Input label="Email" name="email" value={formData.email} disabled className="bg-gray-100" />
                <Input label="Designation" name="designation" value={formData.designation} disabled className="bg-gray-100" />
                <Input label="Date of Joining" type="date" name="dateOfJoining" value={formData.dateOfJoining} disabled className="bg-gray-100" />
                <Input label="Salary Type" name="salaryType" value={formData.salaryType} disabled className="bg-gray-100" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button variant="secondary" type="button" onClick={() => navigate("/employee/profile")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfile;
