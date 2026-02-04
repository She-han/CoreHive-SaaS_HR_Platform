import { useState, useEffect, useCallback } from "react";
import { 
  Building, 
  Mail, 
  Calendar, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import OrganizationDetailsModal from "../../components/admin/OrganizationDetailsModal";
import { 
  getPendingApprovals, 
  approveOrganization, 
  rejectOrganization,
  getOrganizationDetails 
} from "../../api/adminApi";

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
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load pending approvals
  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPendingApprovals();
      if (response.success) {
        setApprovals(response.data || []);
        setFilteredApprovals(response.data || []);
      }
    } catch (error) {
      console.error("Error loading approvals:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load pending approvals",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredApprovals(approvals);
    } else {
      const filtered = approvals.filter(
        (org) =>
          org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.employeeCountRange?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredApprovals(filtered);
    }
  }, [searchQuery, approvals]);

  // View organization details
  const handleViewDetails = async (org) => {
    try {
      const response = await getOrganizationDetails(org.organizationUuid);
      if (response.success) {
        setSelectedOrg(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load organization details",
        confirmButtonColor: THEME.primary,
      });
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrg(null);
  };

  // Handle organization update (approve/reject)
  const handleOrganizationUpdate = () => {
    handleCloseModal();
    loadApprovals();
  };

  // Approve organization
  const handleApprove = async (org) => {
    const result = await Swal.fire({
      title: "Approve Organization?",
      html: `
        <div style="text-align: left;">
          <p><strong>Organization:</strong> ${org.name}</p>
          <p><strong>Email:</strong> ${org.email}</p>
          <p style="margin-top: 10px;">This will activate the organization and allow them to access the platform.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: THEME.success,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await approveOrganization(org.organizationUuid);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Approved!",
            text: `${org.name} has been approved successfully.`,
            confirmButtonColor: THEME.primary,
          });
          loadApprovals();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to approve organization",
          confirmButtonColor: THEME.primary,
        });
      }
    }
  };

  // Reject organization
  const handleReject = async (org) => {
    const result = await Swal.fire({
      title: "Reject Organization?",
      html: `
        <div style="text-align: left;">
          <p><strong>Organization:</strong> ${org.name}</p>
          <p><strong>Email:</strong> ${org.email}</p>
          <p style="margin-top: 10px; color: #EF4444;">This action will reject the registration request. The organization will need to register again.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await rejectOrganization(org.organizationUuid);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Rejected",
            text: `${org.name} registration has been rejected.`,
            confirmButtonColor: THEME.primary,
          });
          loadApprovals();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reject organization",
          confirmButtonColor: THEME.primary,
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: THEME.dark }}
              >
                Reviews & Approvals
              </h1>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Review and approve all tenant registration requests
              </p>
            </div>
            <button
              onClick={loadApprovals}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: THEME.primary, color: "white" }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

      

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: THEME.muted }}
            />
            <input
              type="text"
              placeholder="Search by organization name, email, or employee count..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                focusRingColor: THEME.primary,
                borderColor: searchQuery ? THEME.primary : undefined
              }}
            />
          </div>
        </div>

        {/* Approvals List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: THEME.primary }} />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: THEME.background }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: THEME.success }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: THEME.dark }}>
              {searchQuery ? "No Results Found" : "All Clear!"}
            </h3>
            <p style={{ color: THEME.muted }}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "No pending approval requests at the moment"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: THEME.background }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: THEME.dark }}>
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: THEME.dark }}>
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: THEME.dark }}>
                      Employee Range
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: THEME.dark }}>
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: THEME.dark }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApprovals.map((org) => (
                    <tr key={org.organizationUuid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.dark} 100%)`,
                            }}
                          >
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: THEME.dark }}>
                              {org.name}
                            </p>
                            <p className="text-xs" style={{ color: THEME.muted }}>
                              {org.organizationUuid?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" style={{ color: THEME.muted }} />
                          <span className="text-sm" style={{ color: THEME.text }}>
                            {org.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: THEME.muted }} />
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: "#DBEAFE", color: THEME.secondary }}
                          >
                            {org.employeeCountRange || "1-50"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: THEME.muted }} />
                          <span className="text-sm" style={{ color: THEME.text }}>
                            {new Date(org.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(org)}
                            className="p-2 rounded-lg transition-all hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleApprove(org)}
                            className="p-2 rounded-lg transition-all hover:bg-green-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(org)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        organization={selectedOrg}
        onOrganizationDeleted={handleOrganizationUpdate}
      />
    </DashboardLayout>
  );
};

export default AdminApprovals;
