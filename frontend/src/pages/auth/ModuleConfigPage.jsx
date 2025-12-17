import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  MessageSquare, 
  UserPlus,
  QrCode, 
  ScanFace
} from 'lucide-react';

import { 
  configureModules, 
  selectUser, 
  selectIsModuleConfigLoading, 
  selectError 
} from '../../store/slices/authSlice';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

/**
 * Module Configuration Page
 * Configure modules during first-time ORG_ADMIN login
 */
const ModuleConfigPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsModuleConfigLoading);
  const error = useSelector(selectError);
  
  // Module configuration state
  const [moduleConfig, setModuleConfig] = useState({
    moduleQrAttendanceMarking: false,
    moduleFaceRecognitionAttendanceMarking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false
  });
  
  // Module information
  const moduleInfo = [
    {
      key: 'moduleFaceRecognitionAttendanceMarking',
      name: 'Face Recognition Attendance',
      description: 'Automate employee check-ins using biometric facial recognition technology',
      icon: ScanFace, // Assuming a suitable icon like a user with a checkmark or a camera icon
      features: [
        'Touchless check-in/check-out',
        'Liveness detection',
        'Real-time attendance tracking',
        'Integration with payroll systems',
        'Mobile and kiosk deployment options'
      ]
    },
    {
      key: 'moduleQrAttendanceMarking',
      name: 'QR Code Attendance',
      description: 'Enable quick and secure attendance marking via scannable QR codes',
      icon: QrCode, // Assuming a suitable icon like a QR code graphic
      features: [
        'Secure code generation and rotation',
        'Geo-fencing for location verification',
        'Offline marking capabilities',
        'Scan history and audit logs',
        'Employee self-service portals'
      ]
    },
    {
      key: 'moduleEmployeeFeedback',
      name: 'Employee Feedback',
      description: 'Collect employee feedback, conduct surveys, and measure satisfaction',
      icon: MessageSquare,
      features: [
        'Employee surveys',
        'Anonymous feedback',
        'Sentiment analysis',
        'Pulse surveys',
        'Feedback analytics'
      ]
    },
    {
      key: 'moduleHiringManagement',
      name: 'Hiring Management',
      description: 'Streamline your recruitment process with applicant tracking',
      icon: UserPlus,
      features: [
        'Job posting management',
        'Applicant tracking',
        'Interview scheduling',
        'Candidate evaluation',
        'Hiring analytics'
      ]
    }
  ];
  
  // Handle module toggle
  const handleModuleToggle = (moduleKey) => {
    setModuleConfig(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };
  
// Handle form submission - FIXED VERSION
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    console.log('Submitting module configuration...');
    const resultAction = await dispatch(configureModules(moduleConfig));
    
    if (configureModules.fulfilled.match(resultAction)) {
      console.log(' Modules configured successfully, navigating to org_admin dashboard...');
      
      // After module config, redirect to ORG_ADMIN dashboard
      setTimeout(() => {
        navigate('/org_admin/dashboard', { replace: true });
      }, 500);
    } else {
      console.error(' Module configuration failed:', resultAction.payload);
    }
  } catch (error) {
    console.error(' Module configuration error:', error);
  }
};

// Skip configuration (basic modules only) - FIXED VERSION
const handleSkip = async () => {
  const basicConfig = {
    modulePerformanceTracking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false
  };
  
  try {
    console.log('⏭Skipping module configuration...');
    const resultAction = await dispatch(configureModules(basicConfig));
    
    if (configureModules.fulfilled.match(resultAction)) {
      console.log(' Basic configuration saved, navigating to org_admin dashboard...');
      
      // Redirect to ORG_ADMIN dashboard with basic modules
      setTimeout(() => {
        navigate('/org_admin/dashboard', { replace: true });
      }, 500);
    } else {
      console.error(' Basic configuration failed:', resultAction.payload);
    }
  } catch (error) {
    console.error(' Basic configuration error:', error);
  }
};
  
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to CoreHive, {user?.organizationName}!
          </h1>
          <p className="text-text-secondary text-lg">
            Let's configure your HR modules to get started
          </p>
        </div>
        
        <Card className="animate-slide-up">
          {/* Error alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              className="mb-6"
            />
          )}
          
          <div className="mb-6">
            <Alert 
              type="info"
              title="Basic Features Included"
              message="Employee Management, Payroll, Leave Management, Attendance Tracking, Reports, and Notifications are already enabled for your organization."
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Module selection title */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                Choose Additional Features
              </h2>
              <p className="text-text-secondary">
                Select the modules that best fit your organization's needs. You can change these later.
              </p>
            </div>
            
            {/* Module cards */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {moduleInfo.map((module) => {
                const Icon = module.icon;
                const isSelected = moduleConfig[module.key];
                
                return (
                  <div
                    key={module.key}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 shadow-soft' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleModuleToggle(module.key)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-500' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-text-primary mb-2">
                      {module.name}
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-4">
                      {module.description}
                    </p>
                    
                    <ul className="space-y-1">
                      {module.features.map((feature, index) => (
                        <li key={index} className="text-xs text-text-secondary flex items-center">
                          <div className="w-1 h-1 bg-primary-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            
            {/* Selected modules summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-2">
                Your Configuration Summary:
              </h3>
              <div className="text-sm text-text-secondary">
                <p className="mb-2">
                  <strong>Basic Features:</strong> Employee Management, Payroll, Leave Management, 
                  Attendance Tracking, Reports, Notifications
                </p>
                {Object.entries(moduleConfig).some(([_, selected]) => selected) && (
                  <p>
                    <strong>Additional Features:</strong>{' '}
                    {moduleInfo
                      .filter(module => moduleConfig[module.key])
                      .map(module => module.name)
                      .join(', ') || 'None selected'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Skip for Now (Basic Features Only)
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:flex-1"
              >
                {isLoading ? 'Configuring...' : 'Complete Setup & Continue'}
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Help text */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            Need help choosing? You can always modify these settings later in your organization settings.
          </p>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ModuleConfigPage;