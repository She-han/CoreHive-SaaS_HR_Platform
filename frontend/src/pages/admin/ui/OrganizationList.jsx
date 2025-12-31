import { useState, useEffect, useCallback, memo } from "react";
import {
  Search,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { getAllOrganizations } from "../../../api/organizationApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import OrganizationDetailsModal from "../../../components/admin/OrganizationDetailsModal";

/* ---------------------------------- */
/* Status UI Config                    */
/* ---------------------------------- */

const statusStyles = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_APPROVAL: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
  DORMANT: "bg-gray-100 text-gray-700"
};

const statusIcon = {
  ACTIVE: <CheckCircle size={14} />,
  PENDING_APPROVAL: <Clock size={14} />,
  SUSPENDED: <XCircle size={14} />,
  DORMANT: <AlertCircle size={14} />
};

/* ---------------------------------- */
/* Table Row Component                 */
/* ---------------------------------- */

const OrganizationRow = memo(({ org, onViewDetails }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
    <td className="py-4">
      <div className="font-medium">{org.name}</div>
      <div className="text-xs text-gray-500">{org.email}</div>
    </td>

    <td className="text-center">
      <span className="px-3 py-1 border border-gray-300 rounded-lg text-xs">
        {org.plan || "Starter"}
      </span>
    </td>

    <td className="text-center">
      <div className="flex items-center justify-center gap-1">
        <Users size={14} />
        {org.userCount || 0}
      </div>
    </td>

    <td className="text-center">
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
          statusStyles[org.status] || statusStyles.DORMANT
        }`}
      >
        {statusIcon[org.status] || statusIcon.DORMANT}
        {org.status?.replace("_", " ") || "Unknown"}
      </span>
    </td>

    <td className="text-center">
      {org.billing || "$0/mo"}
    </td>

    <td className="text-center">
      <div className="flex items-center justify-center gap-1">
        <Calendar size={14} />
        {new Date(org.createdAt).toLocaleDateString()}
      </div>
    </td>

    <td className="text-center">
      <button
        onClick={() => onViewDetails(org)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="View Details"
      >
        <Eye size={18} className="text-gray-600" />
      </button>
    </td>
  </tr>
));

OrganizationRow.displayName = "OrganizationRow";

/* ---------------------------------- */
/* Main Component                      */
/* ---------------------------------- */

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 10;

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrganizations({
        page: currentPage,
        size: pageSize,
        sortBy: "createdAt",
        sortDir: "desc"
      });

      if (response?.success && response?.data) {
        setOrganizations(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleViewDetails = useCallback((org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrg(null);
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filteredData = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(search.toLowerCase()) ||
      org.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || org.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading organizations..." />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Organizations</h2>
            <p className="text-sm text-gray-500">
              {totalElements} total organizations
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DORMANT">Dormant</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="text-left py-3">Organization</th>
                <th className="text-center">Plan</th>
                <th className="text-center">Users</th>
                <th className="text-center">Status</th>
                <th className="text-center">Billing</th>
                <th className="text-center">Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredData.map((org) => (
                  <OrganizationRow
                    key={org.organizationUuid}
                    org={org}
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {currentPage * pageSize + 1} to{" "}
              {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
              {totalElements} organizations
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="px-4 py-2 text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <OrganizationDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        organization={selectedOrg}
      />
    </>
  );
}
