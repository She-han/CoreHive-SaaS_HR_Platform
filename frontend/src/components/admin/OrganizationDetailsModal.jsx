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
  CreditCard
} from "lucide-react";

import { changeOrganizationStatus } from "../../api/organizationApi";
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
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    if (organization) {
      setSelectedStatus(organization.status);
    }
  }, [organization]);

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
    if (!organization) return [];

    return [
      {
        name: "QR Code Attendance",
        enabled: organization.moduleQrAttendanceMarking,
        icon: "📱"
      },
      {
        name: "Face Recognition Attendance",
        enabled: organization.moduleFaceRecognitionAttendanceMarking,
        icon: "👤"
      },
      {
        name: "Employee Feedback",
        enabled: organization.moduleEmployeeFeedback,
        icon: "💬"
      },
      {
        name: "Hiring Management",
        enabled: organization.moduleHiringManagement,
        icon: "🎯"
      }
    ];
  }, [organization]);

  if (!isOpen || !organization) return null;

  const status = statusConfig[organization.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{organization.name}</h2>
              <p className="text-sm text-gray-500">Organization Details</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {alert.show && (
          <div className="p-4">
            <Alert {...alert} onClose={() => setAlert({ ...alert, show: false })} />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl ${status.className}`}
          >
            <StatusIcon size={16} />
            {status.label}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={Mail} label="Email" value={organization.email} />
            <InfoCard
              icon={Users}
              label="Users"
              value={`${organization.userCount || 0}`}
            />
            <InfoCard icon={CreditCard} label="Plan" value={organization.plan} />
            <InfoCard
              icon={Calendar}
              label="Created"
              value={new Date(organization.createdAt).toLocaleDateString()}
            />
          </div>

          {/* Modules */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield size={16} /> Enabled Modules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedModules.map((m, i) => (
                <ModuleCard key={i} module={m} />
              ))}
            </div>
          </div>

          {/* Status Change */}
          <div className="border-t pt-6">
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
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
                disabled={
                  isProcessing || selectedStatus === organization.status
                }
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
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

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="border rounded-lg p-4 flex items-center gap-3">
    <Icon className="text-gray-500" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const ModuleCard = ({ module }) => (
  <div
    className={`border rounded-lg p-3 flex items-center gap-3 ${
      module.enabled
        ? "bg-green-50 border-green-200"
        : "bg-gray-50 border-gray-200"
    }`}
  >
    <span className="text-2xl">{module.icon}</span>
    <span className="flex-1">{module.name}</span>
    {module.enabled ? (
      <CheckCircle className="text-green-600" size={16} />
    ) : (
      <XCircle className="text-gray-400" size={16} />
    )}
  </div>
);

export default OrganizationDetailsModal;
