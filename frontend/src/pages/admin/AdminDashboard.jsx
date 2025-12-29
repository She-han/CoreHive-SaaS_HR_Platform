import React, { useEffect, useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

import { selectUser } from '../../store/slices/authSlice';
import { getPendingApprovals, getPlatformStatistics } from '../../api/adminApi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OrganizationReviewModal from '../../components/admin/OrganizationReviewModal';
import TomatoPriceChart from './components/TomatoPriceChart';

/**
 * System Admin Dashboard Component
 * Platform-level overview and quick actions
 */
const AdminDashboard = () => {
  const user = useSelector(selectUser);
  
  // State management
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    totalEmployees: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load platform statistics
      const statsResponse = await getPlatformStatistics();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      // Load pending approvals
      const approvalsResponse = await getPendingApprovals();
      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.data);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error(' Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Handle organization review
  const handleOrganizationReview = (organization) => {
    setSelectedOrganization(organization);
    setIsReviewModalOpen(true);
  };

  // Handle organization approval success
  const handleApprovalSuccess = () => {
    loadDashboardData(); // Refresh data after approval/rejection
  };

  // Close modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedOrganization(null);
  };

  // Statistics cards data
  const statCards = [
    {
      title: 'Total Organizations',
      value: stats.totalOrganizations,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+5 this month',
      changeType: 'positive'
    },
    {
      title: 'Active Organizations',
      value: stats.activeOrganizations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3 this week',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: 'Needs attention',
      changeType: 'warning'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees?.toLocaleString() || '0',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+45 this month',
      changeType: 'positive'
    }
  ];

  // Recent activities (mock data for now)
  const recentActivities = [
    {
      id: 1,
      type: 'approval',
      message: 'TechCorp Lanka registration approved',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'registration',
      message: 'New registration: Green Solutions Pvt Ltd',
      time: '4 hours ago',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'alert',
      message: 'System maintenance scheduled for weekend',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'text-orange-600'
    }
  ];

  const systemLoadData = [
  { time: '00:00', cpu: 45, memory: 62 },
  { time: '04:00', cpu: 32, memory: 58 },
  { time: '08:00', cpu: 78, memory: 75 },
  { time: '12:00', cpu: 85, memory: 82 },
  { time: '16:00', cpu: 72, memory: 71 },
  { time: '20:00', cpu: 55, memory: 65 },
];

const moduleUsageData = [
  { name: 'Employee', value: 108, color: '#0d9488' },
  { name: 'Payroll', value: 95, color: '#1e3a8a' },
  { name: 'Leave', value: 102, color: '#3b82f6' },
  { name: 'Attendance', value: 87, color: '#06b6d4' },
  { name: 'Performance', value: 64, color: '#8b5cf6' },
];

const tenantGrowthData = [
  { month: "Jan", tenants: 40, users: 120 },
  { month: "Feb", tenants: 55, users: 180 },
  { month: "Mar", tenants: 70, users: 260 },
  { month: "Apr", tenants: 90, users: 340 },
  { month: "May", tenants: 120, users: 420 },
];

  if (isLoading && stats.totalOrganizations === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner centerScreen size="lg" text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Administration">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-text-secondary mt-2">
                Monitor platform performance and tenant activity
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="text-sm text-text-secondary">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-#fifdf9 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg border-2 bg-white transition-shadow duration-200">
                <div className="flex items-center">                 
                  <div className="ml-4 p-2 flex-1">
                    <p className="text-sm mb-2 text-text-secondary">{stat.title}</p>
                    <p className="text-2xl mb-2 font-semi-bold text-text-primary">
                      {stat.value}
                    </p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'warning' ? 'text-yellow-600' : 'text-text-secondary'
                    }`}>
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            <Card title="Pending Organization Approvals" className="h-fit">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-text-secondary">No pending approvals</p>
                  <p className="text-sm text-text-secondary mt-2">
                    All organization registrations are up to date!
                  </p>
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
                          Registered {new Date(org.createdAt).toLocaleDateString()}
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
                        <Button variant="ghost" icon={ArrowRight} iconPosition="right">
                          View all {pendingApprovals.length} pending approvals
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>
            <div className="mt-8 w-[600px]">
              <TomatoPriceChart />
            </div>
          </div>

          {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Growth</CardTitle>
            <CardDescription>New tenants and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tenantGrowthData}>
                <defs>
                  <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="tenants" stroke="#0d9488" fillOpacity={1} fill="url(#colorTenants)" />
                <Area type="monotone" dataKey="users" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Load</CardTitle>
            <CardDescription>CPU and memory usage over 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#0d9488" strokeWidth={2} />
                <Line type="monotone" dataKey="memory" stroke="#1e3a8a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
              </div>
            </Card>

            {/* Recent Activities */}
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
        </div>

        {/* System Health */}
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
              </div>
            </div>
          </Card>
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