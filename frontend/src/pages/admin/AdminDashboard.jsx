import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
  Eye
} from 'lucide-react';

import { selectUser } from '../../store/slices/authSlice';
import { getPendingApprovals, getPlatformStatistics } from '../../api/adminApi';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OrganizationReviewModal from '../../components/admin/OrganizationReviewModal';
import TenantGrowthChart from './ui/TenantGrowthChart';
import SystemLoad from './ui/SystemLoad';
import ModuleUsageChart from './ui/Df';

// Theme colors
const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  background: '#F1FDF9',
  success: '#1ED292',
  text: '#333333',
  muted: '#9B9B9B'
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
SkeletonCard.displayName = 'SkeletonCard';

// Memoized Stat Card Component
const StatCard = memo(({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || '#'} className="group">
      <div 
        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-opacity-50 relative overflow-hidden"
        style={{ 
          borderColor: stat.borderColor,
          background: `linear-gradient(135deg, white 0%, ${stat.bgLight} 100%)`
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
            style={{ background: `linear-gradient(135deg, ${stat.iconColor} 0%, ${stat.iconColorDark} 100%)` }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: THEME.muted }}>
              {stat.title}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: THEME.dark }}>
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 text-green-500" />}
              {stat.changeType === 'warning' && <AlertCircle className="w-3 h-3 text-amber-500" />}
              <p className={`text-xs font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'warning' ? 'text-amber-600' : 'text-gray-500'
              }`}>
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
StatCard.displayName = 'StatCard';

// Memoized Pending Approval Item
const PendingApprovalItem = memo(({ org, onReview }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        style={{ background: `linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.dark} 100%)` }}
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
            {org.employeeCountRange || '1-50'} employees
          </span>
          <span className="text-xs" style={{ color: THEME.muted }}>
            {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
    
    <button 
      onClick={() => onReview(org)}
      className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-md"
      style={{ 
        backgroundColor: THEME.primary,
        color: 'white'
      }}
    >
      <Eye className="w-4 h-4" />
      Review
    </button>
  </div>
));
PendingApprovalItem.displayName = 'PendingApprovalItem';

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
        <span className="font-medium flex-1" style={{ color: THEME.text }}>{action.label}</span>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
});
QuickActionButton.displayName = 'QuickActionButton';

// Memoized System Health Metric
const HealthMetric = memo(({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="text-center p-4 rounded-xl transition-all hover:bg-gray-50">
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md"
        style={{ background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.colorDark} 100%)` }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-2xl font-bold" style={{ color: metric.color }}>{metric.value}</div>
      <div className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: THEME.muted }}>
        {metric.label}
      </div>
    </div>
  );
});
HealthMetric.displayName = 'HealthMetric';

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
      title: 'Total Organizations',
      value: stats.totalOrganizations?.toLocaleString() || '0',
      icon: Building2,
      iconColor: THEME.secondary,
      iconColorDark: THEME.dark,
      bgLight: '#EBF8FF',
      borderColor: THEME.secondary,
      change: `${stats.activeOrganizations || 0} active`,
      changeType: 'positive',
      link: '/sys_admin/organizations'
    },
    {
      title: 'Active Organizations',
      value: stats.activeOrganizations?.toLocaleString() || '0',
      icon: CheckCircle,
      iconColor: '#10B981',
      iconColorDark: '#059669',
      bgLight: '#ECFDF5',
      borderColor: '#10B981',
      change: 'Running smoothly',
      changeType: 'positive',
      link: '/sys_admin/organizations?status=ACTIVE'
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.length,
      icon: Clock,
      iconColor: '#F59E0B',
      iconColorDark: '#D97706',
      bgLight: '#FFFBEB',
      borderColor: '#F59E0B',
      change: pendingApprovals.length > 0 ? 'Needs attention' : 'All clear',
      changeType: pendingApprovals.length > 0 ? 'warning' : 'positive',
      link: '/sys_admin/approvals'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees?.toLocaleString() || '0',
      icon: Users,
      iconColor: '#8B5CF6',
      iconColorDark: '#7C3AED',
      bgLight: '#F5F3FF',
      borderColor: '#8B5CF6',
      change: 'Across all orgs',
      changeType: 'positive',
      link: '/sys_admin/users'
    }
  ], [stats, pendingApprovals.length]);

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      icon: Clock,
      label: 'Review Approvals',
      link: '/sys_admin/approvals',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      icon: Building2,
      label: 'All Organizations',
      link: '/sys_admin/organizations',
      bgColor: '#DBEAFE',
      iconColor: THEME.secondary
    },
    {
      icon: TrendingUp,
      label: 'Platform Analytics',
      link: '/sys_admin/analytics',
      bgColor: '#F3E8FF',
      iconColor: '#8B5CF6'
    },
    {
      icon: Shield,
      label: 'System Settings',
      link: '/sys_admin/settings',
      bgColor: '#E0E7FF',
      iconColor: THEME.dark
    }
  ], []);

  // Memoized health metrics
  const healthMetrics = useMemo(() => [
    {
      icon: Activity,
      value: '99.9%',
      label: 'Uptime',
      color: '#10B981',
      colorDark: '#059669'
    },
    {
      icon: Server,
      value: `${stats.totalOrganizations || 0}`,
      label: 'Active Tenants',
      color: THEME.secondary,
      colorDark: THEME.dark
    },
    {
      icon: Zap,
      value: '< 100ms',
      label: 'Avg Response',
      color: '#8B5CF6',
      colorDark: '#7C3AED'
    }
  ], [stats.totalOrganizations]);

  // Memoized formatted time
  const formattedLastRefresh = useMemo(() => 
    lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    [lastRefresh]
  );

  // Extract username from email
  const userName = useMemo(() => 
    user?.email?.split('@')[0] || 'Admin',
    [user?.email]
  );


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
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                Welcome back, <span style={{ color: THEME.primary }}>{userName}</span>! 
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
                    {pendingApprovals.slice(0, 2).map((org) => (
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

            {/* System Health 
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
            */}
          </div>
        </div>

        {/* Organization Status Overview */}
        <div className="mt-8">
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

        {/* Analytics Charts Section */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Tenant Growth Chart */}
          <TenantGrowthChart />
          
          {/* System Load Chart */}
          <SystemLoad />
        </div>

        {/* Module Usage Chart - Full Width */}
        <div className="mt-8">
          <ModuleUsageChart />
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
