import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Alert from "../../components/common/Alert";
import { getCurrentEmployeeProfile } from "../../api/employeeApi";

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const response = await getCurrentEmployeeProfile();
      if (response.success) setEmployee(response.data);
      else setError(response.message || "Failed to load profile");
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () =>
    `${employee?.firstName?.[0] || ""}${employee?.lastName?.[0] || ""}`.toUpperCase();

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Alert type="error" message={error} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 w-full animate-fade-in">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Employee Profile
          </h1>

          <button
            onClick={() => navigate("/employee/profile/edit")}
            className="
              bg-[var(--color-primary-500)]
              text-white px-6 py-3 rounded-lg font-medium
              hover:bg-[var(--color-primary-600)]
              transition-all
            "
          >
            Edit Profile
          </button>
        </div>

        {/* PROFILE SUMMARY */}
        <div
          className="
          bg-[var(--color-background-white)]
          rounded-xl p-8 mb-8
          shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)]
          border border-[#f1f5f9]
        "
        >
          <div className="flex flex-col md:flex-row gap-10 items-center">

            <div
              className="
              bg-[var(--color-primary-500)]
              text-white w-32 h-32 rounded-full
              flex items-center justify-center
              text-4xl font-semibold
            "
            >
              {getInitials()}
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-500">{employee.designation}</p>
              <p className="text-gray-600 mt-1">
                Employee ID: {employee.employeeCode}
              </p>

              <div className="mt-3">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                    employee.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* CONTACT INFO */}
          <div
            className="
            bg-[var(--color-background-white)]
            rounded-xl p-6
            shadow border border-[#f1f5f9]
          "
          >
            <h3 className="text-lg font-semibold mb-5 text-[var(--color-text-primary)]">
              Contact Information
            </h3>

            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{employee.phone || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">National ID</p>
                <p className="font-medium">{employee.nationalId || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* EMPLOYMENT INFO */}
          <div
            className="
            bg-[var(--color-background-white)]
            rounded-xl p-6
            shadow border border-[#f1f5f9]
          "
          >
            <h3 className="text-lg font-semibold mb-5 text-[var(--color-text-primary)]">
              Employment Information
            </h3>

            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium">{employee.department?.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-medium">{employee.designation}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date of Joining</p>
                <p className="font-medium">{formatDate(employee.dateOfJoining)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Salary Type</p>
                <p className="font-medium">{employee.salaryType}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Leave Balance</p>
                <p className="font-medium">{employee.leaveCount} days</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
