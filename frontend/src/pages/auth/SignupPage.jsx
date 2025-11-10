import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Building2, 
  Mail, 
  FileText, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Info
} from 'lucide-react';

import { 
  signupOrganization, 
  clearError, 
  selectIsSignupLoading, 
  selectError 
} from '../../store/slices/authSlice';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

/**
 * Signup Page Component
 * Organization registration form
 */
const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectIsSignupLoading);
  const error = useSelector(selectError);
  
  // Form state
  const [formData, setFormData] = useState({
    organizationName: '',
    adminEmail: '',
    businessRegistrationNumber: '',
    employeeCountRange: '',
    modulePerformanceTracking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Employee count options
  const employeeCountOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];
  
  // Module options
  const moduleOptions = [
    {
      key: 'modulePerformanceTracking',
      name: 'Performance Tracking',
      description: 'Employee KPIs, reviews, and goal management'
    },
    {
      key: 'moduleEmployeeFeedback',
      name: 'Employee Feedback',
      description: 'Surveys, sentiment analysis, and feedback management'
    },
    {
      key: 'moduleHiringManagement',
      name: 'Hiring Management',
      description: 'Applicant tracking, interview scheduling, and recruitment'
    }
  ];
  
  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate step 1
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.length < 2) {
      errors.organizationName = 'Organization name must be at least 2 characters';
    }
    
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      errors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!formData.businessRegistrationNumber.trim()) {
      errors.businessRegistrationNumber = 'Business registration number is required';
    }
    
    if (!formData.employeeCountRange) {
      errors.employeeCountRange = 'Please select your employee count range';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
const handleNextStep = () => {
  console.log('handleNextStep called');
  console.log('Current step:', currentStep);
  console.log('Form data:', formData);
  
  if (currentStep === 1 && validateStep1()) {
    console.log('Validation passed, moving to step 2');
    setCurrentStep(2);
  } else {
    console.log('Validation failed');
  }
};

  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const resultAction = await dispatch(signupOrganization(formData));
      
      if (signupOrganization.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        // Auto redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
    }
  };
  
  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="text-center animate-slide-up">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Registration Successful!
              </h2>
              <p className="text-text-secondary">
                Your organization has been registered successfully. 
                Please wait for admin approval to start using CoreHive.
              </p>
            </div>
            
            <div className="space-y-4">
              <Alert 
                type="info"
                title="Next Steps"
                message="You will receive an email notification once your registration is approved. You can then login with your credentials."
              />
              
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Building2 className="h-12 w-12 text-primary-500" />
            <span className="text-3xl font-bold text-text-primary">
              Core<span className="text-primary-500">Hive</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Register Your Organization
          </h1>
          <p className="text-text-secondary">
            Join thousands of SMEs already using CoreHive for their HR management
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-500' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Company Info</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep > 1 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-500' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Features</span>
            </div>
          </div>
        </div>
        
        <Card className="animate-slide-up">
          {/* API Error Alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => dispatch(clearError())}
              className="mb-6"
            />
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Company Information
                  </h2>
                  <p className="text-text-secondary">
                    Tell us about your organization
                  </p>
                </div>
                
                {/* Organization name */}
                <Input
                  label="Organization Name"
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  icon={Building2}
                  error={formErrors.organizationName}
                  required
                  disabled={isLoading}
                />
                
                {/* Admin email */}
                <Input
                  label="Admin Email Address"
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  placeholder="admin@yourcompany.com"
                  icon={Mail}
                  error={formErrors.adminEmail}
                  required
                  disabled={isLoading}
                />
                
                {/* Business registration number */}
                <Input
                  label="Business Registration Number"
                  type="text"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your BR number"
                  icon={FileText}
                  error={formErrors.businessRegistrationNumber}
                  required
                  disabled={isLoading}
                />
                
                {/* Employee count range */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-primary">
                    Number of Employees <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="employeeCountRange"
                      value={formData.employeeCountRange}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        formErrors.employeeCountRange ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select employee count range</option>
                      {employeeCountOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.employeeCountRange && (
                    <p className="text-sm text-red-600 flex items-center animate-slide-up">
                      <Info className="h-4 w-4 mr-1" />
                      {formErrors.employeeCountRange}
                    </p>
                  )}
                </div>
                
                {/* Next button */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                    icon={ArrowRight}
                    iconPosition="right"
                    disabled={isLoading}
                  >
                    Next: Choose Features
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Module Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Choose Your Features
                  </h2>
                  <p className="text-text-secondary">
                    Select additional modules for your organization (optional)
                  </p>
                </div>
                
                {/* Module selection */}
                <div className="space-y-4">
                  <Alert 
                    type="info"
                    title="Basic Features Included"
                    message="Employee Management, Payroll, Leave Management, Attendance Tracking, and Reports are included in all plans."
                  />
                  
                  {moduleOptions.map((module) => (
                    <div 
                      key={module.key}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200"
                    >
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name={module.key}
                          checked={formData[module.key]}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                          disabled={isLoading}
                        />
                        <div>
                          <h3 className="font-medium text-text-primary">
                            {module.name}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1">
                            {module.description}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {isLoading ? 'Registering...' : 'Complete Registration'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
        
        {/* Login link */}
        <div className="text-center mt-6 ">
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link 
              to="/login"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;