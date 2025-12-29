import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
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

      // Load pending approvals
      const approvalsResponse = await getPendingApprovals();
      
      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.data || []);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error(" Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
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
  ];

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
  ];

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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome back, {user?.email?.split("@")[0]}!
              </h1>
              <p className="text-text-secondary mt-2">
                Monitor platform performance and tenant activity
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="text-sm text-text-secondary">
                Last updated: {lastRefresh.toLocaleTimeString()}
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                Welcome back, <span style={{ color: THEME.primary }}>{userName}</span>! 👋
              </h1>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Here's what's happening on your platform today
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                style={{ 
                  backgroundColor: THEME.primary,
                  color: 'white'
                }}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-#fifdf9 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg border-2 bg-white transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className="ml-4 p-2 flex-1">
                    <p className="text-sm mb-2 text-text-secondary">
                      {stat.title}
                    </p>
                    <p className="text-2xl mb-2 font-semi-bold text-text-primary">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "warning"
                          ? "text-yellow-600"
                          : "text-text-secondary"
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
          <div 
            className="mb-6 p-4 rounded-xl border flex items-center gap-3"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="font-medium hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Pending Approvals Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#FEF3C7' }}
                  >
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: THEME.dark }}>Pending Approvals</h2>
                    <p className="text-xs" style={{ color: THEME.muted }}>
                      {pendingApprovals.length} organization{pendingApprovals.length !== 1 ? 's' : ''} waiting
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.slice(0, 5).map((org) => (
                    <div
                      key={org.organizationUuid}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">
                          {org.name}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {org.email} • {org.employeeCountRange} employees
                        </p>
                        <p className="text-xs text-text-secondary">
                          Registered{" "}
                          {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOrganizationReview(org)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}

                  {pendingApprovals.length > 5 && (
                    <div className="text-center pt-4">
                      <Link to="/admin/approvals">
                        <Button
                          variant="ghost"
                          icon={ArrowRight}
                          iconPosition="right"
                        >
                          View all {pendingApprovals.length} pending approvals
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row */}

          {/* Quick Actions & Recent Activities */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Link to="/sys_admin/approvals" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Review Approvals
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/sys_admin/organizations" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      All Organizations
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/sys_admin/analytics" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Platform Reports
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/sys_admin/settings" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      System Settings
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                {pendingApprovals.length > 0 && (
                  <Link 
                    to="/sys_admin/approvals"
                    className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: THEME.primary }}
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              <div className="p-4">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: '#ECFDF5' }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="font-medium" style={{ color: THEME.dark }}>All caught up!</p>
                    <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                      No pending approvals at the moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovals.slice(0, 4).map((org) => (
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold" style={{ color: THEME.dark }}>Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                {quickActions.map((action) => (
                  <QuickActionButton key={action.label} action={action} />
                ))}
              </div>
            </div>

            {/* Recent Activities */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 py-8">
          <Card title="Recent Activities">
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        {activity.message}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tenant Growth Chart */}
          <div>
            <TenantGrowthChart />
          </div>
          <div>
            <SystemLoad />
            {/* System Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#ECFDF5' }}
                >
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>System Health</h2>
                  <p className="text-xs" style={{ color: THEME.muted }}>All systems operational</p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {healthMetrics.map((metric) => (
                    <HealthMetric key={metric.label} metric={metric} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Df />

        {/* Organization Status Overview */}
        <div className="mt-8">
          <Card title="System Health">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-text-secondary">Uptime</div>
              </div>

              <div className="text-center">
                <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">5.2GB</div>
                <div className="text-sm text-text-secondary">Database Size</div>
              </div>

              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">125ms</div>
                <div className="text-sm text-text-secondary">Avg Response</div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold" style={{ color: THEME.dark }}>Organization Status Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#ECFDF5' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.activeOrganizations || 0}</p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFBEB' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Dormant</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{stats.dormantOrganizations || 0}</p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Suspended</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.suspendedOrganizations || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Review Modal */}
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

export default AdminDashboard;
