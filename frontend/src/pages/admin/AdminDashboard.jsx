import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Database,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { selectUser } from "../../store/slices/authSlice";
import { getPendingApprovals, getPlatformStatistics } from "../../api/adminApi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Alert from "../../components/common/Alert";
import DashboardLayout from "../../components/layout/DashboardLayout";
import OrganizationReviewModal from "../../components/admin/OrganizationReviewModal";
import TomatoPriceChart from "./components/TomatoPriceChart";
import TenantGrowthChart from "./ui/TenantGrowthChart";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SystemLoad from "./ui/SystemLoad";
import Df from "./ui/Df";

/**
 * System Admin Dashboard Component
 * Platform-level overview with real data and modern design
 */
const AdminDashboard = () => {
  const user = useSelector(selectUser);

  // State management
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    totalEmployees: 0,
    dormantOrganizations: 0,
    suspendedOrganizations: 0,
    totalEmployees: 0,
    totalSystemUsers: 0
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
    getPendingApprovals()
  ]);
  
  if (statsResponse.success) {
    setStats(statsResponse.data);
  }

  // No need to call getPendingApprovals() again
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

  // Memoized handlers
  const handleRefresh = useCallback(() => loadDashboardData(), [loadDashboardData]);
  
  const handleOrganizationReview = useCallback((org) => {
    setSelectedOrganization(org);
    setIsReviewModalOpen(true);
  }, []);

  const handleApprovalSuccess = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const closeReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedOrganization(null);
  }, []);

  // Memoized statistics cards
  const statCards = useMemo(() => [
    {
      title: "Total Organizations",
      value: stats.totalOrganizations,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+5 this month",
      changeType: "positive",
    },
    {
      title: "Active Organizations",
      value: stats.activeOrganizations,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+3 this week",
      changeType: "positive",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "Needs attention",
      changeType: "warning",
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees?.toLocaleString() || "0",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+45 this month",
      changeType: "positive",
    },
  ]);

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      id: 1,
      type: "approval",
      message: "TechCorp Lanka registration approved",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "registration",
      message: "New registration: Green Solutions Pvt Ltd",
      time: "4 hours ago",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "alert",
      message: "System maintenance scheduled for weekend",
      time: "1 day ago",
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ]);

  const systemLoadData = [
    { time: "00:00", cpu: 45, memory: 62 },
    { time: "04:00", cpu: 32, memory: 58 },
    { time: "08:00", cpu: 78, memory: 75 },
    { time: "12:00", cpu: 85, memory: 82 },
    { time: "16:00", cpu: 72, memory: 71 },
    { time: "20:00", cpu: 55, memory: 65 },
  ];

  const moduleUsageData = [
    { name: "Employee", value: 108, color: "#0d9488" },
    { name: "Payroll", value: 95, color: "#1e3a8a" },
    { name: "Leave", value: 102, color: "#3b82f6" },
    { name: "Attendance", value: 87, color: "#06b6d4" },
    { name: "Performance", value: 64, color: "#8b5cf6" },
  ];

  const tenantGrowthData = [
    { month: "Jan", tenants: 40, users: 120 },
    { month: "Feb", tenants: 55, users: 180 },
    { month: "Mar", tenants: 70, users: 260 },
    { month: "Apr", tenants: 90, users: 340 },
    { month: "May", tenants: 120, users: 420 },
  ];

  // Loading state with skeleton
  if (isLoading && stats.totalOrganizations === 0) {
    return (
      <DashboardLayout title="System Administration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="lg" text="Loading dashboard..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Administration">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

    {/* ================= Header ================= */}
    <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
          Welcome back, <span style={{ color: THEME.primary }}>{userName}</span> 👋
        </h1>
        <p className="mt-1" style={{ color: THEME.muted }}>
          Monitor platform performance and tenant activity
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: THEME.background, color: THEME.muted }}
        >
          <Clock className="w-4 h-4" />
          <span>Updated {formattedLastRefresh}</span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: THEME.primary }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>

    {/* ================= Error ================= */}
    {error && (
      <Alert
        type="error"
        message={error}
        onClose={() => setError(null)}
        className="mb-6"
      />
    )}

    {/* ================= Statistics ================= */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <StatCard key={stat.title} stat={stat} index={index} />
      ))}
    </div>

    {/* ================= Main Content ================= */}
    <div className="grid lg:grid-cols-3 gap-6">

      {/* -------- Left Column -------- */}
      <div className="lg:col-span-2 space-y-6">

        {/* Pending Approvals */}
        <Card title="Pending Approvals">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium">No pending approvals</p>
              <p className="text-sm text-text-secondary">Everything is up to date 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.slice(0, 5).map(org => (
                <div
                  key={org.organizationUuid}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-text-secondary">{org.email}</p>
                  </div>
                  <Button size="sm" onClick={() => handleOrganizationReview(org)}>
                    Review
                  </Button>
                </div>
              ))}

              {pendingApprovals.length > 5 && (
                <Link to="/sys_admin/approvals" className="block text-center">
                  <Button variant="ghost">
                    View all {pendingApprovals.length}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* Charts */}
        <TenantGrowthChart />
        <SystemLoad />
      </div>

      {/* -------- Right Column -------- */}
      <div className="space-y-6">

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <QuickActionButton icon={Clock} label="Review Approvals" to="/sys_admin/approvals" />
            <QuickActionButton icon={Building2} label="Organizations" to="/sys_admin/organizations" />
            <QuickActionButton icon={TrendingUp} label="Reports" to="/sys_admin/analytics" />
            <QuickActionButton icon={Database} label="Settings" to="/sys_admin/settings" />
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activities">
          <div className="space-y-3">
            {recentActivities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-3">
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-text-secondary">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Health */}
        <Card title="System Health">
          <div className="grid grid-cols-3 gap-4 text-center">
            {healthMetrics.map(metric => (
              <HealthMetric key={metric.label} metric={metric} />
            ))}
          </div>
        </Card>
      </div>
    </div>

    {/* ================= Organization Status ================= */}
    <div className="mt-8">
      <Card title="Organization Status Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusBox icon={CheckCircle} label="Active" value={stats.activeOrganizations} color="green" />
          <StatusBox icon={Clock} label="Pending" value={pendingApprovals.length} color="amber" />
          <StatusBox icon={AlertCircle} label="Dormant" value={stats.dormantOrganizations} color="gray" />
          <StatusBox icon={Shield} label="Suspended" value={stats.suspendedOrganizations} color="red" />
        </div>
      </Card>
    </div>
  </div>

  {/* ================= Modal ================= */}
  <OrganizationReviewModal
    isOpen={isReviewModalOpen}
    onClose={closeReviewModal}
    organization={selectedOrganization}
    onApprove={handleApprovalSuccess}
    onReject={handleApprovalSuccess}
  />
</DashboardLayout>

  );
};

export default AdminDashboard
