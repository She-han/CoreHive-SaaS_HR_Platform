import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import Swal from "sweetalert2";
import {
  getCurrentEmployeeProfile,
  updateCurrentEmployeeProfile
} from "../../api/employeeApi";

const EditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          // If it's a relative path, prepend the backend URL
          const imageUrl = employee.profileImage.startsWith('http') 
            ? employee.profileImage 
            : `http://localhost:8080${employee.profileImage}`;
          setPhotoPreview(imageUrl);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to load profile"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
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
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "First name and last name are required"
      });
      return;
    }

    // Validate Sri Lankan phone number (10 digits)
    if (formData.phone && !isValidPhoneNumber(formData.phone, 'LK')) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid phone number (10 digits)"
      });
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      
      // Only send fields that employees are allowed to update
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("phone", formData.phone || "");

      if (photoFile) {
        payload.append("profileImage", photoFile);
      }

      const response = await updateCurrentEmployeeProfile(payload);

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully!",
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/employee/profile");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update profile"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update profile. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      
    );
  }

  return (
    
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="LK"
                    countries={['LK']}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
    
  );
};

export default EditProfile;
