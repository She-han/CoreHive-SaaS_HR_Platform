import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, ArrowRight, Building2, AlertCircle } from 'lucide-react';

import { 
  loginUser, 
  clearError, 
  selectIsAuthenticated, 
  selectIsLoading, 
  selectError 
} from '../../store/slices/authSlice';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

/**
 * Login Page Component
 * Universal login page (For both System Admin and Organization Users)
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Get redirect path from location state (protected route redirect)
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated - UPDATED VERSION
  useEffect(() => {
    if (isAuthenticated) {
      // Don't auto-redirect, let handleSubmit handle the logic
      console.log('🔍 User already authenticated, but allowing manual navigation logic');
    }
  }, [isAuthenticated]);
  
  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const resultAction = await dispatch(loginUser(formData));
      
      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login successful');
        
        // Get user data from result
        const userData = resultAction.payload;

        console.log('🔍 SERVER RESPONSE KEYS:', Object.keys(userData));
        console.log('🔍 Password Flag Value:', userData.isPasswordChangeRequired, userData.passwordChangeRequired);

        const needsPasswordChange = userData.isPasswordChangeRequired || userData.passwordChangeRequired;

        if (needsPasswordChange) {
          console.log('Password change required - redirecting...');
          navigate('/change-password', { replace: true });
          return;
        }

        // Handle redirect based on user role and configuration status
        // Redirect to proper path based on role
        if (userData.userType === 'SYSTEM_ADMIN' && userData.role === 'SYS_ADMIN') {
          // System admin - platform management dashboard
          console.log('🔧 SYSTEM_ADMIN - redirecting to sys_admin dashboard...');
          navigate('/sys_admin/dashboard', { replace: true });
          return;
        } 
        else if (userData.userType === 'ORG_USER') {
          // Organization users - different paths based on role
          if (userData.role === 'ORG_ADMIN') {
            if (!userData.modulesConfigured) {
              // First-time ORG_ADMIN - module configuration first
              console.log('First-time ORG_ADMIN - redirecting to module configuration...');
              navigate('/configure-modules', { replace: true });
              return;
            } else {
              // Existing ORG_ADMIN - organization management dashboard
              console.log('ORG_ADMIN - redirecting to org_admin dashboard...');
              navigate('/org_admin/dashboard', { replace: true });
              return;
            }
          } 
          else if (userData.role === 'HR_STAFF') {
            // HR Staff - HR management dashboard
            console.log('HR_STAFF - redirecting to hr_staff dashboard...');
            navigate('/hr_staff/dashboard', { replace: true });
            return;
          } 
          else if (userData.role === 'EMPLOYEE') {
            // Employee - self-service profile
            console.log('EMPLOYEE - redirecting to employee profile...');
            navigate('/employee/profile', { replace: true });
            return;
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // Handle demo login (development only)
  const handleDemoLogin = (userType) => {
    const demoCredentials = {
      admin: {
        email: 'admin@corehive.com',
        password: 'Admin@123'
      },
      org: {
        email: 'admin@testcompany.com',
        password: 'TempPass123!'
      }
    };
    
    const credentials = demoCredentials[userType];
    setFormData(credentials);
    
    // Auto submit after a short delay
    setTimeout(() => {
      dispatch(loginUser(credentials));
    }, 500);
  };
  
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Building2 className="h-12 w-12 text-primary-500" />
            <span className="text-3xl font-bold text-text-primary">
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
        
        {/* Login form */}
        <Card className="animate-slide-up bg-white shadow-md ">
          {/* API Error Alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => dispatch(clearError())}
              className="mb-6"
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
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
            
            {/* Password field */}
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
            
            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
            
            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
        
          
          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link 
                to="/signup"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Register your company
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Support info */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Need help?{' '}
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
    <Footer/>
    </>
  );
};

export default LoginPage;