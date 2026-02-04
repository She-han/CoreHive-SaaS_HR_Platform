import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { Users, UserCheck, UserX, ArrowRight, Zap, TrendingUp, PieChart, Briefcase, Clock, RefreshCw, ClipboardCheck, UserPlus, Bell, FileText, CheckCircle, XCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight, BarChart3, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTotalEmployeesCount , getTotalActiveEmployeesCount } from '../../api/employeeApi.js';
import { getTotalOnLeaveCount } from '../../api/manualAttendanceService.js';
import { getAllLeaveRequests } from '../../api/leaveRequestApi.js';
import { getAllFeedbacks } from '../../api/feedbackApi.js';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import {
  getAttendanceSummary,
  getAttendanceByDate
} from "../../api/monitorAttendanceApi";
import Swal from 'sweetalert2';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMonthlyAttendanceChartData, getYearlyEmployeeGrowthChartData } from '../../api/chartApi';

// Theme colors matching OrgDashboard
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
SkeletonCard.displayName = "SkeletonCard";

// Memoized Enterprise-level Stat Card Component with animations and hover effects
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || "#"} className="group block h-full">
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
              style={{
                borderColor: stat.iconColor,
                backgroundColor: `${stat.iconColor}22`
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: stat.iconColor }}
                strokeWidth={2.25}
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
StatCard.displayName = 'StatCard';

// Memoized Quick Action Component - Enterprise Design
const QuickAction = memo(({ action }) => {
  const Icon = action.icon;
  return (
    <button
      onClick={action.action}
      className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full"
    >
      <div className="absolute inset-0 rounded-2xl bg-[#02C39A] opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A] group-hover:border-[#16f3c3a7] transition-colors">
          {action.icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0C397A] group-hover:text-[#0C397A] transition-colors">{action.label}</h3>
          <p className="text-sm text-[#475467] group-hover:text-[#475467] transition-colors">{action.sub}</p>
        </div>
      </div>
    </button>
  );
});
QuickAction.displayName = 'QuickAction';

// Memoized Monthly Attendance Line Chart Component
const MonthlyAttendanceChart = memo(({ currentMonth, onMonthChange, attendanceData, loading }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    onMonthChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    onMonthChange(nextMonth);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: THEME.background }}
          >
            <Activity className="w-5 h-5" style={{ color: THEME.primary }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: THEME.dark }}>
              Monthly Attendance Trends
            </h2>
            <p className="text-xs" style={{ color: THEME.muted }}>
              Daily attendance patterns for {monthNames[currentMonth]} 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            style={{ color: THEME.dark }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm font-medium" style={{ color: THEME.dark }}>
            {monthNames[currentMonth]}
          </span>
          <button
            onClick={handleNextMonth}
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
            <LoadingSpinner size="md" text="Loading attendance data..." />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="day" 
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
                  dataKey="present" 
                  stroke={THEME.success} 
                  strokeWidth={3}
                  dot={{ fill: THEME.success, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: THEME.success, strokeWidth: 2 }}
                  name="Present"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
                  name="Absent"
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2 }}
                  name="Late"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
MonthlyAttendanceChart.displayName = 'MonthlyAttendanceChart';

// Memoized Yearly Employee Growth Chart Component
const YearlyEmployeeGrowthChart = memo(({ currentYear, onYearChange, growthData, loading }) => {
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
            <BarChart3 className="w-5 h-5" style={{ color: THEME.secondary }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: THEME.dark }}>
              Employee Growth Trends
            </h2>
            <p className="text-xs" style={{ color: THEME.muted }}>
              Monthly employee count progression for {currentYear}
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
            <LoadingSpinner size="md" text="Loading growth data..." />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="employeeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="totalEmployees" 
                  stroke={THEME.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#employeeGradient)"
                  dot={{ fill: THEME.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: THEME.primary, strokeWidth: 2 }}
                  name="Total Employees"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});
YearlyEmployeeGrowthChart.displayName = 'YearlyEmployeeGrowthChart';

const HRDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);
  const [totalOnLeaveEmployees, setTotalOnLeaveEmployees] = useState(0);
  const [totalPresentEmployees, setTotalPresentEmployees] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [today] = useState(new Date());

  // Chart navigation states
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const [summary, setSummary] = useState({
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      HALF_DAY: 0,
      ON_LEAVE: 0,
      WORK_FROM_HOME: 0
    });

  useEffect(() => {
    const selectedDate = today.toISOString().split("T")[0];
    loadTodaySummary(selectedDate); // Load summary cards (Present, Late, Leave, Absent)
  }, [today]);

  async function loadTodaySummary(selectedDate) {
    try {
      const data = await getAttendanceSummary(selectedDate);
      console.log("SUMMARY API DATA:", data);
      setSummary(data);
    } catch (err) {
      console.error("Error loading attendance summary:", err);
    }
  }

  // Load dashboard data with useCallback for performance
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getTotalEmployeesCount().then(setTotalEmployees),
      getTotalActiveEmployeesCount().then(setTotalActiveEmployees),
      getTotalOnLeaveCount().then((count) => {
        setTotalOnLeaveEmployees(count);
        return count;
      }),
      getAllLeaveRequests().then((data) => {
        // Get only pending requests, sorted by date, max 4
        const pending = data?.filter(req => req.status === 'PENDING') || [];
        setLeaveRequests(pending.slice(0, 4));
      }),
      getAllFeedbacks().then((response) => {
        // Get only unread feedbacks, max 4
        const unread = response.data?.filter(f => !f.markedAsRead) || [];
        setFeedbacks(unread.slice(0, 4));
      })
    ]).then(([employees, active, onLeave]) => {
      // Calculate present: active employees minus those on leave
      setTotalPresentEmployees(active - onLeave);
    }).catch((err) => {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    }).finally(() => {
      setLoading(false);
      setLastRefresh(new Date());
    });
  }, []);

  // Load monthly attendance data from API
  const loadMonthlyAttendanceData = useCallback(async (month) => {
    try {
      setChartsLoading(true);
      const currentYear = new Date().getFullYear();
      const response = await getMonthlyAttendanceChartData(currentYear, month + 1); // API expects 1-12, but our state is 0-11
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      // Fallback to empty array if API fails
      setAttendanceData([]);
    } finally {
      setChartsLoading(false);
    }
  }, []);

  // Load yearly employee growth data from API
  const loadYearlyGrowthData = useCallback(async (year) => {
    try {
      setChartsLoading(true);
      const response = await getYearlyEmployeeGrowthChartData(year);
      setGrowthData(response.data || []);
    } catch (error) {
      console.error('Error loading growth data:', error);
      // Fallback to empty array if API fails
      setGrowthData([]);
    } finally {
      setChartsLoading(false);
    }
  }, []);

  // Chart navigation handlers
  const handleMonthChange = useCallback((month) => {
    setCurrentMonth(month);
    loadMonthlyAttendanceData(month);
  }, [loadMonthlyAttendanceData]);

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year);
    loadYearlyGrowthData(year);
  }, [loadYearlyGrowthData]);

  // Load chart data when component mounts or month/year changes
  useEffect(() => {
    loadMonthlyAttendanceData(currentMonth);
    loadYearlyGrowthData(currentYear);
  }, [loadMonthlyAttendanceData, loadYearlyGrowthData, currentMonth, currentYear]);

  // Memoized stats cards with enterprise design and ON_LEAVE count
  const statsCards = useMemo(() => [
    {
      title: "Total Employees",
      value: totalEmployees?.toLocaleString() || "0",
      icon: Users,
      iconColor: THEME.primary,
      change: `${totalActiveEmployees || 0} Active`,
      changeType: "positive",
      trend: "+5%",
      link: "/hr_staff/employeemanagement"
    },
    {
      title: "Present Today",
      value: summary.PRESENT?.toLocaleString() || "0",
      icon: UserCheck,
      iconColor: THEME.success,
      change: `${summary.ABSENT || 0} Absent`,
      changeType: "positive",
      trend: "+2%",
      link: "/hr_staff/attendancemanagement"
    },
    {
      title: "On Leave Today",
      value: summary.ON_LEAVE || 0,
      icon: Calendar,
      iconColor: "#F59E0B",
      change: "Employees on Leave",
      changeType: "warning",
      trend: `${summary.ON_LEAVE || 0} Today`,
      link: "/hr_staff/attendancemanagement"
    },
    {
      title: "Late Arrivals",
      value: summary.LATE || 0,
      icon: Clock,
      iconColor: "#EF4444",
      change: "Today",
      link: "/hr_staff/attendancemanagement"
    }
  ], [totalEmployees, totalActiveEmployees, summary]);

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      label: 'Mark Attendance',
      sub: 'Manual attendance entry',
      icon: <ClipboardCheck className="w-6 h-6 text-[#0C397A]" strokeWidth={2.5} />,
      action: () => navigate('/hr_staff/attendancemarking')
    },
    {
      label: 'Add Employee',
      sub: 'Onboard new member',
      icon: <UserPlus className="w-6 h-6 text-[#05668D]" strokeWidth={2.5} />,
      action: () => navigate('/hr_staff/employeemanagement/addemployee')
    },
    {
      label: 'Add Notice',
      sub: 'Post announcement',
      icon: <Bell className="w-6 h-6 text-[#02C39A]" strokeWidth={2.5} />,
      action: () => {
        Swal.fire({
          title: 'Add New Notice',
          text: 'Opening notice management...',
          icon: 'info',
          confirmButtonColor: THEME.primary,
          timer: 1600,
          showConfirmButton: false
        });
        navigate('/hr_staff/noticemanagement');
      }
    },
    {
      label: 'Create Survey',
      sub: 'Employee feedback form',
      icon: <FileText className="w-6 h-6 text-[#0C397A]" strokeWidth={2.5} />,
      action: () => navigate('/hr_staff/feedback/create')
    }
  ], [navigate]);

  // Memoized formatted time
  const formattedLastRefresh = useMemo(
    () => lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    [lastRefresh]
  );

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Loading state with skeleton
  if (loading && totalEmployees === 0) {
    return (
      <div className="min-h-screen bg-[#F1FDF9] font-sans text-[#333333] antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="lg" text="Loading dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1FDF9] font-sans text-[#333333] antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Header matching OrgDashboard */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: THEME.dark }}>
                HR Dashboard
              </h2>
              <p className="mt-1 text-md font-medium" style={{ color: THEME.muted }}>
                Human Resources Management System
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
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md disabled:opacity-50"
                style={{ backgroundColor: THEME.primary, color: 'white' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
          {statsCards.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* Quick Action Cards - Enterprise Level */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: THEME.background }}
              >
                <Zap className="w-5 h-5" style={{ color: THEME.primary }} />
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: THEME.dark }}>
                  HR Management Quick Actions
                </h2>
                <p className="text-xs" style={{ color: THEME.muted }}>
                  Common tasks at your fingertips
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <QuickAction key={action.label} action={action} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <MonthlyAttendanceChart
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            attendanceData={attendanceData}
            loading={chartsLoading}
          />
          <YearlyEmployeeGrowthChart
            currentYear={currentYear}
            onYearChange={handleYearChange}
            growthData={growthData}
            loading={chartsLoading}
          />
        </div>

        {/* Two Section Layout - Leave Requests & Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

          {/* Latest Unread Feedbacks */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] bg-[#0C397A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A]">
                  <TrendingUp className="w-5 h-5 text-[#0C397A]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#F1FDF9]">Unread Feedbacks</h2>
                  <p className="text-xs text-[#F1FDF9]">Recent submissions</p>
                </div>
              </div>
              <Link 
                to="/hr_staff/employeefeedbacks"
                className="text-xs text-[#F1FDF9] hover:text-[#0C397A] font-medium flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No unread feedbacks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((feedback, idx) => (
                    <div 
                      key={feedback.id || idx} 
                      className="p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#02C39A40] hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-[#0F172A]">{feedback.employeeName}</p>
                          <p className="text-xs text-[#667085]">{feedback.employeeCode}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          feedback.feedbackType === 'COMPLAINT' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                          feedback.feedbackType === 'APPRECIATION' ? 'bg-[#DCFCE7] text-[#166534]' :
                          'bg-[#E0F2FE] text-[#1D4ED8]'
                        }`}>
                          {feedback.feedbackType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[#475467] line-clamp-2">{feedback.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#98A2B3]">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Latest Leave Requests */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] bg-[#0C397A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A]">
                  <Briefcase className="w-5 h-5 text-[#05668D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#F1FDF9]">Latest Leave Requests</h2>
                  <p className="text-xs text-[#F1FDF9]">Pending approvals</p>
                </div>
              </div>
              <Link 
                to="/hr_staff/leavemanagement"
                className="text-xs text-[#F1FDF9] hover:text-[#0C397A] font-medium flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No pending leave requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveRequests.map((request, idx) => {
                    // Use startDate/endDate with fallback to fromDate/toDate, just like LeaveRequestTable
                    const fromDate = new Date(request.startDate || request.fromDate);
                    const toDate = new Date(request.endDate || request.toDate);
                    
                    return (
                      <div 
                        key={request.id || idx} 
                        className="p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#02C39A40] hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-[#0F172A]">{request.employeeName}</p>
                            <p className="text-xs text-[#667085]">{request.employeeCode}</p>
                          </div>
                          <span className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold rounded-full">
                            {request.leaveTypeName || 'Leave'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#475467] mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fromDate.toLocaleDateString()} - {toDate.toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-[#F1FDF9] text-[#05668D] font-semibold rounded">
                            {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          


        </div>
      </div>
    </div>
  );
}

export default HRDashboard;
