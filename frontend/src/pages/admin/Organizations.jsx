import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { Link } from "react-router-dom";
import OrganizationList from "./ui/OrganizationList";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Building2,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  TriangleAlert,
  MonitorX
} from "lucide-react";


const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

// Memoized Skeleton Loader for performance
const SkeletonCard = memo(() => (
  <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-2 bg-gray-200 rounded w-24" />
      </div>
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// Memoized Stat Card Component
const StatCard = memo(({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || "#"} className="group">
      <div
        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-opacity-50 relative overflow-hidden"
        style={{
          borderColor: stat.borderColor,
          background: `linear-gradient(135deg, white 0%, ${stat.bgLight} 100%)`,
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: stat.iconColor }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${stat.iconColor} 0%, ${stat.iconColorDark} 100%)`,
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: THEME.muted }}
            >
              {stat.title}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: THEME.dark }}
            >
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stat.changeType === "positive" && (
                <TrendingUp className="w-3 h-3 text-green-500" />
              )}
              {stat.changeType === "warning" && (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <p
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "warning"
                    ? "text-amber-600"
                    : "text-gray-500"
                }`}
              >
                {stat.change}
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
});
StatCard.displayName = "StatCard";

const Organizations = () => {
  const user = useSelector(selectUser);

  // State management
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    dormantOrganizations: 0,
    suspendedOrganizations: 0,
    totalEmployees: 0,
    totalSystemUsers: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Load dashboard data with useCallback for optimization
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel data fetching for performance
      const [statsResponse, approvalsResponse] = await Promise.all([
        getPlatformStatistics(),
        getPendingApprovals(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.data || []);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(
    () => loadDashboardData(),
    [loadDashboardData]
  );

  const statCards = useMemo(
    () => [
      {
        title: "Total Organizations",
        value: stats.totalOrganizations?.toLocaleString() || "0",
        icon: Building2,
        iconColor: THEME.secondary,
        iconColorDark: THEME.dark,
        bgLight: "#EBF8FF",
        borderColor: THEME.secondary,
        change: `${stats.activeOrganizations || 0} active`,
        changeType: "positive",
        link: "/sys_admin/organizations",
      },
      {
        title: "Active Organizations",
        value: stats.activeOrganizations?.toLocaleString() || "0",
        icon: CheckCircle,
        iconColor: "#10B981",
        iconColorDark: "#059669",
        bgLight: "#ECFDF5",
        borderColor: "#10B981",
        change: "Running smoothly",
        changeType: "positive",
        link: "/sys_admin/organizations?status=ACTIVE",
      },
      {
        title: "OnTrial Organizations",
        value: pendingApprovals.length,
        icon: TriangleAlert,
        iconColor: "#F59E0B",
        iconColorDark: "#D97706",
        bgLight: "#FFFBEB",
        borderColor: "#F59E0B",
        change: pendingApprovals.length > 0 ? "Needs attention" : "All clear",
        changeType: pendingApprovals.length > 0 ? "warning" : "positive",
        link: "/sys_admin/approvals",
      },
      {
        title: "Suspended Organizations",
        value: stats.totalEmployees?.toLocaleString() || "0",
        icon: MonitorX,
        iconColor: "#8B5CF6",
        iconColorDark: "#7C3AED",
        bgLight: "#F5F3FF",
        borderColor: "#8B5CF6",
        change: "Across all orgs",
        changeType: "positive",
        link: "/sys_admin/users",
      },
    ],
    [stats, pendingApprovals.length]
  );

  const formattedLastRefresh = useMemo(
    () =>
      lastRefresh.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lastRefresh]
  );

  return (
    <div>
      <DashboardLayout title="System Administration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: THEME.dark }}
                >
                  Organization Management 🧑‍💻
                </h1>
                <p className="mt-1" style={{ color: THEME.muted }}>
                  Manage all tenant organizations and their settings
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: THEME.background,
                    color: THEME.muted,
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span>Updated {formattedLastRefresh}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                  style={{
                    backgroundColor: THEME.primary,
                    color: "white",
                  }}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={stat.title} stat={stat} index={index} />
            ))}
          </div>
          {/* organizations list */}
          <OrganizationList />
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Organizations;
