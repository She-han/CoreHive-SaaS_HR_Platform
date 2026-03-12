import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSelector } from "react-redux";
import {
  selectUser,
  selectAvailableModules
} from "../../store/slices/authSlice";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  UserPlus,
  Send,
  BarChart3,
  Settings,
  CheckCircle,
  RefreshCw,
  Zap,
  Bell,
  ArrowRight,
  Briefcase,
  Building,
  CreditCard,
  MessageSquare,
  QrCode,
  ScanFace,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { getDashboardData } from "../../api/dashboardApi";
import { getOrganizationModules } from "../../api/organizationModulesApi";
import { getMonthlyAttendanceChartData, getYearlyEmployeeGrowthChartData } from "../../api/chartApi";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import AIInsightsCard from "../../components/dashboard/AIInsightsCard";

// Theme colors - Your color palette
const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  darkText: "#333333",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
  white: "#FFFFFF",
  charts: [
    "#02C39A", // Primary
    "#05668D", // Secondary
    "#0C397A", // Dark
    "#4CC9F0", // Light Blue
    "#F72585", // Pink/Accent
    "#4361EE", // Blue/Accent
    "#3A0CA3", // Deep Purple
    "#7209B7"  // Purple
  ]
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

// Memoized Stat Card Component - UNIQUE DESIGN
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link || "#"} className="group block h-full">
      <div
        className="relative rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 h-full overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
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

// Memoized Quick Action Component - REDESIGNED
const QuickAction = memo(({ action }) => {
  const Icon = action.icon;
  return (
    <Link to={action.link} className="block">
      <div className="relative group p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 text-center">
        {action.moduleEnabled && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
            EXT
          </span>
        )}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 group-hover:scale-105 transition-transform duration-300"
          style={{
            borderColor: action.color,
            backgroundColor: `${action.color}08`
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: action.color }}
            strokeWidth={2}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: THEME.darkText }}>
          {action.label}
        </p>
      </div>
    </Link>
  );
});
QuickAction.displayName = "QuickAction";

// Memoized Feature Badge - REDESIGNED
const FeatureBadge = memo(({ module }) => (
  <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-shadow duration-200">
    <div className="w-7 h-7 rounded-md flex items-center justify-center border-2 border-green-500 bg-green-50">
      <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
    </div>
    <span
      className="text-sm font-medium capitalize"
      style={{ color: THEME.dark }}
    >
      {module.replace(/([A-Z])/g, " $1").trim()}
    </span>
  </div>
));
FeatureBadge.displayName = "FeatureBadge";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
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

// Memoized Chart Component - Department Distribution
const DepartmentChart = memo(({ data }) => {
  // Transform object data relative to department names
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      console.log("⚠️ No department data available");
      return [];
    }
    console.log("📊 Processing department data:", data);
    return Object.entries(data).map(([name, value]) => ({ 
      name, 
      value: Number(value) 
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
        <Building className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No department data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold" style={{ color: THEME.dark }}>Department Structure</h3>
          <p className="text-xs mt-1" style={{ color: THEME.muted }}>Employee distribution by department</p>
        </div>
        <div className="p-2 rounded-lg bg-primary-50">
          <Building className="w-5 h-5 text-primary-600" />
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px] ">
        <ResponsiveContainer width="100%" height="95%">
          <PieChart margin={{ bottom: 30 }}>
  <Pie
    data={chartData}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={100}
    paddingAngle={5}
    dataKey="value"
    label={({ name, percent }) =>
      `${name}: ${(percent * 100).toFixed(0)}%`
    }
  >
    {chartData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={THEME.charts[index % THEME.charts.length]}
      />
    ))}
  </Pie>

  <Tooltip
    contentStyle={{
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}
    itemStyle={{ color: THEME.darkText, fontWeight: 100 }}
  />

  <Legend
    verticalAlign="bottom"
    height={12}
    iconType="circle"
    wrapperStyle={{
      fontSize: '12px'
    }}
  />
</PieChart>

        </ResponsiveContainer>
      </div>
    </div>
  );
});
DepartmentChart.displayName = "DepartmentChart";

// Memoized Chart Component - Designation Distribution
const DesignationChart = memo(({ data }) => {
   // Transform object data relative to designation names
   const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      console.log("⚠️ No designation data available");
      return [];
    }
    console.log("📊 Processing designation data:", data);
    return Object.entries(data)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
      .slice(0, 8); // Top 8 designations
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
        <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No designation data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold" style={{ color: THEME.dark }}>Designation Overview</h3>
          <p className="text-xs mt-1" style={{ color: THEME.muted }}>Employees by top designations</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-50">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 12, fill: THEME.text }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
               cursor={{ fill: 'transparent' }}
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={THEME.charts[index % THEME.charts.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
DesignationChart.displayName = "DesignationChart";

/**
 * Organization Dashboard Component
 * Role-based dashboard for ORG_ADMIN, HR_STAFF, and EMPLOYEE
 * Modern design with AI-powered insights
 */
const OrgDashboard = () => {
  const user = useSelector(selectUser);
  const availableModules = useSelector(selectAvailableModules);

  // Organization modules state (like Sidebar.jsx)
  const [organizationModules, setOrganizationModules] = useState({
    moduleFaceRecognitionAttendanceMarking: false,
    moduleQrAttendanceMarking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false,
    moduleAiInsights: false
  });
  const [modulesLoading, setModulesLoading] = useState(true);

  // State management
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    monthlyPayrollTotal: 0,
    attendanceToday: 0,
    absentToday: 0,
    employeesOnLeave: 0,
    leaveBalance: {},
    checkedInToday: false,
    attendanceThisMonth: { present: 0, absent: 0 },
    employeesByDepartment: {}, // Added
    employeesByDesignation: {}, // Added
    features: {} // Added
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Chart navigation states for new attendance and growth charts
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Fetch organization modules (like Sidebar.jsx)
  useEffect(() => {
    const fetchModules = async () => {
      if ((user?.role === "HR_STAFF" || user?.role === "ORG_ADMIN") && user?.organizationUuid) {
        try {
          console.log("🔍 Fetching modules for organization:", user.organizationUuid);
          const response = await getOrganizationModules(user.organizationUuid);
          console.log("📦 Organization modules API response:", response);
          
          // Response structure from API: { success: true, data: [OrganizationModule array], message: "..." }
          const modulesArray = response.data || response; // Handle both wrapped and unwrapped responses
          console.log("📋 Modules array:", modulesArray);
          
          if (modulesArray && Array.isArray(modulesArray) && modulesArray.length > 0) {
            // Process the array of OrganizationModule objects
            const modules = {
              moduleFaceRecognitionAttendanceMarking: false,
              moduleQrAttendanceMarking: false,
              moduleEmployeeFeedback: false,
              moduleHiringManagement: false,
              moduleAiInsights: false
            };
            
            // Map each module based on moduleKey from ExtendedModule
            modulesArray.forEach(orgModule => {
              if (orgModule.isEnabled && orgModule.extendedModule) {
                const moduleKey = orgModule.extendedModule.moduleKey;
                console.log("✅ Enabled module found:", moduleKey, orgModule.extendedModule.name);
                
                if (moduleKey in modules) {
                  modules[moduleKey] = true;
                }
              }
            });
            
            console.log("✅ Processed modules:", modules);
            setOrganizationModules(modules);
          } else {
            console.log("⚠️ No organization modules found - organization may not have any extended modules enabled");
          }
        } catch (error) {
          console.error("❌ Error fetching organization modules:", error);
        } finally {
          setModulesLoading(false);
        }
      } else {
        console.log("⏭️ Skipping module fetch - role:", user?.role, "orgUuid:", user?.organizationUuid);
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, [user?.role, user?.organizationUuid]);

  // Load dashboard data with useCallback
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDashboardData();
      if (response.success) {
        console.log("📊 Dashboard data received:", response.data);
        console.log("📊 Employees by Department:", response.data.employeesByDepartment);
        console.log("📊 Employees by Designation:", response.data.employeesByDesignation);
        console.log("📊 Features:", response.data.features);
        
        setDashboardData((prev) => ({
          ...prev,
          ...response.data
        }));
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

  // Memoized refresh handler
  const handleRefresh = useCallback(
    () => loadDashboardData(),
    [loadDashboardData]
  );

  // Load monthly attendance data from API
  const loadMonthlyAttendanceData = useCallback(async (month) => {
    try {
      setChartsLoading(true);
      const currentYear = new Date().getFullYear();
      const response = await getMonthlyAttendanceChartData(currentYear, month + 1);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error loading attendance data:', error);
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
    if (user?.role === "ORG_ADMIN" || user?.role === "HR_STAFF") {
      loadMonthlyAttendanceData(currentMonth);
      loadYearlyGrowthData(currentYear);
    }
  }, [user?.role, loadMonthlyAttendanceData, loadYearlyGrowthData, currentMonth, currentYear]);

  // Memoized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Get role-specific stats cards with memoization
  const statsCards = useMemo(() => {
    const userRole = user?.role;

    if (userRole === "ORG_ADMIN") {
      return [
        {
          title: "Total Employees",
          value: dashboardData.totalEmployees?.toLocaleString() || "0",
          icon: Users,
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: `${dashboardData.activeEmployees || 0} Active`,
          changeType: "positive",
          trend: "+12%",
          link: "/org_admin/hrstaffmanagement"
        },
        {
          title: "Present Today",
          value: dashboardData.attendanceToday?.toLocaleString() || "0",
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: "#059669",
          change: `${dashboardData.absentToday || 0} Absent`,
          changeType: "positive",
          trend: "+0%",
          link: "/hr_staff/attendancemanagement"
        },
        {
          title: "On Leave Today",
          value: dashboardData.employeesOnLeave || 0,
          icon: Calendar,
          iconColor: "#F59E0B",
          iconColorDark: "#D97706",
          change: "Employees on Leave",
          changeType: "positive",
          trend: `${dashboardData.employeesOnLeave || 0} Today`,
          link: "/hr_staff/attendancemanagement"
        },
        {
          title: "Monthly Payroll",
          value: dashboardData.monthlyPayrollTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
          suffix: "LKR",
          icon: DollarSign,
          iconColor: THEME.secondary,
          iconColorDark: THEME.dark,
          change: "Total Cost (This Month)",
          link: "/org_admin/reports"
        }
      ];
    } else if (userRole === "HR_STAFF") {
      return [
        {
          title: "Total Employees",
          value: dashboardData.totalEmployees?.toLocaleString() || "0",
          icon: Users,
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: "In Organization",
          link: "/hr_staff/employeemanagement"
        },
        {
          title: "Attendance Today",
          value: dashboardData.attendanceToday?.toLocaleString() || "0",
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: "#059669",
          change: `${dashboardData.absentToday || 0} Absent`,
          link: "/hr_staff/attendancemanagement"
        },
        {
          title: "On Leave Today",
          value: dashboardData.employeesOnLeave || 0,
          icon: Calendar,
          iconColor: "#F59E0B",
          iconColorDark: "#D97706",
          change: "Employees on Leave",
          changeType: "positive",
          link: "/hr_staff/attendancemanagement"
        },
        {
          title: "Late Arrivals",
          value: dashboardData.lateArrivals || 0,
          icon: Clock,
          iconColor: "#EF4444",
          iconColorDark: "#DC2626",
          change: "Today",
          link: "/hr_staff/attendancemanagement"
        }
      ];
    } else {
      // EMPLOYEE
      return [
        {
          title: "Leave Balance",
          value: dashboardData.leaveBalance?.annual || 0,
          icon: Calendar,
          iconColor: THEME.primary,
          iconColorDark: THEME.secondary,
          change: "Days Available",
          link: "/employee/viewleaveandattendance"
        },
        {
          title: "Attendance",
          value: dashboardData.attendanceThisMonth?.present || 0,
          icon: UserCheck,
          iconColor: THEME.success,
          iconColorDark: "#059669",
          change: `${dashboardData.attendanceThisMonth?.absent || 0} Days Absent`,
          link: "/employee/viewleaveandattendance"
        },
        {
          title: "Pending Requests",
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          iconColor: "#F59E0B",
          iconColorDark: "#D97706",
          change: "Leave Requests",
          link: "/employee/viewleaveandattendance"
        },
        {
          title: "Pending Requests",
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          iconColor: "#F59E0B",
          iconColorDark: "#D97706",
          change: "Leave Requests",
          link: "/employee/leaverequest"
        },
        {
          title: "Checked In",
          value: dashboardData.checkedInToday ? "Yes" : "No",
          icon: CheckCircle,
          iconColor: dashboardData.checkedInToday ? THEME.success : "#EF4444",
          iconColorDark: dashboardData.checkedInToday ? "#059669" : "#DC2626",
          change: "Today",
          link: "/attendance/mark"
        }
      ];
    }
  }, [user?.role, dashboardData]);

  // Get role-specific quick actions with memoization
  const quickActions = useMemo(() => {
    const userRole = user?.role;

    if (userRole === "ORG_ADMIN" || userRole === "HR_STAFF") {
      const hrActions = [
        {
          icon: BarChart3,
          label: "Dashboard",
          link: "/hr_staff/dashboard",
          color: THEME.secondary,
        },
        {
          icon: Users,
          label: "Employee Management",
          link: "/hr_staff/employeemanagement",
          color: THEME.primary,
        },
        {
          icon: Calendar,
          label: "Leave Approval",
          link: "/hr_staff/leavemanagement",
          color: "#F59E0B",
        },
        {
            icon: Clock,
            label: "Monitor Attendance",
            link: "/hr_staff/attendancemanagement",
            color: THEME.success
        },
        {
          icon: CheckCircle,
          label: "Mark Attendance",
          link: "/hr_staff/attendancemarking",
          color: THEME.charts[3]
        },
        {
             icon: DollarSign,
             label: "Payslip Generation",
             link: "/hr_staff/payslips",
             color: THEME.secondary
        },
   
        {
            icon: Bell,
            label: "Notice Management",
            link: "/hr_staff/noticemanagement",
            color: THEME.charts[5]
        },
         {
             icon: MessageSquare,
             label: "Employee Feedbacks",
             link: "/hr_staff/employeefeedbacks",
             color: THEME.charts[6]
         },
        {
          icon: FileText,
          label: "HR Reports",
          link: "/hr_staff/hrreportingmanagement",
          color: THEME.dark,
        }
      ];

      // Module-based quick actions (conditional) - EXACT SAME LOGIC AS SIDEBAR
      console.log("🔍 Checking organization modules:", organizationModules);

      // Add Face Recognition Attendance if enabled
      if (organizationModules.moduleFaceRecognitionAttendanceMarking) {
        hrActions.push({
          icon: ScanFace,
          label: "Face Attendance",
          link: "/hr_staff/faceattendance",
          color: THEME.primary,
          moduleEnabled: true
        });
      }

      // Add QR Attendance if enabled
      if (organizationModules.moduleQrAttendanceMarking) {
        hrActions.push({
          icon: QrCode,
          label: "QR Attendance",
          link: "/hr_staff/qrattendance",
          color: "#0EA5E9",
          moduleEnabled: true
        });
      }

      // Add Employee Feedback if enabled
      if (organizationModules.moduleEmployeeFeedback) {
        hrActions.push({
          icon: MessageSquare,
          label: "Survey Management",
          link: "/hr_staff/feedbackmanagement",
          color: "#7C3AED",
          moduleEnabled: true
        });
      }

      // Add Hiring Management if enabled
      if (organizationModules.moduleHiringManagement) {
        hrActions.push({
          icon: UserPlus,
          label: "Hiring Management",
          link: "/hr_staff/hiringmanagement",
          color: "#EA580C",
          moduleEnabled: true
        });
      }

      console.log("📋 Total Quick Actions:", hrActions.length);
      return hrActions;
    } else {
      // EMPLOYEE
      return [
        {
          icon: Send,
          label: "Apply Leave",
          link: "/employee/leaverequest",
          color: THEME.primary,
          colorDark: THEME.secondary
        },
        {
          icon: CheckCircle,
          label: "Mark Attendance",
          link: "/attendance/mark",
          color: THEME.success,
          colorDark: "#059669"
        },
        {
          icon: FileText,
          label: "View Payslips",
          link: "/payroll/payslips",
          color: THEME.secondary,
          colorDark: THEME.dark
        },
        {
          icon: Users,
          label: "My Profile",
          link: "/employee/profile",
          color: "#8B5CF6",
          colorDark: "#7C3AED"
        }
      ];
    }
  }, [user?.role, organizationModules]);

  // Check if AI Insights should be shown - USE FETCHED MODULES
  const shouldShowAIInsights = useMemo(() => {
    // Only for ORG_ADMIN and HR_STAFF
    if (user?.role !== "ORG_ADMIN" && user?.role !== "HR_STAFF") {
      return false;
    }
    // Check if AI Insights module is enabled in organization_modules table
    console.log("🤖 AI Insights check:", organizationModules.moduleAiInsights);
    return organizationModules.moduleAiInsights === true;
  }, [user?.role, organizationModules]);

  // Memoized enabled modules
  const enabledModules = useMemo(
    () =>
      Object.entries(availableModules || {})
        .filter(([_, enabled]) => enabled)
        .map(([module]) => module),
    [availableModules]
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

  // User display name
  const displayName = useMemo(
    () => user?.firstName || user?.role?.replace("_", " ") || "User",
    [user?.firstName, user?.role]
  );

  // Loading state with skeleton
  if (isLoading && dashboardData.totalEmployees === 0) {
    return (
     
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
      
    );
  }

  return (
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: THEME.dark }}
              >
                Organization Overview
              </h2>
              <p className="mt-1" style={{ color: THEME.muted }}>
                Here's your dashboard overview for today
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
                style={{ backgroundColor: THEME.primary, color: "white" }}
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

        {/* Employee check-in reminder */}
        {user?.role === "EMPLOYEE" && !dashboardData.checkedInToday && (
          <div
            className="mb-6 p-4 rounded-xl border flex items-center gap-4"
            style={{ backgroundColor: "#FFFBEB", borderColor: "#FED7AA" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: "#92400E" }}>
                Don't forget to check in!
              </p>
              <p className="text-sm" style={{ color: "#B45309" }}>
                You haven't checked in today yet. Mark your attendance to track
                your working hours.
              </p>
            </div>
            <Link
              to="/employee/viewleaveandattendance"
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: "#F59E0B" }}
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
        
        {/* NEW: Attendance & Employee Growth Charts - Only for ORG_ADMIN and HR_STAFF */}
        {(user?.role === "ORG_ADMIN" || user?.role === "HR_STAFF") && (
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
        )}
        
        {/* Charts Section - Only for ORG_ADMIN and HR_STAFF */}
        {(user?.role === "ORG_ADMIN" || user?.role === "HR_STAFF") && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="h-[400px]">
                 <DepartmentChart data={dashboardData.employeesByDepartment} />
              </div>
              <div className="h-[400px]">
                 <DesignationChart data={dashboardData.employeesByDesignation} />
              </div>
           </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-3">
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
                <div
                  className={`grid gap-4 ${quickActions.length > 4 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"}`}
                >
                  {quickActions.map((action) => (
                    <QuickAction key={action.label} action={action} />
                  ))}
                </div>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    
  );
};

export default OrgDashboard;
