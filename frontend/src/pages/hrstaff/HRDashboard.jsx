import React, { useEffect, useState, memo } from 'react';
import { Users, UserCheck, UserX, ArrowRight, Zap, TrendingUp, PieChart, Briefcase, Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTotalEmployeesCount , getTotalActiveEmployeesCount } from '../../api/employeeApi.js';
import { getTotalOnLeaveCount } from '../../api/manualAttendanceService.js';

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

// Memoized Stat Card Component matching OrgDashboard style
const StatCard = memo(({ title, value, icon: IconComponent, color, trend }) => {
  return (
    <div className="group block h-full">
      <div 
        className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-opacity-100 h-full overflow-hidden transform hover:-translate-y-1"
        style={{ borderColor: `${color}20` }}
      >
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />
        <div 
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm group-hover:scale-110 transition-all duration-300"
              style={{ borderColor: color, backgroundColor: `${color}22` }}
            >
              {IconComponent}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: THEME.muted }}>
              {title}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold" style={{ color: THEME.dark }}>
                {value}
              </p>
            </div>
            <p className="text-xs" style={{ color: THEME.muted }}>
              {trend}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
StatCard.displayName = 'StatCard';

function HRDashboard() {

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);
  const [totalOnLeaveEmployees, setTotalOnLeaveEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      getTotalEmployeesCount().then(setTotalEmployees),
      getTotalActiveEmployeesCount().then(setTotalActiveEmployees),
      getTotalOnLeaveCount().then(setTotalOnLeaveEmployees)
    ]).finally(() => {
      setLoading(false);
      setLastRefresh(new Date());
    });
  };

  const formattedLastRefresh = lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const count = await getTotalEmployeesCount();
        setTotalEmployees(count);
      } catch (error) {
        console.error('Error fetching total employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalEmployees();
  }, []);

  useEffect(() => {
    const fetchTotalActiveEmployees = async () => {
      try {
        const count = await getTotalActiveEmployeesCount();
        setTotalActiveEmployees(count);
      } catch (error) {
        console.error('Error fetching total active employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalActiveEmployees();
  }, []);

  useEffect(() => {
    const fetchTotalOnLeaveEmployees = async () => {
      try {
        const count = await getTotalOnLeaveCount();
        setTotalOnLeaveEmployees(count);
      } catch (error) {
        console.error('Error fetching total on-leave employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalOnLeaveEmployees();
  }, []);

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
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: THEME.muted }}>
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
              <Link 
                to="/hr_staff/employeemanagement" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:shadow-md"
                style={{ backgroundColor: THEME.dark, color: 'white' }}
              >
                <span className="hidden sm:inline">Manage Workforce</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <StatCard
            title="Total Workforce"
            value={loading ? "..." : totalEmployees}
            icon={<Users size={22} style={{ color: '#0C397A' }} strokeWidth={2.25} />}
            color="#0C397A"
            trend="Organization Headcount"
          />

          <StatCard
            title="Active Personnel"
            value={loading ? "..." : totalActiveEmployees}
            icon={<UserCheck size={22} style={{ color: '#05668D' }} strokeWidth={2.25} />}
            color="#05668D"
            trend="Current Headcount"
          />
          <StatCard
            title="On Leave"
            value={loading ? "..." : totalOnLeaveEmployees}
            icon={<UserX size={22} style={{ color: '#1ED292' }} strokeWidth={2.25} />}
            color="#1ED292"
            trend="Today on Leave"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* QUICK OPERATIONS - 7 Columns */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: THEME.background }}
                >
                  <Zap className="w-5 h-5" style={{ color: THEME.primary }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: THEME.dark }}>Essential Operations</h2>
                  <p className="text-xs" style={{ color: THEME.muted }}>Instant Access</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Leave Requests', count: '12', color: '#0C397A', sub: 'Pending Review' },
                { label: 'Payroll Status', count: 'Finalized', color: '#02C39A', sub: 'Dec 2025' },
                { label: 'Performance', count: '88%', color: '#05668D', sub: 'Avg Score' },
                { label: 'Feedback', count: '05', color: '#1ED292', sub: 'Unread' },
                { label: 'Departments', count: '08', color: '#9B9B9B', sub: 'Functional' },
                { label: 'Reports', count: 'Export', color: '#333333', sub: 'Data Analytics' }
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-start p-5 rounded-2xl bg-[#F1FDF9]/30 border border-transparent hover:border-[#02C39A] hover:bg-white hover:shadow-lg transition-all group text-left">
                  <span className="text-[9px] font-black uppercase text-[#9B9B9B] group-hover:text-[#02C39A] mb-1">{item.label}</span>
                  <span className="text-xl font-bold text-[#0C397A]">{item.count}</span>
                  <span className="text-[10px] text-[#9B9B9B] mt-1 italic">{item.sub}</span>
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* ACTIVITY FEED - 4 Columns */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#EEF2FF' }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: THEME.secondary }} />
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: THEME.dark }}>Audit Log</h2>
                <p className="text-xs" style={{ color: THEME.muted }}>Recent activity</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-gray-100">
              {[
                { user: 'Sahan Fernando', action: 'New Hire Onboarded', time: '2h ago', icon: <Users size={12}/>, color: '#02C39A' },
                { user: 'Eleanor Pena', action: 'Leave Approval', time: '5h ago', icon: <Briefcase size={12}/>, color: '#05668D' },
                { user: 'Payroll System', action: 'Stubs Generated', time: 'Yesterday', icon: <Zap size={12}/>, color: '#0C397A' }
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-5 items-start relative z-10">
                  <div className="p-2 rounded-full bg-white border border-gray-100 text-gray-400 shadow-sm" style={{ color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#333333] leading-none">{activity.user}</p>
                    <p className="text-xs text-[#9B9B9B] mt-1">{activity.action}</p>
                    <span className="inline-block text-[9px] font-bold text-[#02C39A] bg-[#F1FDF9] px-2 py-0.5 rounded mt-2">{activity.time}</span>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

}

export default HRDashboard;