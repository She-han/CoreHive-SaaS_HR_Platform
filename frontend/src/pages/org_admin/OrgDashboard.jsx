import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  FileText,
  BarChart3,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Briefcase,
  Bell,
  Zap
} from 'lucide-react';

import { selectUser, selectAvailableModules } from '../../store/slices/authSlice';
import { apiGet } from '../../api/axios';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardLayout from '../../components/layout/DashboardLayout';

import AIInsightsCard from '../../components/dashboard/AIInsightsCard';

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

// Memoized Skeleton Loader
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
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || '#'} className="group">
      <div 
        className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-opacity-50 relative overflow-hidden h-full"
        style={{ 
          borderColor: stat.borderColor,
          background: `linear-gradient(135deg, white 0%, ${stat.bgLight} 100%)`
        }}
      >
        {/* Background decoration */}
        <div 
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: stat.iconColor }}
        />
        
        <div className="flex items-center gap-4 relative z-10">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
            style={{ background: `linear-gradient(135deg, ${stat.iconColor} 0%, ${stat.iconColorDark} 100%)` }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: THEME.muted }}>
              {stat.title}
            </p>
            <p className="text-xl font-bold mt-0.5" style={{ color: THEME.dark }}>
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 text-green-500" />}
              {stat.changeType === 'warning' && <AlertCircle className="w-3 h-3 text-amber-500" />}
              <p className={`text-xs ${
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

// Memoized Quick Action Component
const QuickAction = memo(({ action }) => {
  const Icon = action.icon;
  return (
    <Link to={action.link}>
      <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer text-center">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm"
          style={{ background: `linear-gradient(135deg, ${action.color} 0%, ${action.colorDark} 100%)` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium" style={{ color: THEME.text }}>
          {action.label}
        </p>
      </div>
    </Link>
  );
});
QuickAction.displayName = 'QuickAction';

// Memoized Feature Badge
const FeatureBadge = memo(({ module }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
      <CheckCircle className="w-4 h-4 text-green-500" />
    </div>
    <span className="text-sm font-medium capitalize" style={{ color: THEME.text }}>
      {module.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  </div>
));
FeatureBadge.displayName = 'FeatureBadge';

/**
 * Organization Dashboard Component
 * Role-based dashboard for ORG_ADMIN, HR_STAFF, and EMPLOYEE
 * Modern design with AI-powered insights
 */
const OrgDashboard = () => {
  const user = useSelector(selectUser);
  const availableModules = useSelector(selectAvailableModules);
  
  // State management
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    monthlyPayrollTotal: 0,
    attendanceToday: 0,
    absentToday: 0,
    leaveBalance: {},
    checkedInToday: false,
    attendanceThisMonth: { present: 0, absent: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load dashboard data with useCallback
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiGet('/dashboard');
      if (response.success) {
        setDashboardData(response.data);
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

  // Memoized refresh handler
  const handleRefresh = useCallback(() => loadDashboardData(), [loadDashboardData]);

  // Memoized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Get role-specific stats cards with memoization
  const statsCards = useMemo(() => {
    const userRole = user?.role;
    
    if (userRole === 'ORG_ADMIN') {
      return [
        {
          title: 'Total Employees',
          value: dashboardData.totalEmployees?.toLocaleString() || '0',
          icon: Users,
          iconColor: THEME.secondary,
          iconColorDark: THEME.dark,
          bgLight: '#EBF8FF',
          borderColor: THEME.secondary,
          change: `${dashboardData.activeEmployees || 0} active`,
          changeType: 'positive',
          link: '/org_admin/hrstaffmanagement'
        },
        {
          title: 'Monthly Payroll',
          value: `LKR ${(dashboardData.monthlyPayrollTotal || 0).toLocaleString()}`,
          icon: DollarSign,
          iconColor: '#10B981',
          iconColorDark: '#059669',
          bgLight: '#ECFDF5',
          borderColor: '#10B981',
          change: 'Current month',
          changeType: 'positive',
          link: '/org_admin/reports'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Calendar,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          bgLight: '#FFFBEB',
          borderColor: '#F59E0B',
          change: dashboardData.pendingLeaveRequests > 0 ? 'Pending approval' : 'All clear',
          changeType: dashboardData.pendingLeaveRequests > 0 ? 'warning' : 'positive',
          link: '/hr_staff/leavemanagement'
        },
        {
          title: "Today's Attendance",
          value: `${dashboardData.attendanceToday || 0}/${dashboardData.totalEmployees || 0}`,
          icon: Clock,
          iconColor: '#8B5CF6',
          iconColorDark: '#7C3AED',
          bgLight: '#F5F3FF',
          borderColor: '#8B5CF6',
          change: `${dashboardData.absentToday || 0} absent`,
          changeType: dashboardData.absentToday > 0 ? 'warning' : 'positive',
          link: '/hr_staff/attendancemanagement'
        }
      ];
    } else if (userRole === 'HR_STAFF') {
      return [
        {
          title: 'Active Employees',
          value: dashboardData.activeEmployees?.toLocaleString() || '0',
          icon: Users,
          iconColor: THEME.secondary,
          iconColorDark: THEME.dark,
          bgLight: '#EBF8FF',
          borderColor: THEME.secondary,
          change: 'Currently active',
          changeType: 'positive',
          link: '/hr_staff/employeemanagement'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Calendar,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          bgLight: '#FFFBEB',
          borderColor: '#F59E0B',
          change: dashboardData.pendingLeaveRequests > 0 ? 'Needs review' : 'All reviewed',
          changeType: dashboardData.pendingLeaveRequests > 0 ? 'warning' : 'positive',
          link: '/hr_staff/leavemanagement'
        },
        {
          title: 'Present Today',
          value: dashboardData.attendanceToday || 0,
          icon: CheckCircle,
          iconColor: '#10B981',
          iconColorDark: '#059669',
          bgLight: '#ECFDF5',
          borderColor: '#10B981',
          change: 'Checked in',
          changeType: 'positive',
          link: '/hr_staff/attendancemanagement'
        },
        {
          title: 'Absent Today',
          value: dashboardData.absentToday || 0,
          icon: AlertCircle,
          iconColor: '#EF4444',
          iconColorDark: '#DC2626',
          bgLight: '#FEF2F2',
          borderColor: '#EF4444',
          change: dashboardData.absentToday > 0 ? 'Need follow-up' : 'All present',
          changeType: dashboardData.absentToday > 0 ? 'warning' : 'positive',
          link: '/hr_staff/attendancemanagement'
        }
      ];
    } else { // EMPLOYEE
      return [
        {
          title: 'Annual Leave',
          value: `${dashboardData.leaveBalance?.annual || 0} days`,
          icon: Calendar,
          iconColor: THEME.secondary,
          iconColorDark: THEME.dark,
          bgLight: '#EBF8FF',
          borderColor: THEME.secondary,
          change: 'Remaining',
          changeType: 'positive',
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'Sick Leave',
          value: `${dashboardData.leaveBalance?.sick || 0} days`,
          icon: AlertCircle,
          iconColor: '#EF4444',
          iconColorDark: '#DC2626',
          bgLight: '#FEF2F2',
          borderColor: '#EF4444',
          change: 'Available',
          changeType: 'positive',
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'This Month',
          value: `${dashboardData.attendanceThisMonth?.present || 0} days`,
          icon: CheckCircle,
          iconColor: '#10B981',
          iconColorDark: '#059669',
          bgLight: '#ECFDF5',
          borderColor: '#10B981',
          change: `${dashboardData.attendanceThisMonth?.absent || 0} absent`,
          changeType: 'positive',
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'Pending Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          bgLight: '#FFFBEB',
          borderColor: '#F59E0B',
          change: 'Leave requests',
          changeType: dashboardData.pendingLeaveRequests > 0 ? 'warning' : 'positive',
          link: '/employee/leaverequest'
        }
      ];
    }
  }, [user?.role, dashboardData]);

  // Get role-specific quick actions with memoization
  const quickActions = useMemo(() => {
    const userRole = user?.role;
    
    if (userRole === 'ORG_ADMIN') {
      return [
        { icon: UserPlus, label: 'Add Staff', link: '/org_admin/hrstaffmanagement/add', color: THEME.secondary, colorDark: THEME.dark },
        { icon: DollarSign, label: 'View Reports', link: '/org_admin/reports', color: '#10B981', colorDark: '#059669' },
        { icon: Calendar, label: 'Leaves', link: '/hr_staff/leavemanagement', color: '#F59E0B', colorDark: '#D97706' },
        { icon: BarChart3, label: 'Analytics', link: '/org_admin/reports', color: '#8B5CF6', colorDark: '#7C3AED' },
        { icon: Briefcase, label: 'Departments', link: '/org_admin/departmentmanagement', color: '#EC4899', colorDark: '#DB2777' },
        { icon: FileText, label: 'Settings', link: '/org_admin/settings', color: '#6B7280', colorDark: '#4B5563' }
      ];
    } else if (userRole === 'HR_STAFF') {
      return [
        { icon: Calendar, label: 'Review Leaves', link: '/hr_staff/leavemanagement', color: '#F59E0B', colorDark: '#D97706' },
        { icon: UserPlus, label: 'Add Employee', link: '/hr_staff/employeemanagement/add', color: THEME.secondary, colorDark: THEME.dark },
        { icon: Clock, label: 'Attendance', link: '/hr_staff/attendancemanagement', color: '#10B981', colorDark: '#059669' },
        { icon: BarChart3, label: 'HR Reports', link: '/hr_staff/hrreportingmanagement', color: '#8B5CF6', colorDark: '#7C3AED' }
      ];
    } else { // EMPLOYEE
      return [
        { icon: Calendar, label: 'Apply Leave', link: '/employee/leaverequest', color: '#F59E0B', colorDark: '#D97706' },
        { icon: Clock, label: 'View Attendance', link: '/employee/viewleaveandattendance', color: '#10B981', colorDark: '#059669' },
        { icon: FileText, label: 'My Payslips', link: '/employee/payslips', color: THEME.secondary, colorDark: THEME.dark },
        { icon: Users, label: 'My Profile', link: '/employee/profile', color: '#8B5CF6', colorDark: '#7C3AED' }
      ];
    }
  }, [user?.role]);

  // Check if AI Insights should be shown
  const shouldShowAIInsights = useMemo(() => {
    return user?.role === 'ORG_ADMIN' || user?.role === 'HR_STAFF';
  }, [user?.role]);

  // Memoized enabled modules
  const enabledModules = useMemo(() => 
    Object.entries(availableModules || {}).filter(([_, enabled]) => enabled).map(([module]) => module),
    [availableModules]
  );

  // Memoized formatted time
  const formattedLastRefresh = useMemo(() => 
    lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    [lastRefresh]
  );

  // User display name
  const displayName = useMemo(() => 
    user?.firstName || user?.role?.replace('_', ' ') || 'User',
    [user?.firstName, user?.role]
  );

  // Loading state with skeleton
  if (isLoading && dashboardData.totalEmployees === 0) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
    <DashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                Organization Overview
              </h2>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Here's your dashboard overview for today
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
                style={{ backgroundColor: THEME.primary, color: 'white' }}
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
            <button onClick={() => setError(null)} className="font-medium hover:underline">Dismiss</button>
          </div>
        )}

        {/* Employee check-in reminder */}
        {user?.role === 'EMPLOYEE' && !dashboardData.checkedInToday && (
          <div 
            className="mb-6 p-4 rounded-xl border flex items-center gap-4"
            style={{ backgroundColor: '#FFFBEB', borderColor: '#FED7AA' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: '#92400E' }}>Don't forget to check in!</p>
              <p className="text-sm" style={{ color: '#B45309' }}>
                You haven't checked in today yet. Mark your attendance to track your working hours.
              </p>
            </div>
            <Link 
              to="/employee/viewleaveandattendance"
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: '#F59E0B' }}
            >
              Check In
            </Link>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {statsCards.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* AI Insights Section - Only for ORG_ADMIN and HR_STAFF */}
        {shouldShowAIInsights && user?.organizationUuid && (
          <div className="mb-8">
            <AIInsightsCard organizationUuid={user.organizationUuid} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: THEME.background }}
                >
                  <Zap className="w-5 h-5" style={{ color: THEME.primary }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>Quick Actions</h2>
                  <p className="text-xs" style={{ color: THEME.muted }}>Common tasks at your fingertips</p>
                </div>
              </div>
              <div className="p-6">
                <div className={`grid gap-4 ${quickActions.length > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
                  {quickActions.map((action) => (
                    <QuickAction key={action.label} action={action} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Available Features */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#ECFDF5' }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>Available Features</h2>
                  <p className="text-xs" style={{ color: THEME.muted }}>{enabledModules.length} modules enabled</p>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {enabledModules.length > 0 ? (
                  enabledModules.map((module) => (
                    <FeatureBadge key={module} module={module} />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm" style={{ color: THEME.muted }}>No additional modules enabled</p>
                  </div>
                )}
              </div>
              
              {user?.role === 'ORG_ADMIN' && (
                <div className="px-4 pb-4">
                  <Link to="/org_admin/modules">
                    <button 
                      className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: THEME.background,
                        color: THEME.secondary,
                        border: `1px solid ${THEME.primary}`
                      }}
                    >
                      Manage Features
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrgDashboard;