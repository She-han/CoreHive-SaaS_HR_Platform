import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle2, 
  XCircle,
  Save,
  RefreshCw,
  QrCode, 
  ScanFace,
  MessageSquare, 
  UserPlus,
  Shield,
  Zap
} from 'lucide-react';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import * as moduleApi from '../../api/moduleApi';

const ModuleConfiguration = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [originalConfig, setOriginalConfig] = useState(null);
  const [moduleConfig, setModuleConfig] = useState({
    moduleQrAttendanceMarking: false,
    moduleFaceRecognitionAttendanceMarking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false
  });
  const [organizationName, setOrganizationName] = useState('');

  // All available modules with their details
  const allModules = [
    {
      key: 'moduleFaceRecognitionAttendanceMarking',
      name: 'Face Recognition Attendance',
      description: 'Automate employee check-ins using biometric facial recognition technology',
      icon: ScanFace,
      color: 'purple',
      features: [
        'Touchless check-in/check-out',
        'Liveness detection',
        'Real-time attendance tracking',
        'Integration with payroll systems'
      ]
    },
    {
      key: 'moduleQrAttendanceMarking',
      name: 'QR Code Attendance',
      description: 'Enable quick and secure attendance marking via scannable QR codes',
      icon: QrCode,
      color: 'blue',
      features: [
        'Secure code generation and rotation',
        'Geo-fencing for location verification',
        'Offline marking capabilities',
        'Scan history and audit logs'
      ]
    },
    {
      key: 'moduleEmployeeFeedback',
      name: 'Employee Feedback',
      description: 'Collect employee feedback, conduct surveys, and measure satisfaction',
      icon: MessageSquare,
      color: 'green',
      features: [
        'Employee surveys',
        'Anonymous feedback',
        'Sentiment analysis',
        'Feedback analytics'
      ]
    },
    {
      key: 'moduleHiringManagement',
      name: 'Hiring Management',
      description: 'Streamline your recruitment process with applicant tracking',
      icon: UserPlus,
      color: 'orange',
      features: [
        'Job posting management',
        'Applicant tracking',
        'Interview scheduling',
        'Candidate evaluation'
      ]
    }
  ];

  // Fetch current configuration on mount
  useEffect(() => {
    fetchModuleConfig();
  }, []);

  const fetchModuleConfig = async () => {
    setLoading(true);
    try {
      const response = await moduleApi.getModuleConfig();
      if (response.success && response.data) {
        const config = {
          moduleQrAttendanceMarking: response.data.moduleQrAttendanceMarking || false,
          moduleFaceRecognitionAttendanceMarking: response.data.moduleFaceRecognitionAttendanceMarking || false,
          moduleEmployeeFeedback: response.data.moduleEmployeeFeedback || false,
          moduleHiringManagement: response.data.moduleHiringManagement || false
        };
        setModuleConfig(config);
        setOriginalConfig(config);
        setOrganizationName(response.data.organizationName || '');
      }
    } catch (error) {
      showAlert('error', 'Failed to load module configuration');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  // Handle module toggle
  const handleModuleToggle = (moduleKey) => {
    setModuleConfig(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // Check if there are unsaved changes
  const hasChanges = () => {
    if (!originalConfig) return false;
    return Object.keys(moduleConfig).some(
      key => moduleConfig[key] !== originalConfig[key]
    );
  };

  // Save configuration
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await moduleApi.updateModuleConfig(moduleConfig);
      if (response.success) {
        setOriginalConfig({ ...moduleConfig });
        showAlert('success', 'Module configuration updated successfully!');
      } else {
        showAlert('error', response.message || 'Failed to update configuration');
      }
    } catch (error) {
      showAlert('error', 'Failed to save module configuration');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original configuration
  const handleReset = () => {
    if (originalConfig) {
      setModuleConfig({ ...originalConfig });
      showAlert('info', 'Changes discarded');
    }
  };

  // Separate modules into active and available
  const activeModules = allModules.filter(module => moduleConfig[module.key]);
  const availableModules = allModules.filter(module => !moduleConfig[module.key]);

  // Get color classes based on module color
  const getColorClasses = (color, isActive) => {
    const colors = {
      purple: {
        bg: isActive ? 'bg-purple-100' : 'bg-gray-100',
        icon: isActive ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500',
        border: isActive ? 'border-purple-500' : 'border-gray-200',
        badge: 'bg-purple-100 text-purple-800'
      },
      blue: {
        bg: isActive ? 'bg-blue-100' : 'bg-gray-100',
        icon: isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500',
        border: isActive ? 'border-blue-500' : 'border-gray-200',
        badge: 'bg-blue-100 text-blue-800'
      },
      green: {
        bg: isActive ? 'bg-green-100' : 'bg-gray-100',
        icon: isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500',
        border: isActive ? 'border-green-500' : 'border-gray-200',
        badge: 'bg-green-100 text-green-800'
      },
      orange: {
        bg: isActive ? 'bg-orange-100' : 'bg-gray-100',
        icon: isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500',
        border: isActive ? 'border-orange-500' : 'border-gray-200',
        badge: 'bg-orange-100 text-orange-800'
      }
    };
    return colors[color] || colors.blue;
  };

  // Module Card Component
  const ModuleCard = ({ module, isActive }) => {
    const Icon = module.icon;
    const colors = getColorClasses(module.color, isActive);
    
    return (
      <div
        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${colors.border} ${
          isActive ? colors.bg : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => handleModuleToggle(module.key)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-2">
            {isActive ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3" />
                Inactive
              </span>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
          {module.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          {module.description}
        </p>
        
        <ul className="space-y-2">
          {module.features.map((feature, index) => (
            <li key={index} className="text-xs text-gray-500 flex items-center">
              <Zap className={`w-3 h-3 mr-2 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleModuleToggle(module.key);
            }}
          >
            {isActive ? 'Deactivate Module' : 'Activate Module'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              
              Module Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Manage extended modules for {organizationName || 'your organization'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {hasChanges() && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Discard Changes
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

                {/* Alert */}
        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message}
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        {/* Unsaved Changes Warning */}
        {hasChanges() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              You have unsaved changes. Don't forget to save your configuration.
            </p>
          </div>
        )}
        
        {/* Summary Card */}
        <Card className="bg-white">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration Summary
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allModules.map((module) => {
              const isActive = moduleConfig[module.key];
              const Icon = module.icon;
              return (
                <div 
                  key={module.key}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isActive ? 'text-green-800' : 'text-gray-600'}`}>
                      {module.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {isActive ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>





        {/* Active Modules Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Active Extended Modules
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeModules.length} active
            </span>
          </div>
          
          {activeModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {activeModules.map((module) => (
                <ModuleCard key={module.key} module={module} isActive={true} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 bg-gray-50">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No extended modules are currently active.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Activate modules from the available options below.
              </p>
            </Card>
          )}
        </div>

        {/* Available Modules Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Available Extended Modules
            </h2>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
              {availableModules.length} available
            </span>
          </div>
          
          {availableModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {availableModules.map((module) => (
                <ModuleCard key={module.key} module={module} isActive={false} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 bg-green-50 border-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-700 font-medium">
                All extended modules are active!
              </p>
              <p className="text-green-600 text-sm mt-1">
                You're using all available features.
              </p>
            </Card>
          )}
        </div>

                {/* Basic Features Info */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500 rounded-lg text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Core Features Always Included
              </h3>
              <p className="text-gray-600 text-sm">
                Employee Management, Payroll Processing, Leave Management, Basic Attendance Tracking, 
                Reports & Analytics, and Notifications are always enabled for your organization.
              </p>
            </div>
          </div>
        </Card>


      </div>
    </DashboardLayout>
  );
};

export default ModuleConfiguration;

