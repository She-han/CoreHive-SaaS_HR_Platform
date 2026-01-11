import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Building2, 
  Mail, 
  Users, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Shield,
  TrendingUp,
  MessageSquare,
  UserPlus,
  FileDown,
  AlertCircle,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';

import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';
import { approveOrganization, rejectOrganization } from '../../store/slices/adminSlice';
import { getOrganizationModules } from '../../api/organizationModulesApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const OrganizationReviewModal = ({ 
  isOpen, 
  onClose, 
  organization,
  onApprove,
  onReject 
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [organizationModules, setOrganizationModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  // Fetch organization modules when modal opens
  useEffect(() => {
    if (organization?.organizationUuid && isOpen) {
      fetchOrganizationModules();
    }
  }, [organization?.organizationUuid, isOpen]);

  const fetchOrganizationModules = async () => {
    if (!organization?.organizationUuid) return;
    
    setIsLoadingModules(true);
    try {
      const response = await getOrganizationModules(organization.organizationUuid);
      if (response.success) {
        setOrganizationModules(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch organization modules:', error);
      setOrganizationModules([]);
    } finally {
      setIsLoadingModules(false);
    }
  };

  const getDocumentUrl = useCallback((documentPath) => {
    if (!documentPath) return null;
    
    if (documentPath.includes('blob.core.windows.net')) {
      return `${API_BASE_URL}/files/business-registration/download-url?documentPath=${encodeURIComponent(documentPath)}`;
    }
    
    const filename = documentPath.split('/').pop();
    return `${API_BASE_URL}/files/business-registration/${filename}`;
  }, []);

  const handleViewDocument = useCallback(async (documentPath) => {
    if (!documentPath || isLoadingDoc) return;
    
    setIsLoadingDoc(true);
    try {
      const token = localStorage.getItem('corehive_token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      if (documentPath.includes('blob.core.windows.net')) {
        const response = await fetch(getDocumentUrl(documentPath), {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Failed to get download URL: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.downloadUrl) {
          throw new Error('No download URL received from server');
        }
        
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        const filename = documentPath.split('/').pop();
        const response = await fetch(`${API_BASE_URL}/files/business-registration/${filename}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert(`Failed to view document: ${error.message}`);
    } finally {
      setIsLoadingDoc(false);
    }
  }, [getDocumentUrl, isLoadingDoc]);

  const handleDownloadDocument = useCallback(async (documentPath) => {
    if (!documentPath || isLoadingDoc) return;
    
    setIsLoadingDoc(true);
    try {
      const token = localStorage.getItem('corehive_token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      const filename = documentPath.split('/').pop();
      
      if (documentPath.includes('blob.core.windows.net')) {
        const response = await fetch(getDocumentUrl(documentPath), {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to get download URL: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.downloadUrl) {
          throw new Error('No download URL received from server');
        }
        
        const blob = await fetch(data.downloadUrl).then(r => r.blob());
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await fetch(`${API_BASE_URL}/files/business-registration/${filename}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download document: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Failed to download document: ${error.message}`);
    } finally {
      setIsLoadingDoc(false);
    }
  }, [getDocumentUrl, isLoadingDoc]);

  const handleApprove = useCallback(async () => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      await dispatch(approveOrganization(organization.organizationUuid)).unwrap();
      onApprove?.(organization);
      onClose();
    } catch (error) {
      console.error('Failed to approve organization:', error);
      alert(`Failed to approve organization: ${error.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  }, [organization, dispatch, onApprove, onClose]);

  const handleReject = useCallback(async () => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      await dispatch(rejectOrganization(organization.organizationUuid)).unwrap();
      onReject?.(organization);
      onClose();
    } catch (error) {
      console.error('Failed to reject organization:', error);
      alert(`Failed to reject organization: ${error.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  }, [organization, dispatch, onReject, onClose]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const statusConfig = useMemo(() => ({
    'PENDING_APPROVAL': {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: Clock,
      label: 'Pending Approval'
    },
    'ACTIVE': {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Active'
    },
    'SUSPENDED': {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      label: 'Suspended'
    },
    'DORMANT': {
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: AlertCircle,
      label: 'Dormant'
    }
  }), []);

  const selectedModules = useMemo(() => {
    // Use organization_modules data if available, otherwise fall back to flags
    if (organizationModules && organizationModules.length > 0) {
      return organizationModules.map(om => ({
        name: om.extendedModule?.name || 'Unknown Module',
        icon: getModuleIcon(om.extendedModule?.moduleKey || ''),
        enabled: om.isEnabled,
        color: getModuleColor(om.extendedModule?.moduleKey || '')
      }));
    }
    
    // Fallback to legacy module flags
    if (!organization) return [];
    return [
      { 
        name: 'QR Attendance', 
        icon: TrendingUp, 
        enabled: organization.moduleQrAttendanceMarking,
        color: 'text-purple-500'
      },
      { 
        name: 'Face Recognition', 
        icon: UserPlus, 
        enabled: organization.moduleFaceRecognitionAttendanceMarking,
        color: 'text-blue-500'
      },
      { 
        name: 'Employee Feedback', 
        icon: MessageSquare, 
        enabled: organization.moduleEmployeeFeedback,
        color: 'text-green-500'
      },
      { 
        name: 'Hiring Management', 
        icon: Users, 
        enabled: organization.moduleHiringManagement,
        color: 'text-orange-500'
      }
    ];
  }, [organization, organizationModules]);

  // Helper function to get icon based on module key
  const getModuleIcon = (moduleKey) => {
    const iconMap = {
      'qr_attendance': TrendingUp,
      'face_recognition': UserPlus,
      'employee_feedback': MessageSquare,
      'hiring_management': Users,
    };
    return iconMap[moduleKey] || Shield;
  };

  // Helper function to get color based on module key
  const getModuleColor = (moduleKey) => {
    const colorMap = {
      'qr_attendance': 'text-purple-500',
      'face_recognition': 'text-blue-500',
      'employee_feedback': 'text-green-500',
      'hiring_management': 'text-orange-500',
    };
    return colorMap[moduleKey] || 'text-gray-500';
  };

  const enabledModulesCount = useMemo(() => 
    selectedModules.filter(m => m.enabled).length,
    [selectedModules]
  );

  if (!organization) return null;

  const status = statusConfig[organization.status] || statusConfig['DORMANT'];
  const StatusIcon = status.icon;
  const isPending = organization.status === 'PENDING_APPROVAL';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      title="Organization Review"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {organization.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1 break-all">
                  {organization.organizationUuid}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </div>
                  {organization.modulesConfigured && (
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                      <Settings className="w-4 h-4" />
                      Configured
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1 text-sm text-gray-600 shrink-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="whitespace-nowrap">{formatDate(organization.createdAt)}</span>
              </div>
              {organization.updatedAt !== organization.createdAt && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">Updated {formatDate(organization.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard 
            icon={Mail} 
            label="Email Address" 
            value={organization.email}
            iconColor="text-blue-500"
          />
          <InfoCard 
            icon={Users} 
            label="Employee Count" 
            value={organization.employeeCountRange}
            iconColor="text-green-500"
          />
          <InfoCard 
            icon={CreditCard} 
            label="Billing Plan" 
            value={organization.billingPlan || organization.plan || 'Not Set'}
            iconColor="text-purple-500"
          />
          {organization.businessRegistrationNumber && (
            <InfoCard 
              icon={FileText} 
              label="Registration Number" 
              value={organization.businessRegistrationNumber}
              iconColor="text-purple-500"
              fullWidth={false}
            />
          )}
        </div>

        {/* Business Registration Document */}
        {organization.businessRegistrationDocument && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Business Registration Document
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-100 rounded-lg shrink-0">
                      <FileDown className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {organization.businessRegistrationDocument.split('/').pop().replace(/%2F/g, '/')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Business Registration Certificate
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleViewDocument(organization.businessRegistrationDocument)}
                      disabled={isLoadingDoc}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                    >
                      {isLoadingDoc ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          View
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(organization.businessRegistrationDocument)}
                      disabled={isLoadingDoc}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Module Configuration */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Selected Modules
              </h3>
              <div className="text-sm font-medium text-gray-600">
                {enabledModulesCount}/{selectedModules.length} Active
              </div>
            </div>
            
            {isLoadingModules ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedModules.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedModules.map((module, index) => (
                  <ModuleCard key={index} module={module} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No modules configured
              </div>
            )}
          </div>
        </Card>

        {/* Status Notice */}
        {!isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 font-medium">
                This organization has already been {status.label.toLowerCase()}.
                Approval actions are not available.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="sm:w-auto"
          >
            Close
          </Button>
          
          {isPending && (
            <>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={isProcessing}
                icon={XCircle}
                className="sm:w-auto"
              >
                Reject
              </Button>
              
              <Button
                variant="primary"
                onClick={handleApprove}
                loading={isProcessing}
                icon={CheckCircle}
                className="sm:w-auto"
              >
                Approve Organization
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

const InfoCard = ({ icon: Icon, label, value, iconColor, fullWidth = false }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 ${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-gray-50 rounded-lg ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const ModuleCard = ({ module }) => {
  const Icon = module.icon;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
      module.enabled 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${module.enabled ? module.color : 'text-gray-400'}`} />
        <span className={`text-sm font-medium ${
          module.enabled 
            ? 'text-gray-900' 
            : 'text-gray-500'
        }`}>
          {module.name}
        </span>
      </div>
      {module.enabled ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );
};

export default OrganizationReviewModal;