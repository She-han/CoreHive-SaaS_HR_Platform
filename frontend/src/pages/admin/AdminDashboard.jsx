import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
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
  Server,
  Zap,
  Shield,
  UserCheck,
  Building,
  FileCheck,
  ChevronRight,
  Eye,
  ChevronLeft,
  DollarSign,
  Package,
  MessageCircle,
  Bug,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import { selectUser } from "../../store/slices/authSlice";
import { getPendingApprovals, getPlatformStatistics, getRevenueReport, getModuleUsageReport, getAllOrganizations, getOrganizationsReport } from "../../api/adminApi";
import { getAllTickets } from "../../api/supportTicketApi";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import OrganizationReviewModal from "../../components/admin/OrganizationReviewModal";
import TenantGrowthChart from "./ui/TenantGrowthChart";
import SystemLoad from "./ui/SystemLoad";
import ModuleUsageChart from "./ui/Df";

// Theme colors
const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B"
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

// Memoized Stat Card Component - ENHANCED DESIGN
const StatCard = memo(({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || "#"} className="group block h-full">
      <div
        className="relative rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-1 h-full overflow-hidden transform hover:-translate-y-1 hover:scale-[1.01]"
        style={{ 
          borderColor: stat.iconColor,
          background: `linear-gradient(135deg, ${stat.iconColor}15 0%, ${stat.iconColor}05 100%)`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          style={{ backgroundColor: stat.iconColor }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"
          style={{ backgroundColor: stat.iconColor }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
              style={{
                borderColor: stat.iconColor,
                backgroundColor: `${stat.iconColor}35`,
                boxShadow: `0 4px 14px ${stat.iconColor}25`
              }}
            >
              <Icon
                className="w-7 h-7"
                style={{ color: stat.iconColor }}
                strokeWidth={2.5}
              />
            </div>

            {stat.changeType && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "bg-green-50 text-green-600"
                    : stat.changeType === "warning"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-gray-50 text-gray-500"
                }`}
              >
                {stat.changeType === "positive" && (
                  <TrendingUp className="w-3 h-3" />
                )}
                {stat.changeType === "warning" && (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{stat.trend || "0%"}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: THEME.muted }}
            >
              {stat.title}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold" style={{ color: THEME.dark }}>
                {stat.value}
              </p>
              {stat.suffix && (
                <span
                  className="text-sm font-medium mb-1"
                  style={{ color: THEME.muted }}
                >
                  {stat.suffix}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: THEME.muted }}>
              {stat.change}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});
StatCard.displayName = "StatCard";

// Memoized Pending Approval Item
const PendingApprovalItem = memo(({ org, onReview }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.dark} 100%)`
        }}
      >
        <Building className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate" style={{ color: THEME.dark }}>
          {org.name}
        </h4>
        <p className="text-sm truncate" style={{ color: THEME.muted }}>
          {org.email}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
            {org.employeeCountRange || "1-50"} employees
          </span>
          <span className="text-xs" style={{ color: THEME.muted }}>
            {new Date(org.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}
          </span>
        </div>
      </div>
    </div>

    <button
      onClick={() => onReview(org)}
      className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: THEME.primary,
        color: "white"
      }}
    >
      <Eye className="w-4 h-4" />
      Review
    </button>
  </div>
));
PendingApprovalItem.displayName = "PendingApprovalItem";

// Memoized Quick Action Button
const QuickActionButton = memo(({ action }) => {
  const Icon = action.icon;
  return (
    <Link to={action.link} className="block">
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ backgroundColor: action.bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color: action.iconColor }} />
        </div>
        <span className="font-medium flex-1" style={{ color: THEME.text }}>
          {action.label}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
});
QuickActionButton.displayName = "QuickActionButton";

// Memoized System Health Metric
const HealthMetric = memo(({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="text-center p-4 rounded-xl transition-all hover:bg-gray-50">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.colorDark} 100%)`
        }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-2xl font-bold" style={{ color: metric.color }}>
        {metric.value}
      </div>
      <div
        className="text-xs font-medium uppercase tracking-wider mt-1"
        style={{ color: THEME.muted }}
      >
        {metric.label}
      </div>
    </div>
  );
});
HealthMetric.displayName = "HealthMetric";

// Monthly Revenue Chart Component
const MonthlyRevenueChart = memo(({ currentYear, onYearChange, revenueData, loading }) => {
  const handlePrevYear = () => {
    onYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    onYearChange(currentYear + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FEF3C7" }}
          >
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: THEME.dark }}>
              Monthly Revenue
            </h2>
            <p className="text-xs" style={{ color: THEME.muted }}>
              Revenue trends for {currentYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            style={{ color: THEME.dark }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm font-medium" style={{ color: THEME.dark }}>
            {currentYear}
          </span>
          <button
            onClick={handleNextYear}
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            style={{ color: THEME.dark }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="md" text="Loading revenue data..." />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.filter(d => d.revenue !== null)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2 }}
                  name="Revenue"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
MonthlyRevenueChart.displayName = 'MonthlyRevenueChart';

// Monthly Organization Count Chart Component
const MonthlyOrgCountChart = memo(({ currentYear, onYearChange, orgCountData, loading }) => {
  const handlePrevYear = () => {
    onYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    onYearChange(currentYear + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: THEME.background }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: THEME.primary }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: THEME.dark }}>
              Organization Growth
            </h2>
            <p className="text-xs" style={{ color: THEME.muted }}>
              Active organizations in {currentYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            style={{ color: THEME.dark }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm font-medium" style={{ color: THEME.dark }}>
            {currentYear}
          </span>
          <button
            onClick={handleNextYear}
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            style={{ color: THEME.dark }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="md" text="Loading organization data..." />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orgCountData.filter(d => d.count !== null)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  dot={{ fill: THEME.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2 }}
                  name="Active Organizations"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
MonthlyOrgCountChart.displayName = 'MonthlyOrgCountChart';

// Module Usage Infographic Component
const ModuleUsageInfographic = memo(({ moduleData, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#EDE9FE" }}
        >
          <Package className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-semibold" style={{ color: THEME.dark }}>
            Module Usage Statistics
          </h2>
          <p className="text-xs" style={{ color: THEME.muted }}>
            Extended module adoption rates (All Time)
          </p>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="md" text="Loading module data..." />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="moduleName" 
                  tick={{ fontSize: 12, fill: THEME.muted }}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                  formatter={(value, name) => {
                    if (name === 'activeOrganizations') return [value, 'Organizations'];
                    if (name === 'adoptionRate') return [`${value.toFixed(1)}%`, 'Adoption Rate'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="activeOrganizations" 
                  fill="#8B5CF6" 
                  radius={[0, 8, 8, 0]}
                  name="Organizations Using"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
ModuleUsageInfographic.displayName = 'ModuleUsageInfographic';

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

  // Chart state
  const [currentRevenueYear, setCurrentRevenueYear] = useState(new Date().getFullYear());
  const [currentOrgYear, setCurrentOrgYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const [orgCountData, setOrgCountData] = useState([]);
  const [moduleUsageData, setModuleUsageData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  // Support tickets state
  const [latestTickets, setLatestTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

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
    loadChartData();
    loadLatestTickets();
  }, [loadDashboardData]);

  // Load latest support tickets
  const loadLatestTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const response = await getAllTickets(0, 20); // Get more tickets to ensure we have 3 unread OPEN ones
      
      if (response.status === 'success' && response.data) {
        let ticketsData = [];
        
        // Handle Page object structure
        if (response.data.content && Array.isArray(response.data.content)) {
          ticketsData = response.data.content;
        } else if (Array.isArray(response.data)) {
          ticketsData = response.data;
        }
        
        // Filter for unread AND OPEN tickets only, limit to 3
        const unreadOpenTickets = ticketsData
          .filter(ticket => !ticket.isRead && ticket.status === 'OPEN')
          .slice(0, 3);
        setLatestTickets(unreadOpenTickets);
      }
    } catch (error) {
      console.error('Error loading latest tickets:', error);
      setLatestTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Load chart data
  const loadChartData = useCallback(async () => {
    setChartsLoading(true);
    try {
      await Promise.all([
        loadMonthlyRevenueData(currentRevenueYear),
        loadMonthlyOrgCountData(currentOrgYear),
        loadModuleUsageData()
      ]);
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setChartsLoading(false);
    }
  }, [currentRevenueYear, currentOrgYear]);

  // Load revenue data for specific year
  const loadMonthlyRevenueData = useCallback(async (year) => {
    try {
      // Get all organizations (no date filter to get all historical data)
      const response = await getOrganizationsReport({});
      
      if (response.success && response.data) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const monthlyData = monthNames.map((month, index) => ({
          month,
          revenue: 0
        }));

        // Calculate revenue timeline: track when each org was added/removed
        if (response.data.organizations && Array.isArray(response.data.organizations)) {
          response.data.organizations.forEach(org => {
            if (org.createdAt) {
              const createdDate = new Date(org.createdAt);
              const createdYear = createdDate.getFullYear();
              const createdMonth = createdDate.getMonth();
              const orgRevenue = Number(org.monthlyRevenue) || 0;
              
              // Add revenue starting from registration month
              for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                // Check if this month is after organization creation
                if (year > createdYear || (year === createdYear && monthIndex >= createdMonth)) {
                  // Only add if month is not in the future
                  if (year < currentYear || (year === currentYear && monthIndex <= currentMonth)) {
                    // Only add revenue if organization is ACTIVE
                    if (org.status === 'ACTIVE') {
                      monthlyData[monthIndex].revenue += orgRevenue;
                    }
                  }
                }
              }
            }
          });
        }

        setRevenueData(monthlyData);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
      setRevenueData([]);
    }
  }, []);

  // Load organization count data for specific year
  const loadMonthlyOrgCountData = useCallback(async (year) => {
    try {
      const response = await getAllOrganizations({ page: 0, size: 1000 });
      
      if (response.success && response.data) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const monthlyData = monthNames.map((month, index) => ({
          month,
          count: 0
        }));

        // Get all organizations
        const orgs = response.data.content || [];
        
        // For each month, count active organizations (not suspended/deleted)
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
          // Skip future months
          if (year === currentYear && monthIndex > currentMonth) {
            monthlyData[monthIndex].count = null;
            continue;
          }
          
          let activeCount = 0;
          
          orgs.forEach(org => {
            if (org.createdAt) {
              const date = new Date(org.createdAt);
              const orgYear = date.getFullYear();
              const orgMonth = date.getMonth();
              
              // Count if organization was created before or during this month
              // AND is currently ACTIVE (not suspended or deleted)
              if ((orgYear < year || (orgYear === year && orgMonth <= monthIndex)) && 
                  org.status === 'ACTIVE') {
                activeCount++;
              }
            }
          });
          
          monthlyData[monthIndex].count = activeCount;
        }

        setOrgCountData(monthlyData);
      }
    } catch (error) {
      console.error('Error loading organization count data:', error);
      setOrgCountData([]);
    }
  }, []);

  // Load module usage data
  const loadModuleUsageData = useCallback(async () => {
    try {
      const response = await getModuleUsageReport('ALL');
      
      if (response.success && response.data && response.data.moduleUsages) {
        setModuleUsageData(response.data.moduleUsages);
      }
    } catch (error) {
      console.error('Error loading module usage data:', error);
      setModuleUsageData([]);
    }
  }, []);

  // Reload revenue data when year changes
  useEffect(() => {
    loadMonthlyRevenueData(currentRevenueYear);
  }, [currentRevenueYear, loadMonthlyRevenueData]);

  // Reload org count data when year changes
  useEffect(() => {
    loadMonthlyOrgCountData(currentOrgYear);
  }, [currentOrgYear, loadMonthlyOrgCountData]);

  // Memoized handlers
  const handleRefresh = useCallback(
    () => loadDashboardData(),
    [loadDashboardData]
  );

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
        link: "/sys_admin/organizations"
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
        link: "/sys_admin/organizations?status=ACTIVE"
      },
      {
        title: "Pending Approvals",
        value: pendingApprovals.length,
        icon: Clock,
        iconColor: "#F59E0B",
        iconColorDark: "#D97706",
        bgLight: "#FFFBEB",
        borderColor: "#F59E0B",
        change: pendingApprovals.length > 0 ? "Needs attention" : "All clear",
        changeType: pendingApprovals.length > 0 ? "warning" : "positive",
        link: "/sys_admin/approvals"
      },
      {
        title: "Total Employees",
        value: stats.totalEmployees?.toLocaleString() || "0",
        icon: Users,
        iconColor: "#8B5CF6",
        iconColorDark: "#7C3AED",
        bgLight: "#F5F3FF",
        borderColor: "#8B5CF6",
        change: "Across all orgs",
        changeType: "positive",
        link: "/sys_admin/users"
      }
    ],
    [stats, pendingApprovals.length]
  );

  // Memoized quick actions
  const quickActions = useMemo(
    () => [
      {
        icon: Clock,
        label: "Review Approvals",
        link: "/sys_admin/approvals",
        bgColor: "#FEF3C7",
        iconColor: "#D97706"
      },
      {
        icon: Building2,
        label: "All Organizations",
        link: "/sys_admin/organizations",
        bgColor: "#DBEAFE",
        iconColor: THEME.secondary
      },
      {
        icon: TrendingUp,
        label: "Platform Analytics",
        link: "/sys_admin/analytics",
        bgColor: "#F3E8FF",
        iconColor: "#8B5CF6"
      },
      {
        icon: Shield,
        label: "System Settings",
        link: "/sys_admin/settings",
        bgColor: "#E0E7FF",
        iconColor: THEME.dark
      }
    ],
    []
  );

  // Memoized health metrics
  const healthMetrics = useMemo(
    () => [
      {
        icon: Activity,
        value: "99.9%",
        label: "Uptime",
        color: "#10B981",
        colorDark: "#059669"
      },
      {
        icon: Server,
        value: `${stats.totalOrganizations || 0}`,
        label: "Active Tenants",
        color: THEME.secondary,
        colorDark: THEME.dark
      },
      {
        icon: Zap,
        value: "< 100ms",
        label: "Avg Response",
        color: "#8B5CF6",
        colorDark: "#7C3AED"
      }
    ],
    [stats.totalOrganizations]
  );

  // Memoized formatted time
  const formattedLastRefresh = useMemo(
    () =>
      lastRefresh.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
    [lastRefresh]
  );

  // Extract username from email
  const userName = useMemo(
    () => user?.email?.split("@")[0] || "Admin",
    [user?.email]
  );

  // Loading state with skeleton
  if (isLoading && stats.totalOrganizations === 0) {
    return (
      <DashboardLayout title="System Administration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
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
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                Platform Dashboard
              </h1>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Here's what's happening on your platform today
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: THEME.background,
                  color: THEME.muted
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
                  color: "white"
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

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl border flex items-center gap-3"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#DC2626"
            }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-medium hover:underline"
            >
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
          {/* Pending Approvals Section - FIXED HEIGHT */}
          <div className="lg:col-span-2">
            <div className="bg-white h-[500px] rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#FEF3C7" }}
                  >
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: THEME.dark }}>
                      Pending Approvals
                    </h2>
                    <p className="text-xs" style={{ color: THEME.muted }}>
                      {pendingApprovals.length} organization
                      {pendingApprovals.length !== 1 ? "s" : ""} waiting
                    </p>
                  </div>
                </div>
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

              <div className="p-4 flex-1 overflow-y-auto">
                {pendingApprovals.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: "#ECFDF5" }}
                      >
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="font-medium" style={{ color: THEME.dark }}>
                        All caught up!
                      </p>
                      <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                        No pending approvals at the moment
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovals.slice(0, 3).map((org) => (
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
            {/* Latest Unread Support Requests - FIXED HEIGHT */}
            <div className="bg-white h-[500px] rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#FEF3C7" }}
                  >
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: THEME.dark }}>
                      Latest Support Requests
                    </h2>
                    <p className="text-xs" style={{ color: THEME.muted }}>
                      {latestTickets.length} unread ticket{latestTickets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {latestTickets.length > 0 && (
                  <Link
                    to="/sys_admin/supportlist"
                    className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: THEME.primary }}
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {ticketsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : latestTickets.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No unread tickets</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestTickets.map((ticket) => {
                      const getTypeIcon = (type) => {
                        switch (type) {
                          case "SUPPORT_REQUEST":
                            return <MessageCircle className="w-4 h-4 text-[#02C39A]" />;
                          case "BUG_REPORT":
                            return <Bug className="w-4 h-4 text-red-500" />;
                          case "SYSTEM_FEEDBACK":
                            return <FileText className="w-4 h-4 text-[#05668D]" />;
                          default:
                            return <MessageCircle className="w-4 h-4" />;
                        }
                      };

                      const getPriorityColor = (priority) => {
                        switch (priority) {
                          case "LOW":
                            return "bg-blue-100 text-blue-800";
                          case "MEDIUM":
                            return "bg-yellow-100 text-yellow-800";
                          case "HIGH":
                            return "bg-orange-100 text-orange-800";
                          case "CRITICAL":
                            return "bg-red-100 text-red-800";
                          default:
                            return "bg-gray-100 text-gray-800";
                        }
                      };

                      return (
                        <Link
                          key={ticket.id}
                          to="/sys_admin/supportlist"
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getTypeIcon(ticket.ticketType)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {ticket.subject}
                                </p>
                                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                  NEW
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {ticket.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(
                                    ticket.priority
                                  )}`}
                                >
                                  {ticket.priority}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {ticket.userName}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* System Health 
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#ECFDF5" }}
                >
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>
                    System Health
                  </h2>
                  <p className="text-xs" style={{ color: THEME.muted }}>
                    All systems operational
                  </p>
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
            */}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 space-y-8">
          {/* Revenue and Organization Growth Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <MonthlyRevenueChart
              currentYear={currentRevenueYear}
              onYearChange={setCurrentRevenueYear}
              revenueData={revenueData}
              loading={chartsLoading}
            />
            <MonthlyOrgCountChart
              currentYear={currentOrgYear}
              onYearChange={setCurrentOrgYear}
              orgCountData={orgCountData}
              loading={chartsLoading}
            />
          </div>

          {/* Module Usage Infographic */}
          <ModuleUsageInfographic
            moduleData={moduleUsageData}
            loading={chartsLoading}
          />
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
