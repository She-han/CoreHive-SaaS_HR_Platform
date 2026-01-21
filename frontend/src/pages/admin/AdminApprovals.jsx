import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getPendingApprovals } from '../../api/adminApi';
import { PendingApprovalItem } from './AdminDashboard'; // Import the item
import OrganizationReviewModal from '../../components/admin/OrganizationReviewModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const AdminApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPendingApprovals();
      if (response.success) {
        setPendingApprovals(response.data || []);
      }
    } catch (err) {
      setError('Failed to load pending approvals.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleOrganizationReview = useCallback((org) => {
    setSelectedOrganization(org);
    setIsReviewModalOpen(true);
  }, []);

  const handleModalClose = () => {
    setIsReviewModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleActionSuccess = () => {
    handleModalClose();
    loadApprovals(); // Refresh list after approval/rejection
  };

  return (
    <DashboardLayout title="Reviews & Approvals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
            Reviews & Approvals
          </h1>
          <p className="mt-1" style={{ color: THEME.muted }}>
            Review and approve all tenant requests and changes
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Fetching pending requests..." />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium" style={{ color: THEME.dark }}>All caught up!</p>
              <p style={{ color: THEME.muted }}>There are no pending organization approvals.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingApprovals.map((org) => (
                <PendingApprovalItem 
                  key={org.organizationUuid} 
                  org={org} 
                  onReview={handleOrganizationReview} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <OrganizationReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleModalClose}
        organization={selectedOrganization}
        onApprove={handleActionSuccess}
        onReject={handleActionSuccess}
      />
    </DashboardLayout>
  );
};

export default AdminApprovals;