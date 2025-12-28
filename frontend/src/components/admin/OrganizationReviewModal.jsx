import React, { useState } from 'react';
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
  FileDown
} from 'lucide-react';

import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';
import { approveOrganization, rejectOrganization } from '../../store/slices/adminSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Organization Review Modal Component
 * Shows detailed organization information for admin approval
 */
const OrganizationReviewModal = ({ 
  isOpen, 
  onClose, 
  organization,
  onApprove,
  onReject 
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    
    if (documentPath.includes('blob.core.windows.net')) {
      return `${API_BASE_URL}/files/business-registration/download-url?documentPath=${encodeURIComponent(documentPath)}`;
    }
    
    const filename = documentPath.split('/').pop();
    return `${API_BASE_URL}/files/business-registration/${filename}`;
  };

  const handleViewDocument = async (documentPath) => {
    if (!documentPath) return;
    
    try {
      const token = localStorage.getItem('corehive_token');
      
      if (documentPath.includes('blob.core.windows.net')) {
        const response = await fetch(getDocumentUrl(documentPath), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        window.open(data.downloadUrl, '_blank');
      } else {
        const filename = documentPath.split('/').pop();
        const response = await fetch(`${API_BASE_URL}/files/business-registration/${filename}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to view document. Please try again.');
    }
  };

  const handleDownloadDocument = async (documentPath) => {
    if (!documentPath) return;
    
    try {
      const token = localStorage.getItem('corehive_token');
      const filename = documentPath.split('/').pop();
      
      if (documentPath.includes('blob.core.windows.net')) {
        const response = await fetch(getDocumentUrl(documentPath), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
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
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
      alert('Failed to download document. Please try again.');
    }
  };

  // Handle approve action
  const handleApprove = async () => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      await dispatch(approveOrganization(organization.organizationUuid)).unwrap();
      onApprove?.(organization);
      onClose();
    } catch (error) {
      console.error('Failed to approve organization:', error);
      // Show the actual error message to user
      alert(`Failed to approve organization: ${error.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!organization) return;
    
    setIsProcessing(true);
    try {
      await dispatch(rejectOrganization(organization.organizationUuid)).unwrap();
      onReject?.(organization);
      onClose();
    } catch (error) {
      console.error('Failed to reject organization:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!organization) return null;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'text-yellow-600 bg-yellow-50';
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'SUSPENDED':
        return 'text-red-600 bg-red-50';
      case 'DORMANT':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get module status
  const getModuleStatus = (moduleFlag) => {
    return moduleFlag ? (
      <span className="inline-flex items-center text-green-600">
        <CheckCircle className="w-4 h-4 mr-1" />
        Enabled
      </span>
    ) : (
      <span className="inline-flex items-center text-gray-500">
        <XCircle className="w-4 h-4 mr-1" />
        Disabled
      </span>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      title="Organization Review"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Organization Header */}
        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {organization.name}
              </h2>
              <p className="text-text-secondary mt-1">
                Organization UUID: {organization.organizationUuid}
              </p>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(organization.status)}`}>
                  {organization.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right text-sm text-text-secondary">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              Registered: {formatDate(organization.createdAt)}
            </div>
            {organization.updatedAt !== organization.createdAt && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated: {formatDate(organization.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <Card title="Organization Details">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Organization Name
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium">{organization.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Contact Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium">{organization.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Employee Count Range
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium">{organization.employeeCountRange}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {organization.businessRegistrationNumber && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Business Registration Number
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="font-medium">{organization.businessRegistrationNumber}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Current Status
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500 mr-3" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(organization.status)}`}>
                    {organization.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Modules Configuration
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-500 mr-3" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    organization.modulesConfigured ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {organization.modulesConfigured ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Business Registration Document */}
        {organization.businessRegistrationDocument && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Business Registration Document
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileDown className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {organization.businessRegistrationDocument.split('/').pop()}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Business Registration Certificate
                    </p>
                  </div>
                </div>
                
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDocument(organization.businessRegistrationDocument)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  View Document
                </button>
                <button
                  onClick={() => handleDownloadDocument(organization.businessRegistrationDocument)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                >
                  Download
                </button>
              </div>
              </div>
            </div>
          </Card>
        )}

        {/* Module Configuration */}
        <Card title="Selected Modules">
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Basic Modules */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-3 text-center">Basic Modules</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Employee Management</span>
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Attendance Tracking</span>
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leave Management</span>
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payroll Management</span>
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Included
                    </span>
                  </div>
                </div>
              </div>

              {/* Extended Modules */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-3 text-center">Extended Modules</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm">Performance Tracking</span>
                    </div>
                    {getModuleStatus(organization.modulePerformanceTracking)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">Employee Feedback</span>
                    </div>
                    {getModuleStatus(organization.moduleEmployeeFeedback)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Hiring Management</span>
                    </div>
                    {getModuleStatus(organization.moduleHiringManagement)}
                  </div>
                </div>
              </div>

              {/* Module Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 text-center">Module Summary</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Basic Modules:</span>
                    <span className="font-semibold">4/4 Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extended Modules:</span>
                    <span className="font-semibold">
                      {[
                        organization.modulePerformanceTracking,
                        organization.moduleEmployeeFeedback,
                        organization.moduleHiringManagement
                      ].filter(Boolean).length}/3 Selected
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex justify-between font-semibold">
                      <span>Configuration:</span>
                      <span className={organization.modulesConfigured ? 'text-green-700' : 'text-orange-700'}>
                        {organization.modulesConfigured ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={handleReject}
            loading={isProcessing}
            icon={XCircle}
            disabled={organization.status !== 'PENDING_APPROVAL'}
          >
            Reject Application
          </Button>
          
          <Button
            variant="primary"
            onClick={handleApprove}
            loading={isProcessing}
            icon={CheckCircle}
            disabled={organization.status !== 'PENDING_APPROVAL'}
          >
            Approve Organization
          </Button>
        </div>

        {/* Status Notice */}
        {organization.status !== 'PENDING_APPROVAL' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800 font-medium">
                This organization has already been {organization.status?.toLowerCase().replace('_', ' ')}.
                Approval actions are not available.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrganizationReviewModal;