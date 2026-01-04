import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectAvailableModules } from '../../store/slices/authSlice';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Calendar, DollarSign, 
  TrendingUp, AlertCircle, Clock, FileText,
  UserPlus, Send, BarChart3, Settings,
  CheckCircle, RefreshCw, Zap, Bell, ArrowRight
} from 'lucide-react';
import { getDashboardData } from '../../api/dashboardApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AIInsightsCard from '../../components/dashboard/AIInsightsCard';

// Theme colors - Your color palette
const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  darkText: '#333333',
  background: '#F1FDF9',
  success: '#1ED292',
  text: '#333333',
  muted: '#9B9B9B',
  white: '#FFFFFF'
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

// Memoized Stat Card Component - UNIQUE DESIGN
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || '#'} className="group block h-full">
      <div 
        className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-opacity-100 h-full overflow-hidden transform hover:-translate-y-1"
        style={{ borderColor: `${stat.iconColor}20` }}
      >
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{ backgroundColor: stat.iconColor }}
        />
        <div 
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: stat.iconColor }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm group-hover:scale-110 transition-all duration-300"
              style={{ borderColor: stat.iconColor, backgroundColor: `${stat.iconColor}22` }}
            >
              <Icon className="w-6 h-6" style={{ color: stat.iconColor }} strokeWidth={2.25} />
            </div>
            
            {stat.changeType && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' ? 'bg-green-50 text-green-600' :
                stat.changeType === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
              }`}>
                {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {stat.changeType === 'warning' && <AlertCircle className="w-3 h-3" />}
                <span>{stat.trend || '0%'}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: THEME.muted }}>
              {stat.title}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold" style={{ color: THEME.dark }}>
                {stat.value}
              </p>
              {stat.suffix && (
                <span className="text-sm font-medium mb-1" style={{ color: THEME.muted }}>
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
StatCard.displayName = 'StatCard';

// Memoized Quick Action Component - REDESIGNED
const QuickAction = memo(({ action }) => {
  const Icon = action.icon;
  return (
    <Link to={action.link} className="block">
      <div className="relative group p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 text-center">
        <div 
          className="w-11 h-11 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 group-hover:scale-105 transition-transform duration-300"
          style={{ borderColor: action.color, backgroundColor: `${action.color}08` }}
        >
          <Icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={2} />
        </div>
        <p className="text-sm font-medium" style={{ color: THEME.darkText }}>
          {action.label}
        </p>
      </div>
    </Link>
  );
});
QuickAction.displayName = 'QuickAction';

// Memoized Feature Badge - REDESIGNED
const FeatureBadge = memo(({ module }) => (
  <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-shadow duration-200">
    <div className="w-7 h-7 rounded-md flex items-center justify-center border-2 border-green-500 bg-green-50">
      <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
    </div>
    <span className="text-sm font-medium capitalize" style={{ color: THEME.dark }}>
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
      const response = await getDashboardData();
      if (response.success) {
        setDashboardData(prev => ({
          ...prev,
          ...response.data
        }));
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
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: `${dashboardData.activeEmployees || 0} Active`,
          changeType: 'positive',
          trend: '+12%',
          link: '/org_admin/hrstaffmanagement'
        },
        {
          title: 'Present Today',
          value: dashboardData.attendanceToday?.toLocaleString() || '0',
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: '#059669',
          change: `${dashboardData.absentToday || 0} Absent`,
          changeType: 'positive',
          trend: '+0%',
          link: '/hr_staff/attendancemanagement'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Calendar,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          change: 'Pending Approval',
          changeType: dashboardData.pendingLeaveRequests > 0 ? 'warning' : 'positive',
          trend: `${dashboardData.pendingLeaveRequests} New`,
          link: '/hr_staff/leavemanagement'
        },
        {
          title: 'Monthly Payroll',
          value: dashboardData.monthlyPayrollTotal || 0,
          suffix: 'LKR',
          icon: DollarSign,
          iconColor: THEME.secondary,
          iconColorDark: THEME.dark,
          change: 'Total Amount',
          link: '/org_admin/reports'
        }
      ];
    } else if (userRole === 'HR_STAFF') {
      return [
        {
          title: 'Total Employees',
          value: dashboardData.totalEmployees?.toLocaleString() || '0',
          icon: Users,
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: 'In Organization',
          link: '/hr_staff/employeemanagement'
        },
        {
          title: 'Attendance Today',
          value: dashboardData.attendanceToday?.toLocaleString() || '0',
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: '#059669',
          change: `${dashboardData.absentToday || 0} Absent`,
          link: '/hr_staff/attendancemanagement'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Calendar,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          change: 'Pending Approval',
          changeType: dashboardData.pendingLeaveRequests > 0 ? 'warning' : 'positive',
          link: '/hr_staff/leavemanagement'
        },
        {
          title: 'Late Arrivals',
          value: dashboardData.lateArrivals || 0,
          icon: Clock,
          iconColor: '#EF4444',
          iconColorDark: '#DC2626',
          change: 'Today',
          link: '/hr_staff/attendancemanagement'
        }
      ];
    } else { // EMPLOYEE
      return [
        {
          title: 'Leave Balance',
          value: dashboardData.leaveBalance?.annual || 0,
          icon: Calendar,
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: 'Days Available',
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'Attendance',
          value: dashboardData.attendanceThisMonth?.present || 0,
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: '#059669',
          change: `${dashboardData.attendanceThisMonth?.absent || 0} Days Absent`,
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'Pending Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          change: 'Leave Requests',
          link: '/employee/viewleaveandattendance'
        },
        {
          title: 'Pending Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          iconColor: '#F59E0B',
          iconColorDark: '#D97706',
          change: 'Leave Requests',
          link: '/employee/leaverequest'
        },
        {
          title: 'Checked In',
          value: dashboardData.checkedInToday ? 'Yes' : 'No',
          icon: CheckCircle,
          iconColor: dashboardData.checkedInToday ? THEME.success : '#EF4444',
          iconColorDark: dashboardData.checkedInToday ? '#059669' : '#DC2626',
          change: 'Today',
          link: '/attendance/mark'
        }
      ];
    }
  }, [user?.role, dashboardData]);

  // Get role-specific quick actions with memoization
  const quickActions = useMemo(() => {
    const userRole = user?.role;
    
    if (userRole === 'ORG_ADMIN' || userRole === 'HR_STAFF') {
      const hrActions = [
        { icon: BarChart3, label: 'Dashboard', link: userRole === 'ORG_ADMIN' ? '/hr_staff/dashboard' : '/hr_staff/dashboard', color: THEME.secondary, colorDark: THEME.dark },
        { icon: Users, label: 'Employee Management', link: '/hr_staff/employeemanagement', color: THEME.primary, colorDark: THEME.secondary },
        { icon: Calendar, label: 'Leave Management', link: '/hr_staff/leavemanagement', color: '#F59E0B', colorDark: '#D97706' },
        { icon: Clock, label: 'Attendance', link: '/hr_staff/attendancemanagement', color: THEME.success, colorDark: '#059669' },
        { icon: DollarSign, label: 'Payroll', link: '/hr_staff/payrolldashboard', color: THEME.secondary, colorDark: THEME.dark },
        { icon: FileText, label: 'HR Reports', link: '/hr_staff/hrreportingmanagement', color: THEME.dark, colorDark: THEME.secondary }
      ];

      // Add module-based actions if enabled
      if (availableModules?.moduleFaceRecognitionAttendanceMarking) {
        hrActions.push({ icon: UserCheck, label: 'Face Attendance', link: '/hr_staff/faceattendance', color: THEME.primary, colorDark: THEME.secondary });
      }
      if (availableModules?.moduleQrAttendanceMarking) {
        hrActions.push({ icon: Zap, label: 'QR Attendance', link: '/hr_staff/qrattendance', color: '#0EA5E9', colorDark: '#0284C7' });
      }
      if (availableModules?.moduleEmployeeFeedback) {
        hrActions.push({ icon: FileText, label: 'Feedback Management', link: '/hr_staff/feedbackmanagement', color: '#7C3AED', colorDark: '#6D28D9' });
      }
      if (availableModules?.moduleHiringManagement) {
        hrActions.push({ icon: UserPlus, label: 'Hiring Management', link: '/hr_staff/hiringmanagement', color: '#EA580C', colorDark: '#C2410C' });
      }



      return hrActions;
    } else { // EMPLOYEE
      return [
        { icon: Send, label: 'Apply Leave', link: '/employee/leaverequest', color: THEME.primary, colorDark: THEME.secondary },
        { icon: CheckCircle, label: 'Mark Attendance', link: '/attendance/mark', color: THEME.success, colorDark: '#059669' },
        { icon: FileText, label: 'View Payslips', link: '/payroll/payslips', color: THEME.secondary, colorDark: THEME.dark },
        { icon: Users, label: 'My Profile', link: '/employee/profile', color: '#8B5CF6', colorDark: '#7C3AED' }
      ];
    }
  }, [user?.role, availableModules]);

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
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>HR Management Quick Actions</h2>
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