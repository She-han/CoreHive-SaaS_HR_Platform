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
                Platform Administrator Dashboard
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-text-secondary">{stat.title}</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'warning' ? 'text-yellow-600' : 'text-text-secondary'
                    }`}>
                      {stat.change}
                    </p>
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
          </div>

          {/* Quick Actions & Recent Activities */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Link to="/admin/approvals" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Review Approvals
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link to="/admin/organizations" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      All Organizations
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link to="/admin/reports" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Platform Reports
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link to="/admin/settings" className="block">
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