import React, { useState, useEffect , useRef} from 'react';
import ReCaptcha from '../../components/common/ReCaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBillingPlans } from '../../api/billingPlansApi';
import { getActiveModules } from '../../api/extendedModulesApi';
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
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

/**
 * Signup Page Component
 * Organization registration form
 */
const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectIsSignupLoading);
  const error = useSelector(selectError);

  const recaptchaRef = useRef(null);
const [recaptchaToken, setRecaptchaToken] = useState(null);
const [recaptchaError, setRecaptchaError] = useState('');

// Add these handlers:
const handleRecaptchaChange = (token) => {
  setRecaptchaToken(token);
  setRecaptchaError('');
};

const handleRecaptchaExpired = () => {
  setRecaptchaToken(null);
  setRecaptchaError('reCAPTCHA expired. Please verify again.');
};

const handleRecaptchaError = () => {
  setRecaptchaToken(null);
  setRecaptchaError('reCAPTCHA error. Please try again.');
};
  
  // Form state
  const [formData, setFormData] = useState({
    organizationName: '',
    adminEmail: '',
    businessRegistrationNumber: '',
    businessRegistrationDocument: null,
    employeeCountRange: '',
    selectedPlanId: null,
    selectedPlanName: '',
    customModules: [] // Array of module IDs for custom plan
  });
  
  // Plans and modules state
  const [billingPlans, setBillingPlans] = useState([]);
  const [extendedModules, setExtendedModules] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  
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
      key: 'moduleQrAttendance',
      name: 'QR Attendance Marking',
      description: 'QR code based attendance tracking for employees'
    },
    {
      key: 'moduleFaceRecognitionAttendance',
      name: 'Face Recognition Attendance Marking',
      description: 'Face recognition technology for accurate attendance tracking'
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
  
  // Fetch billing plans when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && billingPlans.length === 0) {
      fetchBillingPlans();
    }
  }, [currentStep]);
  
  // Fetch extended modules when moving to step 3 (custom plan)
  useEffect(() => {
    if (currentStep === 3 && extendedModules.length === 0) {
      fetchExtendedModules();
    }
  }, [currentStep]);
  
  // Fetch billing plans
  const fetchBillingPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await getAllBillingPlans();
      setBillingPlans(response || []);
    } catch (error) {
      console.error('Error fetching billing plans:', error);
      setFormErrors(prev => ({ ...prev, plans: 'Failed to load billing plans' }));
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  // Fetch extended modules
  const fetchExtendedModules = async () => {
    setIsLoadingModules(true);
    try {
      const response = await getActiveModules();
      setExtendedModules(response.data || []);
    } catch (error) {
      console.error('Error fetching extended modules:', error);
      setFormErrors(prev => ({ ...prev, modules: 'Failed to load modules' }));
    } finally {
      setIsLoadingModules(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
  
    if (type === 'file') {
    const file = files[0];
    
    // Validate file
      if (file) {
        // Check file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
          setFormErrors(prev => ({
            ...prev,
            businessRegistrationDocument: 'File size must be less than 2MB'
          }));
          return;
        }
        
        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          setFormErrors(prev => ({
            ...prev,
            businessRegistrationDocument: 'Only PDF, JPG, and PNG files are allowed'
          }));
          return;
        }
        
        // Clear errors if validation passed
        setFormErrors(prev => ({
          ...prev,
          businessRegistrationDocument: null
        }));
        
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
};
  
  // Validate step 1
 const validateStep1 = () => {
  const errors = {};
  
  if (!formData.organizationName.trim()) {
    errors.organizationName = 'Organization name is required';
  }
  
  if (!formData.adminEmail.trim()) {
    errors.adminEmail = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
    errors.adminEmail = 'Email is invalid';
  }
  
  if (!formData.businessRegistrationNumber.trim()) {
    errors.businessRegistrationNumber = 'Business registration number is required';
  }
  
  if (!formData.businessRegistrationDocument) {
    errors.businessRegistrationDocument = 'Business registration document is required';
  }
  
  if (!formData.employeeCountRange) {
    errors.employeeCountRange = 'Please select employee count range';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate plan selection
      if (!formData.selectedPlanId) {
        setFormErrors(prev => ({ ...prev, plan: 'Please select a billing plan' }));
        return;
      }
      
      // If custom plan is selected, go to step 3
      if (formData.selectedPlanName.toLowerCase() === 'custom') {
        setCurrentStep(3);
      } else {
        // For non-custom plans, skip to submission (show recaptcha)
        setCurrentStep(3);
      }
    }
  };
  
  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setFormData(prev => ({
      ...prev,
      selectedPlanId: plan.id,
      selectedPlanName: plan.name,
      customModules: [] // Reset custom modules when changing plan
    }));
    setFormErrors(prev => ({ ...prev, plan: null }));
  };
  
  // Handle module toggle for custom plan
  const handleModuleToggle = (moduleId) => {
    setFormData(prev => {
      const isSelected = prev.customModules.includes(moduleId);
      return {
        ...prev,
        customModules: isSelected
          ? prev.customModules.filter(id => id !== moduleId)
          : [...prev.customModules, moduleId]
      };
    });
  };

  
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!recaptchaToken) {
    setRecaptchaError('Please complete the reCAPTCHA verification');
    return;
  }
  
  // Validate custom modules if custom plan
  if (formData.selectedPlanName.toLowerCase() === 'custom' && formData.customModules.length === 0) {
    setFormErrors(prev => ({ ...prev, modules: 'Please select at least one module for custom plan' }));
    return;
  }
  
  try {
    const signupFormData = new FormData();
    signupFormData.append('organizationName', formData.organizationName);
    signupFormData.append('adminEmail', formData.adminEmail);
    signupFormData.append('businessRegistrationNumber', formData.businessRegistrationNumber);
    signupFormData.append('employeeCountRange', formData.employeeCountRange);
    signupFormData.append('recaptchaToken', recaptchaToken); // Add token
    
    if (formData.businessRegistrationDocument) {
      signupFormData.append('businessRegistrationDocument', formData.businessRegistrationDocument);
    }
    
    // Add billing plan information
    signupFormData.append('selectedPlanId', formData.selectedPlanId);
    signupFormData.append('selectedPlanName', formData.selectedPlanName);
    
    // Add custom modules if custom plan
    if (formData.selectedPlanName.toLowerCase() === 'custom') {
      signupFormData.append('customModules', JSON.stringify(formData.customModules));
    }
    
    const resultAction = await dispatch(signupOrganization(signupFormData));
    
    if (signupOrganization.fulfilled.match(resultAction)) {
      setIsSuccess(true);
    } else {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  } catch (error) {
    console.error('Signup error:', error);
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
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
    <>
      <Navbar/>
      <div className="min-h-screen bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-6">
              
              <span className="text-4xl font-bold text-text-primary">
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
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-500' : 'text-text-secondary'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 1 ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium text-sm md:text-base">Company</span>
              </div>
              
              <div className={`w-8 md:w-12 h-0.5 ${currentStep > 1 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-500' : 'text-text-secondary'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 2 ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium text-sm md:text-base">Plan</span>
              </div>
              
              <div className={`w-8 md:w-12 h-0.5 ${currentStep > 2 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 3 ? 'text-primary-500' : 'text-text-secondary'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 3 ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium text-sm md:text-base">Confirm</span>
              </div>
            </div>
          </div>
          
          <Card className="animate-slide-up bg-white shadow-md">
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

                  {/* Business Registration Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <FileText className="inline w-4 h-4 mr-1" />
                      Business Registration Document *
                    </label>
                    <input
                      type="file"
                      name="businessRegistrationDocument"
                      onChange={handleInputChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary transition ${
                        formErrors.businessRegistrationDocument ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formData.businessRegistrationDocument && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ {formData.businessRegistrationDocument.name} ({(formData.businessRegistrationDocument.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    {formErrors.businessRegistrationDocument && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.businessRegistrationDocument}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted formats: PDF, JPG, PNG (Max 2MB)
                    </p>
                  </div>
                  
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
              
              {/* Step 2: Billing Plan Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6 max-w-5xl">
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                      Choose Your Plan
                    </h2>
                    <p className="text-text-secondary">
                      Select a billing plan that fits your organization
                    </p>
                  </div>
                  
                  {/* Loading state */}
                  {isLoadingPlans ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                      <p className="mt-4 text-text-secondary">Loading plans...</p>
                    </div>
                  ) : (
                    <>
                      {/* Plans grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {billingPlans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => handlePlanSelect(plan)}
                            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                              formData.selectedPlanId === plan.id
                                ? 'border-primary-500 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                            } ${
                              plan.popular ? 'ring-2 ring-primary-500' : ''
                            }`}
                          >
                            {/* Popular badge */}
                            {plan.popular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  Most Popular
                                </span>
                              </div>
                            )}
                            
                            {/* Selected indicator */}
                            {formData.selectedPlanId === plan.id && (
                              <div className="absolute top-4 right-4">
                                <CheckCircle className="w-6 h-6 text-primary-500" />
                              </div>
                            )}
                            
                            {/* Plan header */}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-text-primary mb-2">
                                {plan.name}
                              </h3>
                              <p className="text-sm text-text-secondary mb-4">
                                {plan.description}
                              </p>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold text-text-primary">
                                  LKR {plan.price}
                                </span>
                                <span className="text-text-secondary text-sm">
                                  {plan.period}
                                </span>
                              </div>
                              <p className="text-sm text-text-secondary mt-2">
                                {plan.employees}
                              </p>
                            </div>
                            
                            {/* Features list */}
                            <div className="space-y-2 mb-4">
                              {plan.features.slice(0, 5).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-text-primary">{feature}</span>
                                </div>
                              ))}
                              {plan.features.length > 15 && (
                                <p className="text-xs text-text-secondary ml-6">
                                  +{plan.features.length - 5} more features
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {formErrors.plan && (
                        <p className="text-sm text-red-600 text-center">
                          {formErrors.plan}
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex justify-between space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading || isLoadingPlans}
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNextStep}
                      disabled={isLoading || isLoadingPlans || !formData.selectedPlanId}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Custom Modules or Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {formData.selectedPlanName.toLowerCase() === 'custom' ? (
                    <>
                      {/* Custom Module Selection */}
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                          Customize Your Modules
                        </h2>
                        <p className="text-text-secondary">
                          Select the modules you need for your custom plan
                        </p>
                      </div>
                      
                      {/* Loading state */}
                      {isLoadingModules ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                          <p className="mt-4 text-text-secondary">Loading modules...</p>
                        </div>
                      ) : (
                        <>
                          {/* Modules grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extendedModules.map((module) => (
                              <div
                                key={module.moduleId}
                                onClick={() => handleModuleToggle(module.moduleId)}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                  formData.customModules.includes(module.moduleId)
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={formData.customModules.includes(module.moduleId)}
                                    onChange={() => handleModuleToggle(module.moduleId)}
                                    className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="font-semibold text-text-primary">
                                        {module.name}
                                      </h3>
                                      <span className="text-sm font-bold text-primary-500">
                                        LKR {module.price}/mo
                                      </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                      {module.description}
                                    </p>
                                    {module.category && (
                                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        {module.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Total price */}
                          {formData.customModules.length > 0 && (
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-text-primary font-medium">
                                  Total Monthly Cost:
                                </span>
                                <span className="text-2xl font-bold text-primary-500">
                                  LKR 
                                  {extendedModules
                                    .filter(m => formData.customModules.includes(m.moduleId))
                                    .reduce((sum, m) => sum + parseFloat(m.price), 0)
                                    .toFixed(2)}
                                </span>
                              </div>
                              <p className="text-sm text-text-secondary mt-2">
                                {formData.customModules.length} module(s) selected
                              </p>
                            </div>
                          )}
                          
                          {formErrors.modules && (
                            <p className="text-sm text-red-600 text-center">
                              {formErrors.modules}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Confirmation step for non-custom plans */}
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                          Confirm Your Registration
                        </h2>
                        <p className="text-text-secondary">
                          Review your details and complete the registration
                        </p>
                      </div>
                      
                      {/* Summary */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                        <div>
                          <p className="text-sm text-text-secondary">Organization</p>
                          <p className="font-semibold text-text-primary">{formData.organizationName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Admin Email</p>
                          <p className="font-semibold text-text-primary">{formData.adminEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Employee Count</p>
                          <p className="font-semibold text-text-primary">{formData.employeeCountRange}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Selected Plan</p>
                          <p className="font-semibold text-primary-500">{formData.selectedPlanName}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* reCAPTCHA */}
                  <ReCaptcha
                    ref={recaptchaRef}
                    onChange={handleRecaptchaChange}
                    onExpired={handleRecaptchaExpired}
                    onError={handleRecaptchaError}
                  />

                  {recaptchaError && (
                    <div className="text-sm text-red-600 text-center mt-2">
                      {recaptchaError}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-between space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      disabled={isLoading || !recaptchaToken}
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
      <Footer/>
    </>
  );
};

export default SignupPage;