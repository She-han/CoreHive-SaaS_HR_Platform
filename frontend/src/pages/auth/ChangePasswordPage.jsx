import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { selectUser, updateUser } from "../../store/slices/authSlice";
import { apiPost } from "../../api/axios"; // Your axios helper

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import Navbar from "../../components/layout/Navbar";

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!passwords.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Debug: Check user object
    console.log("👤 Current user object:", user);
    console.log("🔑 User ID:", user?.userId);

    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User session invalid. Please login again.',
        confirmButtonColor: '#02C39A',
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // API call to change password
      // Backend can handle null userId by using email from JWT token
      const response = await apiPost("/auth/change-password", {
        userId: user.userId || null, // Send User ID (can be null, backend will use email from JWT)
        newPassword: passwords.newPassword
      });

      console.log("📨 Change password response:", response);

      if (response.success) {
        // Success! Show SweetAlert and redirect
        Swal.fire({
          icon: 'success',
          title: 'Password Changed!',
          text: 'Your password has been updated successfully',
          confirmButtonColor: '#02C39A',
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        // Sync Redux (and localStorage via reducer) before redirect decisions.
        dispatch(updateUser({ passwordChangeRequired: false }));

        setTimeout(() => {
          const nextUser = {
            ...user,
            passwordChangeRequired: false
          };

          if (nextUser.role === "ORG_ADMIN") {
            // Check if needs payment or module configuration
            if (nextUser.requiresPayment) {
              console.log("🔀 Redirecting to payment gateway...");
              navigate("/payment-gateway", { replace: true });
            } else if (!nextUser.modulesConfigured) {
              console.log("🔀 Redirecting to module configuration...");
              navigate("/configure-modules", { replace: true });
            } else {
              console.log("🔀 Redirecting to dashboard...");
              navigate("/org_admin/dashboard", { replace: true });
            }
          } else if (nextUser.role === "HR_STAFF") {
            navigate("/hr_staff/dashboard", { replace: true });
          } else {
            navigate("/employee/profile", { replace: true });
          }
        }, 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: response.message || 'Failed to change password',
          confirmButtonColor: '#02C39A',
        });
      }
    } catch (err) {
      console.error("❌ Change password error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred. Please try again',
        confirmButtonColor: '#02C39A',
      });
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
              <h2 className="text-2xl font-bold text-gray-900">
                Set New Password
              </h2>
              <p className="text-gray-600 mt-2">
                For security reasons, please update your temporary password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleInputChange}
                error={formErrors.newPassword}
                required
                icon={Lock}
                showPasswordToggle={true}
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                error={formErrors.confirmPassword}
                required
                icon={CheckCircle}
                showPasswordToggle={true}
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
