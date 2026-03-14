import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

import {
  loginUser,
  clearError,
  selectIsAuthenticated,
  selectIsLoading
} from "../../store/slices/authSlice";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input"; 
import Card from "../../components/common/Card";
import ReCaptcha from "../../components/common/ReCaptcha";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaError, setRecaptchaError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔍 User already authenticated");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA expired. Please verify again.");
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setRecaptchaError("reCAPTCHA error. Please try again.");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    try {
      const loginData = {
        ...formData,
        recaptchaToken
      };

      const resultAction = await dispatch(loginUser(loginData));

      if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        // DEBUG: Log complete user data to see what backend is returning
        console.log('🔍 Login Response - Full userData:', userData);
        console.log('🔍 passwordChangeRequired:', userData.passwordChangeRequired);
        console.log('🔍 requiresPayment:', userData.requiresPayment);
        console.log('🔍 modulesConfigured:', userData.modulesConfigured);
        
        // Show success message (non-blocking)
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back to CoreHive',
          confirmButtonColor: '#02C39A',
          timer: 1000,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        
        // System Admin - direct redirect without any checks
        if (userData.userType === 'SYSTEM' && userData.role === 'SYS_ADMIN') {
          console.log('🔀 Redirecting SYSTEM ADMIN to dashboard');
          setTimeout(() => {
            navigate('/sys_admin/dashboard', { replace: true });
          }, 1000);
          return;
        }

        // Organization Users - check password change, payment, modules
        if (userData.userType === 'ORG_USER') {
          const needsPasswordChange = userData.passwordChangeRequired === true;
          console.log('🔀 ORG_USER detected. passwordChangeRequired:', userData.passwordChangeRequired, 'needsPasswordChange:', needsPasswordChange);

          if (needsPasswordChange) {
            console.log('🔀 Redirecting to /change-password');
            setTimeout(() => {
              navigate('/change-password', { replace: true });
            }, 1000);
            return;
          }

          if (userData.role === 'ORG_ADMIN') {
            console.log('🔀 ORG_ADMIN detected. Checking payment/modules...');
           
            if (userData.requiresPayment) {
              console.log('🔀 Payment required. Redirecting to /org_admin/payment-gateway');
              setTimeout(() => {
                navigate('/org_admin/payment-gateway', { replace: true });
              }, 500);
              return;
            }
            
            console.log('🔀 No payment required. Checking modules...');
            if (!userData.modulesConfigured) {
              console.log('🔀 Modules not configured. Redirecting to /configure-modules');
              setTimeout(() => {
                navigate("/configure-modules", { replace: true });
              }, 500);
            } else {
              console.log('🔀 All checks passed. Redirecting to /org_admin/dashboard');
              setTimeout(() => {
                navigate("/org_admin/dashboard", { replace: true });
              }, 500);
            }
            return;
          }
          else if (userData.role === 'HR_STAFF') {
            console.log('🔀 HR_STAFF detected. Redirecting to dashboard');
            setTimeout(() => {
              navigate('/hr_staff/dashboard', { replace: true });
            }, 1000);
          } 
          else if (userData.role === 'EMPLOYEE') {
            console.log('🔀 EMPLOYEE detected. Redirecting to profile');
            setTimeout(() => {
              navigate('/employee/profile', { replace: true });
            }, 1000);
          }
        }
      } else {
        // Login failed
        const errorMessage =
          resultAction.payload ||
          resultAction.error?.message ||
          "Invalid email or password";

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
          confirmButtonColor: '#02C39A',
        });
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: error.message || 'An error occurred during login',
        confirmButtonColor: '#02C39A',
      });
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-6">
              <span className="text-4xl font-bold text-text-primary">
                Core<span className="text-primary-500">Hive</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome back
            </h2>
            <p className="text-text-secondary">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="animate-slide-up bg-white shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                icon={Mail}
                error={formErrors.email}
                required
                disabled={isLoading}
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                icon={Lock}
                error={formErrors.password}
                required
                disabled={isLoading}
                showPasswordToggle={true}
                autoComplete="current-password"
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              <ReCaptcha
                ref={recaptchaRef}
                onChange={handleRecaptchaChange}
                onExpired={handleRecaptchaExpired}
                onError={handleRecaptchaError}
              />

              {recaptchaError && (
                <div className="text-sm text-red-600 text-center">
                  {recaptchaError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={
                  isLoading ||
                  !formData.email ||
                  !formData.password ||
                  !recaptchaToken
                }
                className="w-full"
                icon={ArrowRight}
                iconPosition="right"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-secondary">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Register your company
                </Link>
              </p>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Need help?{" "}
              <Link
                to="/contact"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
