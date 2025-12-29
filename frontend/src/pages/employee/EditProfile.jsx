import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getCurrentEmployeeProfile, updateCurrentEmployeeProfile } from '../../api/employeeApi';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    designation: '',
    nationalId: '',
    department: '',
    dateOfJoining: '',
    salaryType: '',
    leaveCount: 0,
    basicSalary: 0,
    status: 'Active'
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
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          phone: employee.phone || '',
          email: employee.email || '',
          designation: employee.designation || '',
          nationalId: employee.nationalId || '',
          department: employee.departmentId || '',
          dateOfJoining: employee.dateOfJoining || '',
          salaryType: employee.salaryType || 'MONTHLY',
          leaveCount: employee.leaveCount || 0,
          basicSalary: employee.basicSalary || 0,
          status: employee.isActive ? 'Active' : 'Inactive'
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await updateCurrentEmployeeProfile(formData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/employee/profile');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
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
      <div className="bg-gray-100 min-h-screen">
        <div className="px-10 mt-10">
          <div className="bg-white p-10 rounded-xl shadow w-full max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Edit Profile</h2>
              <button
                onClick={() => navigate('/employee/profile')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                  <Input
                    label="National ID"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    disabled
                    className="bg-gray-100"
                    helperText="National ID cannot be changed"
                  />
                </div>
              </div>

              <hr className="my-6" />

              {/* Employment Information (Read-only) */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Employment Information</h3>
                <p className="text-sm text-gray-500 mb-4">
                  The following information is managed by your HR department and cannot be edited.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <Input
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    disabled
                    className="bg-gray-100"
                  />
                  <Input
                    label="Date of Joining"
                    name="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    disabled
                    className="bg-gray-100"
                  />
                  <Input
                    label="Salary Type"
                    name="salaryType"
                    value={formData.salaryType}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/employee/profile')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfile;