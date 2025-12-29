import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, CheckCircle } from 'lucide-react';
import { selectUser } from '../../store/slices/authSlice';
import { apiPost } from '../../api/axios'; // Your axios helper

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Navbar from '../../components/layout/Navbar';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // API call to change password
      const response = await apiPost('/auth/change-password', {
        userId: user.userId, // Send User ID
        newPassword: passwords.newPassword
      });

      if (response.success) {
        // Success! Redirect to dashboard based on role
        // ඔයාගේ LoginPage.jsx එකේ තියෙන logic එකම මෙතන use කරන්න පුළුවන්
        if (user.role === 'ORG_ADMIN') {
             navigate('/org_admin/dashboard');
        } else if (user.role === 'HR_STAFF') {
             navigate('/hr_staff/dashboard');
        } else {
             navigate('/employee/profile');
        }
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card className="bg-white shadow-lg">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
              <p className="text-gray-600 mt-2">
                For security reasons, please update your temporary password.
              </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                required
                icon={Lock}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
                icon={CheckCircle}
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

