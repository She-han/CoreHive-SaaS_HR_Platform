import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getPendingApprovals, getPlatformStatistics } from '../../api/adminApi';
import { PendingApprovalItem } from './AdminDashboard';
import OrganizationReviewModal from '../../components/admin/OrganizationReviewModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw,
  Building2,
  Inbox
} from 'lucide-react';

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
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [approvalsRes, statsRes] = await Promise.all([
        getPendingApprovals(),
        getPlatformStatistics()
      ]);
      
      if (approvalsRes.success) setPendingApprovals(approvalsRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      setError('Failed to refresh data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredApprovals = useMemo(() => {
    return pendingApprovals.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingApprovals, searchTerm]);

  const handleReview = useCallback((org) => {
    setSelectedOrganization(org);
    setIsReviewModalOpen(true);
  }, []);

  const handleActionComplete = () => {
    setIsReviewModalOpen(false);
    setSelectedOrganization(null);
    fetchData();
  };

  return (
    <DashboardLayout title="Tenant Approvals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: THEME.dark }}>
              Review Requests
            </h1>
            <p className="mt-2 text-lg" style={{ color: THEME.muted }}>
              Manage and verify new organization sign-ups.
            </p>
          </div>

          
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by organization name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-[#02C39A] focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-medium text-gray-500">Scanning for new requests...</p>
          </div>
        ) : filteredApprovals.length > 0 ? (
          <div className="grid gap-4">
            {filteredApprovals.map((org) => (
              <PendingApprovalItem 
                key={org.organizationUuid} 
                org={org} 
                onReview={handleReview} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No pending requests</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Everything is up to date! New organization sign-ups will appear here for your review.
            </p>
          </div>
        )}
      </div>

      <OrganizationReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        organization={selectedOrganization}
        onApprove={handleActionComplete}
        onReject={handleActionComplete}
      />
    </DashboardLayout>
  );
};

export default AdminApprovals;