import React, { useEffect, useState, memo } from 'react';
import { Users, UserCheck, UserX, ArrowRight, Zap, TrendingUp, PieChart, Briefcase, Clock, RefreshCw, ClipboardCheck, UserPlus, Bell, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = user?.token;

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);
  const [totalOnLeaveEmployees, setTotalOnLeaveEmployees] = useState(0);
  const [totalPresentEmployees, setTotalPresentEmployees] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [today] = useState(new Date());

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
      const data = await getAttendanceSummary(selectedDate, token);
      console.log("SUMMARY API DATA:", data); // 👈 ADD THIS
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      getTotalEmployeesCount().then(setTotalEmployees),
      getTotalActiveEmployeesCount().then(setTotalActiveEmployees),
      getTotalOnLeaveCount().then((count) => {
        setTotalOnLeaveEmployees(count);
        return count;
      }),
      getAllLeaveRequests(token).then((data) => {
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
    }).finally(() => {
      setLoading(false);
      setLastRefresh(new Date());
    });
  };

  const formattedLastRefresh = lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    handleRefresh();
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
            title="Present Today"
            value={loading ? "..." : summary.PRESENT}
            icon={<CheckCircle size={22} style={{ color: '#1ED292' }} strokeWidth={2.25} />}
            color="#1ED292"
            trend="At Work Today"
          />
        </div>

        {/* Quick Action Cards - subtle enterprise styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
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
          ].map((card) => (
            <button
              key={card.label}
              onClick={card.action}
              className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="absolute inset-0 rounded-2xl bg-[#02C39A] opacity-10 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A] group-hover:border-[#16f3c3a7] transition-colors">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0C397A] group-hover:text-[#F1FDF9] transition-colors">{card.label}</h3>
                  <p className="text-sm group-hover:text-[#F1FDF9] transition-colors">{card.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Two Section Layout - Leave Requests & Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          
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
                  {leaveRequests.map((request, idx) => (
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
                      <div className="flex items-center gap-4 text-xs text-[#475467] mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Latest Unread Feedbacks */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
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

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* QUICK OPERATIONS - 7 Columns - Subtle styling */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A]"
                >
                  <Zap className="w-5 h-5 text-[#05668D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0C397A]">Essential Operations</h2>
                  <p className="text-xs text-[#667085]">Instant Access</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Leave Requests', count: leaveRequests.length || '0', color: '#0C397A' , sub: 'Pending Review' },
                { label: 'Payroll Status', count: 'Ready', color: '#02C39A', sub: 'Jan 2026' },
                { label: 'Performance', count: '88%', color: '#05668D', sub: 'Avg Score' },
                { label: 'Feedback', count: feedbacks.length || '0', color: '#1ED292', sub: 'Unread' },
                { label: 'Departments', count: '08', color: '#9B9B9B', sub: 'Functional' },
                { label: 'Reports', count: 'Export', color: '#333333', sub: 'Data Analytics' }
              ].map((item) => (
                <button 
                  key={item.label} 
                  className="group relative flex flex-col items-start p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#02C39A40] hover:shadow-sm transition-all"
                >
                  <span className="text-[9px] font-black uppercase text-[#98A2B3] group-hover:text-[#0C397A] mb-2 transition-colors">
                    {item.label}
                  </span>
                  <span className="text-2xl font-bold text-[#0F172A] group-hover:scale-105 transition-transform">{item.count}</span>
                  <span className="text-[10px] text-[#667085] mt-1 italic">{item.sub}</span>
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: item.color, opacity: 0.7 }} />
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* ACTIVITY FEED - 4 Columns - Subtle styling */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1FDF9] border border-[#02C39A1A]"
              >
                <TrendingUp className="w-5 h-5 text-[#0C397A]" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-semibold text-[#0C397A]">Audit Log</h2>
                <p className="text-xs text-[#667085]">Recent activity</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-[#E5E7EB]">
              {[
                { user: 'Sahan Fernando', action: 'New Hire Onboarded', time: '2h ago', icon: <Users size={12}/>, color: '#02C39A' },
                { user: 'Eleanor Pena', action: 'Leave Approval', time: '5h ago', icon: <Briefcase size={12}/>, color: '#05668D' },
                { user: 'Payroll System', action: 'Stubs Generated', time: 'Yesterday', icon: <Zap size={12}/>, color: '#0C397A' }
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-5 items-start relative z-10">
                  <div className="p-2.5 rounded-xl bg-[#F1FDF9] border border-[#02C39A1A] text-[#0C397A]">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] leading-none">{activity.user}</p>
                    <p className="text-xs text-[#667085] mt-1">{activity.action}</p>
                    <span className="inline-block text-[9px] font-bold text-white px-2.5 py-1 rounded-full mt-2 shadow-sm" style={{ backgroundColor: activity.color }}>
                      {activity.time}
                    </span>
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
