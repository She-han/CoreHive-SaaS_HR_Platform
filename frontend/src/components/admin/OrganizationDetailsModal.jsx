import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  X,
  Building,
  Mail,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Shield,
  CreditCard,
  TrendingUp,
  UserPlus,
  MessageSquare
} from "lucide-react";

import { changeOrganizationStatus } from "../../api/organizationApi";
import { getOrganizationModules } from "../../api/organizationModulesApi";
import LoadingSpinner from "../common/LoadingSpinner";
import Alert from "../common/Alert";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ------------------------------------------------------------------ */
/* Main Modal                                                          */
/* ------------------------------------------------------------------ */

const OrganizationDetailsModal = ({ isOpen, onClose, organization }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [organizationModules, setOrganizationModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    if (organization) {
      setSelectedStatus(organization.status);
      if (organization.organizationUuid && isOpen) {
        fetchOrganizationModules();
      }
    }
    
    // Cleanup function
    return () => {
      setOrganizationModules([]);
      setIsLoadingModules(false);
    };
  }, [organization?.organizationUuid, isOpen]);

  const fetchOrganizationModules = useCallback(async () => {
    if (!organization?.organizationUuid) return;
    
    setIsLoadingModules(true);
    try {
      const response = await getOrganizationModules(organization.organizationUuid);
      if (response?.success && Array.isArray(response.data)) {
        setOrganizationModules(response.data);
      } else {
        setOrganizationModules([]);
      }
    } catch (error) {
      console.error('Failed to fetch organization modules:', error);
      setOrganizationModules([]);
      setAlert({
        show: true,
        type: "error",
        message: "Failed to load modules. Using fallback data."
      });
    } finally {
      setIsLoadingModules(false);
    }
  }, [organization?.organizationUuid]);

  const handleStatusChange = useCallback(async () => {
    if (
      !organization ||
      !selectedStatus ||
      selectedStatus === organization.status
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await changeOrganizationStatus(
        organization.organizationUuid,
        selectedStatus
      );

      if (response?.success) {
        setAlert({
          show: true,
          type: "success",
          message: `Organization status updated to ${selectedStatus}`
        });

        setTimeout(onClose, 1500);
      } else {
        throw new Error(response?.message || "Failed to update status");
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  }, [organization, selectedStatus, onClose]);

  const getDocumentUrl = useCallback((documentPath) => {
    if (!documentPath) return null;

    if (documentPath.includes("blob.core.windows.net")) {
      return `${API_BASE_URL}/files/business-registration/download-url?documentPath=${encodeURIComponent(
        documentPath
      )}`;
    }

    const filename = documentPath.split("/").pop();
    return `${API_BASE_URL}/files/business-registration/${encodeURIComponent(
      filename
    )}`;
  }, []);

  const handleViewDocument = useCallback(
    async (documentPath) => {
      if (isLoadingDoc || !documentPath) return;

      setIsLoadingDoc(true);
      try {
        const url = getDocumentUrl(documentPath);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to load document");
        }

        if (documentPath.includes("blob.core.windows.net")) {
          const data = await response.json();
          window.open(data.data, "_blank");
        } else {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          window.open(objectUrl, "_blank");
          setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
        }
      } catch {
        setAlert({
          show: true,
          type: "error",
          message: "Failed to open document"
        });
      } finally {
        setIsLoadingDoc(false);
      }
    },
    [getDocumentUrl, isLoadingDoc]
  );

  const statusConfig = useMemo(
    () => ({
      PENDING_APPROVAL: {
        label: "Pending Approval",
        icon: Clock,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200"
      },
      ACTIVE: {
        label: "Active",
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200"
      },
      SUSPENDED: {
        label: "Suspended",
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200"
      },
      DORMANT: {
        label: "Dormant",
        icon: AlertCircle,
        className: "bg-gray-50 text-gray-700 border-gray-200"
      }
    }),
    []
  );

  const selectedModules = useMemo(() => {
    // Use organization_modules data if available, otherwise fall back to flags
    if (organizationModules && organizationModules.length > 0) {
      return organizationModules.map(om => ({
        name: om.extendedModule?.name || 'Unknown Module',
        enabled: om.isEnabled,
        icon: getModuleIcon(om.extendedModule?.moduleKey || ''),
        iconElement: getModuleIconElement(om.extendedModule?.moduleKey || '')
      }));
    }
    
    // Fallback to legacy module flags
    if (!organization) return [];

    return [
      {
        name: "QR Code Attendance",
        enabled: organization.moduleQrAttendanceMarking,
        icon: "📱",
        iconElement: TrendingUp
      },
      {
        name: "Face Recognition Attendance",
        enabled: organization.moduleFaceRecognitionAttendanceMarking,
        icon: "👤",
        iconElement: UserPlus
      },
      {
        name: "Employee Feedback",
        enabled: organization.moduleEmployeeFeedback,
        icon: "💬",
        iconElement: MessageSquare
      },
      {
        name: "Hiring Management",
        enabled: organization.moduleHiringManagement,
        icon: "🎯",
        iconElement: Users
      }
    ];
  }, [organization, organizationModules]);

  // Helper functions for module icons
  const getModuleIcon = (moduleKey) => {
    const iconMap = {
      'qr_attendance': '📱',
      'face_recognition': '👤',
      'employee_feedback': '💬',
      'hiring_management': '🎯',
    };
    return iconMap[moduleKey] || '📦';
  };

  const getModuleIconElement = (moduleKey) => {
    const iconMap = {
      'qr_attendance': TrendingUp,
      'face_recognition': UserPlus,
      'employee_feedback': MessageSquare,
      'hiring_management': Users,
    };
    return iconMap[moduleKey] || Shield;
  };

  if (!isOpen || !organization) return null;

  const status = statusConfig[organization.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Building className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
              <p className="text-sm text-gray-600">Organization Details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="text-gray-600" size={20} />
          </button>
        </div>

        {alert.show && (
          <div className="p-4 bg-gray-50">
            <Alert {...alert} onClose={() => setAlert({ ...alert, show: false })} />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium ${status.className}`}
            >
              <StatusIcon size={18} />
              {status.label}
            </span>
            {organization.modulesConfigured && (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircle size={16} />
                Configured
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={Mail} label="Email" value={organization.email} iconColor="text-blue-600" />
            <InfoCard
              icon={Users}
              label="Users"
              value={`${organization.userCount || 0}`}
              iconColor="text-green-600"
            />
            <InfoCard 
              icon={CreditCard} 
              label="Billing Plan" 
              value={organization.billingPlan || organization.plan || 'Not Set'} 
              iconColor="text-purple-600"
            />
            <InfoCard
              icon={Calendar}
              label="Created"
              value={new Date(organization.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              iconColor="text-orange-600"
            />
          </div>

          {/* Modules Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Shield size={18} className="text-blue-600" />
              Enabled Modules
            </h3>
            {isLoadingModules ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : selectedModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedModules.map((m, i) => (
                  <ModuleCard key={i} module={m} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No modules configured</p>
              </div>
            )}
          </div>

          {/* Status Change Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-4 text-gray-900">Update Organization Status</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {Object.keys(statusConfig).map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusChange}
                disabled={isProcessing || selectedStatus === organization.status}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const InfoCard = ({ icon: Icon, label, value, iconColor = "text-gray-500" }) => (
  <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 bg-white hover:shadow-md transition-shadow">
    <div className={`p-2 rounded-lg bg-gray-50`}>
      <Icon className={iconColor} size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const ModuleCard = ({ module }) => (
  <div
    className={`border rounded-lg p-3 flex items-center gap-3 transition-all ${
      module.enabled
        ? "bg-green-50 border-green-200 hover:shadow-md"
        : "bg-gray-50 border-gray-200 hover:border-gray-300"
    }`}
  >
    <span className="text-2xl">{module.icon}</span>
    <span className={`flex-1 font-medium ${module.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
      {module.name}
    </span>
    {module.enabled ? (
      <CheckCircle className="text-green-600 shrink-0" size={18} />
    ) : (
      <XCircle className="text-gray-400 shrink-0" size={18} />
    )}
  </div>
);

export default OrganizationDetailsModal;
