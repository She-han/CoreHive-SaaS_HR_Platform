import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { getCurrentEmployeeProfile } from '../../api/employeeApi';

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
      setError(null);
      const response = await getCurrentEmployeeProfile();
      
      if (response.success) {
        setEmployee(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!employee) return '';
    return `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-10 mt-10">
          <Alert type="error" message={error} />
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="px-10 mt-10">
          <Alert type="error" message="Employee profile not found" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen">
        {/* MAIN PROFILE CARD */}
        <div className="px-10 mt-10">
          <div className="bg-white p-10 rounded-xl shadow w-full">
            
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">My Profile</h2>
              <button
                onClick={() => navigate('/employee/profile/edit')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>

            <div className="flex gap-16">
              {/* LEFT SIDE */}
              <div className="w-1/4 text-center">
                <div className="bg-gradient-to-br from-blue-700 to-blue-400 text-white 
                                w-40 h-40 rounded-full flex items-center justify-center 
                                text-5xl font-semibold mx-auto">
                  {getInitials()}
                </div>

                <h3 className="text-xl font-semibold mt-6">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-gray-500">{employee.designation || 'N/A'}</p>
                <p className="text-gray-600 mt-2">ID: {employee.employeeCode}</p>
                
                {/* Status Badge */}
                <div className="mt-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="w-3/4">
                {/* Contact Info */}
                <div className="mb-10">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Contact Information</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Phone:</strong> {employee.phone || 'N/A'}</p>
                    <p><strong>National ID:</strong> {employee.nationalId || 'N/A'}</p>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Employment Info */}
                <div className="mb-10">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Employment Information</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Department:</strong> {employee.department?.name || 'N/A'}</p>
                    <p><strong>Position:</strong> {employee.designation || 'N/A'}</p>
                    <p><strong>Date of Joining:</strong> {formatDate(employee.dateOfJoining)}</p>
                    <p><strong>Salary Type:</strong> {employee.salaryType}</p>
                    <p><strong>Leave Balance:</strong> {employee.leaveCount} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}