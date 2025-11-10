import React, { useEffect, useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

import { selectUser, selectAvailableModules } from '../../store/slices/authSlice';
import { apiGet } from '../../api/axios';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

/**
 * Organization Dashboard Component
 * Role-based dashboard for ORG_ADMIN, HR_STAFF, and EMPLOYEE
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
    checkedInToday: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiGet('/dashboard');
      if (response.success) {
        setDashboardData(response.data);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Get role-specific stats cards
  const getStatsCards = () => {
    const userRole = user?.role;
    
    if (userRole === 'ORG_ADMIN') {
      return [
        {
          title: 'Total Employees',
          value: dashboardData.totalEmployees,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          change: '+3 this month',
          link: '/employees'
        },
        {
          title: 'Monthly Payroll',
          value: `LKR ${dashboardData.monthlyPayrollTotal?.toLocaleString() || '0'}`,
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          change: 'Current month',
          link: '/payroll'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests,
          icon: Calendar,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          change: 'Pending approval',
          link: '/leaves/pending'
        },
        {
          title: 'Today\'s Attendance',
          value: `${dashboardData.attendanceToday}/${dashboardData.totalEmployees}`,
          icon: Clock,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          change: `${dashboardData.absentToday} absent`,
          link: '/attendance'
        }
      ];
    } else if (userRole === 'HR_STAFF') {
      return [
        {
          title: 'Active Employees',
          value: dashboardData.activeEmployees,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          change: 'Currently active',
          link: '/employees'
        },
        {
          title: 'Leave Requests',
          value: dashboardData.pendingLeaveRequests,
          icon: Calendar,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          change: 'Needs review',
          link: '/leaves/pending'
        },
        {
          title: 'Present Today',
          value: dashboardData.attendanceToday,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          change: 'Checked in',
          link: '/attendance'
        },
        {
          title: 'Absent Today',
          value: dashboardData.absentToday,
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          change: 'Need follow-up',
          link: '/attendance'
        }
      ];
    } else { // EMPLOYEE
      return [
        {
          title: 'Annual Leave',
          value: `${dashboardData.leaveBalance?.annual || 0} days`,
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          change: 'Remaining',
          link: '/leaves/balance'
        },
        {
          title: 'Sick Leave',
          value: `${dashboardData.leaveBalance?.sick || 0} days`,
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          change: 'Available',
          link: '/leaves/balance'
        },
        {
          title: 'This Month Attendance',
          value: `${dashboardData.attendanceThisMonth?.present || 0} days`,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          change: `${dashboardData.attendanceThisMonth?.absent || 0} absent`,
          link: '/attendance/my'
        },
        {
          title: 'Pending Requests',
          value: dashboardData.pendingLeaveRequests || 0,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          change: 'Leave requests',
          link: '/leaves/my'
        }
      ];
    }
  };

  // Get role-specific quick actions
  const getQuickActions = () => {
    const userRole = user?.role;
    
    if (userRole === 'ORG_ADMIN') {
      return [
        { icon: UserPlus, label: 'Add Employee', link: '/employees/add', color: 'text-blue-600' },
        { icon: DollarSign, label: 'Process Payroll', link: '/payroll/process', color: 'text-green-600' },
        { icon: Calendar, label: 'Review Leaves', link: '/leaves/pending', color: 'text-orange-600' },
        { icon: BarChart3, label: 'View Reports', link: '/reports', color: 'text-purple-600' },
        { icon: Clock, label: 'Attendance', link: '/attendance', color: 'text-indigo-600' },
        { icon: FileText, label: 'Settings', link: '/settings', color: 'text-gray-600' }
      ];
    } else if (userRole === 'HR_STAFF') {
      return [
        { icon: Calendar, label: 'Review Leaves', link: '/leaves/pending', color: 'text-orange-600' },
        { icon: UserPlus, label: 'Add Employee', link: '/employees/add', color: 'text-blue-600' },
        { icon: Clock, label: 'Mark Attendance', link: '/attendance/mark', color: 'text-green-600' },
        { icon: BarChart3, label: 'Generate Reports', link: '/reports', color: 'text-purple-600' }
      ];
    } else { // EMPLOYEE
      return [
        { icon: Calendar, label: 'Apply for Leave', link: '/leaves/apply', color: 'text-orange-600' },
        { icon: Clock, label: 'Mark Attendance', link: '/attendance/mark', color: 'text-green-600' },
        { icon: FileText, label: 'View Payslips', link: '/payroll/payslips', color: 'text-blue-600' },
        { icon: Users, label: 'Update Profile', link: '/profile', color: 'text-purple-600' }
      ];
    }
  };

  const statsCards = getStatsCards();
  const quickActions = getQuickActions();

  if (isLoading && dashboardData.totalEmployees === 0) {
    return (
      <div className="min-h-screen bg-background-primary">
        <LoadingSpinner centerScreen size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-text-secondary mt-2">
                {user?.organizationName} • {user?.role?.replace('_', ' ')}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="text-sm text-text-secondary">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                loading={isLoading}
                icon={RefreshCw}
              >
                Refresh
              </Button>
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

        {/* Employee check-in reminder */}
        {user?.role === 'EMPLOYEE' && !dashboardData.checkedInToday && (
          <Alert 
            type="info" 
            title="Don't forget to check in!"
            message="You haven't checked in today yet. Mark your attendance to track your working hours."
            className="mb-6"
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} to={stat.link}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <p className="text-sm text-text-secondary">{stat.title}</p>
                      <p className="text-2xl font-bold text-text-primary">
                        {stat.value}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {stat.change}
                      </p>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card title="Quick Actions">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.link}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group cursor-pointer">
                        <Icon className={`w-8 h-8 ${action.color} mb-3 group-hover:scale-110 transition-transform`} />
                        <p className="text-sm font-medium text-text-primary group-hover:text-primary-600">
                          {action.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Available Modules */}
          <div>
            <Card title="Available Features">
              <div className="space-y-3">
                {Object.entries(availableModules)
                  .filter(([_, enabled]) => enabled)
                  .map(([module, _]) => (
                    <div key={module} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-text-primary capitalize">
                        {module.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))
                }
              </div>
              
              {user?.role === 'ORG_ADMIN' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link to="/settings/modules">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Features
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;