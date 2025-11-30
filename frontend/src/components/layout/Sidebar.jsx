import React, { useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LogOut } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { FiUsers, FiHeadphones } from "react-icons/fi";
import { TbDeviceAirpodsCase } from "react-icons/tb";
import { AiOutlineAudit } from "react-icons/ai";
import { MdQueryStats } from "react-icons/md";




const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // User initials for avatar
  const userInitials = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [user]);

  // User display name
  const displayName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.role?.replace('_', ' ') || 'User';
  }, [user]);

  // Handle logout
  const handleLogout = useCallback(() => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  // Role-based navigation configurations
  const getNavigationConfig = () => {
    switch (user?.role) {
      case 'SYS_ADMIN':
        return [
          {
            name: 'Dashboard',
            icon: HomeIcon,
            path: '/sys_admin/dashboard',
            current: location.pathname === '/sys_admin/dashboard'
          },
          {
            name: 'Organizations',
            icon: BuildingOfficeIcon,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations'),
            submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]
          },
          {
            name: 'Admin Approvals',
            icon: Cog6ToothIcon,
            path: '/sys_admin/approvals',
            current: location.pathname.startsWith('/sys_admin/approvals')
          },
          {
            name: 'Users',
            icon: FiUsers,
            path: '/sys_admin/users',
            current: location.pathname.startsWith('/sys_admin/users'),
            submenu: [
              { name: 'Registration Requests', path: '/sys_admin/requests/registration' },
              { name: 'Module Requests', path: '/sys_admin/requests/modules' },
              { name: 'Support Tickets', path: '/sys_admin/requests/support' }
            ]
          },
          {
            name: 'Billing & Plans',
            icon: TbDeviceAirpodsCase,
            path: '/sys_admin/billing',
            current: location.pathname.startsWith('/sys_admin/billing'),
            submenu: [
              { name: 'Usage Analytics', path: '/sys_admin/reports/usage' },
              { name: 'Performance', path: '/sys_admin/reports/performance' },
              { name: 'System Health', path: '/sys_admin/reports/health' }
            ]
          },
          {
            name: 'Audit Logs',
            icon: AiOutlineAudit,
            path: '/sys_admin/audits',
            current: location.pathname.startsWith('/sys_admin/audits')
          },
          {
            name: 'Support',
            icon: FiHeadphones,
            path: '/sys_admin/support',
            current: location.pathname.startsWith('/sys_admin/support')
          },
          {
            name: 'System Analytics',
            icon: MdQueryStats,
            path: '/sys_admin/analytics',
            current: location.pathname.startsWith('/sys_admin/analytics')
          },
          {
            name: 'Settings',
            icon: Cog6ToothIcon,
            path: '/sys_admin/settings',
            current: location.pathname.startsWith('/sys_admin/settings')
          }
        ];

      case 'ORG_ADMIN':
        return [
          {
            name: 'Dashboard',
            icon: HomeIcon,
            path: '/org_admin/dashboard',
            current: location.pathname === '/org_admin/dashboard'
          },
          {
            name: 'HR Staff Management',
            icon: UsersIcon,
            path: '/org_admin/hrstaffmanagement',
            current: location.pathname.startsWith('/org_admin/hrstaffmanagement')
          },
          {
            name: 'Department Management',
            icon: UsersIcon,
            path: '/org_admin/departmentmanagement',
            current: location.pathname.startsWith('/org_admin/departmentmanagement')
          },
          {
            name: 'Module Configuration',
            icon: UsersIcon,
            path: '/org_admin/modules',
            current: location.pathname.startsWith('/org_admin/modules')
          },
          {
            name: 'Reports & Analytics',
            icon: ChartBarIcon,
            path: '/org_admin/reports',
            current: location.pathname.startsWith('/org_admin/reports')
          },
          {
            name: 'Organization Settings',
            icon: Cog6ToothIcon,
            path: '/org_admin/settings',
            current: location.pathname.startsWith('/org_admin/settings')
          }
        ];

      case 'HR_STAFF':
        return [
          {
            name: 'Dashboard',
            icon: HomeIcon,
            path: '/hr_staff/dashboard',
            current: location.pathname === '/hr_staff/dashboard'
          },
          {
            name: 'Employee Management',
            icon: UsersIcon,
            path: '/hr_staff/employeemanagement',
            current: location.pathname.startsWith('/hr_staff/employeemanagement')
          },
          {
            name: 'Leave Management',
            icon: CalendarDaysIcon,
            path: '/hr_staff/leavemanagement',
            current: location.pathname.startsWith('/hr_staff/leavemanagement')
          },
          {
            name: 'Attendance Management',
            icon: ClockIcon,
            path: '/hr_staff/attendancemanagement',
            current: location.pathname.startsWith('/hr_staff/attendancemanagement')
          },
          {
            name: 'HR Reports',
            icon: ChartBarIcon,
            path: '/hr_staff/reports',
            current: location.pathname.startsWith('/hr_staff/reports')
          }
        ];

      case 'EMPLOYEE':
        return [
          {
            name: 'My Profile',
            icon: UserIcon,
            path: '/employee/profile',
            current: location.pathname === '/employee/profile'
          },
          {
            name: 'My Leaves',
            icon: CalendarDaysIcon,
            path: '/employee/viewleaves',
            current: location.pathname.startsWith('/employee/viewleaves')
          },
          {
            name: 'My Attendance',
            icon: ClockIcon,
            path: '/employee/viewattendance',
            current: location.pathname.startsWith('/employee/viewattendance')
          },
          {
            name: 'My Payslips',
            icon: EyeIcon,
            path: '/employee/viewpayslips',
            current: location.pathname.startsWith('/employee/viewpayslips')
          }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationConfig();

  const renderMenuItem = (item) => {
    return (
      <div key={item.name} className="mb-1">
        <Link
          to={item.path}
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={item.current 
            ? { 
                backgroundColor: '#F1FDF9', 
                color: '#02C39A', 
                borderRight: '3px solid #02C39A'
              } 
            : { 
                color: '#333333'
              }
          }
          onMouseEnter={(e) => {
            if (!item.current) {
              e.currentTarget.style.backgroundColor = '#F1FDF9';
              e.currentTarget.style.color = '#05668D';
            }
          }}
          onMouseLeave={(e) => {
            if (!item.current) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#333333';
            }
          }}
        >
          <item.icon
            className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'} shrink-0`}
            style={{ color: item.current ? '#02C39A' : '#05668D' }}
            aria-hidden="true"
          />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </div>
    );
  };

  return (
    <div 
      className={`shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div 
          className="flex  h-16 px-4"
          style={{ borderBottom: '2px solid #02C39A' }}
        >
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #02C39A 0%, #05668D 100%)' }}
                >
                  <span className="text-white font-bold text-sm">CH</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold" style={{ color: '#0C397A' }}>CoreHive</p>
                <p className="text-xs capitalize" style={{ color: '#9B9B9B' }}>
                  {user?.role?.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center mt-4 shadow-md"
              style={{ background: 'linear-gradient(135deg, #02C39A 0%, #05668D 100%)' }}
            >
              <span className="text-white font-bold text-sm">CH</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map(renderMenuItem)}
        </div>

        {/* Footer - Profile & Logout */}
        <div 
          className="p-3" 
          style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#FAFFFE' }}
        >
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* Profile Section */}
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ backgroundColor: '#F1FDF9' }}>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0"
                  style={{ background: 'linear-gradient(135deg, #02C39A 0%, #05668D 100%)' }}
                >
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p 
                    className="text-sm font-medium truncate" 
                    style={{ color: '#333333' }}
                  >
                    {displayName}
                  </p>
                  <p 
                    className="text-xs truncate" 
                    style={{ color: '#9B9B9B' }}
                  >
                    {user?.email || 'user@corehive.com'}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#0C397A', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#05668D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0C397A'}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* Collapsed Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #02C39A 0%, #05668D 100%)' }}
              >
                {userInitials}
              </div>
              
              {/* Collapsed Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#0C397A', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#05668D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0C397A'}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
