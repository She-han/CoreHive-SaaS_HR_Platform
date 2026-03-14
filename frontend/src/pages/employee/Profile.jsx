import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import { getCurrentEmployeeProfile } from "../../api/employeeApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default function ProfilePage() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getCurrentEmployeeProfile();

      if (response.success) {
        setEmployee(response.data);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = () => {
    if (!employee) return "?";
    const firstInitial = employee.firstName?.charAt(0) || "";
    const lastInitial = employee.lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getProfileImageUrl = () => {
    if (employee?.profileImage) {
      // If it's already a full URL, return it
      if (employee.profileImage.startsWith('http')) {
        return employee.profileImage;
      }
      // Otherwise, prepend the configured backend origin
      return `${BACKEND_ORIGIN}${employee.profileImage}`;
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="px-10 py-10 bg-gray-100 min-h-screen">
        <div className="bg-white p-10 rounded-xl shadow w-full max-w-6xl mx-auto">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <button
              onClick={() => navigate("/employee/edit-profile")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex gap-16">
            {/* LEFT SIDE - Profile Photo */}
            <div className="w-1/4 text-center">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-gray-200"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-700 to-blue-400 text-white w-40 h-40 rounded-full flex items-center justify-center text-5xl font-semibold mx-auto">
                  {getInitials()}
                </div>
              )}

              <h3 className="text-xl font-semibold mt-6">
                {employee?.firstName} {employee?.lastName}
              </h3>
              <p className="text-gray-500">{employee?.designation || "Employee"}</p>
              <p className="text-gray-600 mt-2">ID: {employee?.employeeCode || "N/A"}</p>
            </div>

            {/* RIGHT SIDE - Details */}
            <div className="w-3/4">
              {/* Contact Info */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Email:</strong> {employee?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {employee?.phone || "N/A"}</p>
                  <p><strong>National ID:</strong> {employee?.nationalId || "N/A"}</p>
                </div>
              </div>

              <hr className="my-6" />

              {/* Employment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Employment Information</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Department:</strong> {employee?.department?.name || "N/A"}</p>
                  <p><strong>Position:</strong> {employee?.designation || "N/A"}</p>
                  <p><strong>Date of Joining:</strong> {employee?.dateOfJoining || "N/A"}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      employee?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {employee?.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
