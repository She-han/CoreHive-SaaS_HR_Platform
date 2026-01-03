import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { LogOut , CheckSquare } from 'lucide-react';
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  UserIcon,
  EyeIcon,
  BellIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { FiUsers, FiHeadphones } from 'react-icons/fi';
import { TbDeviceAirpodsCase } from 'react-icons/tb';
import { AiOutlineAudit } from 'react-icons/ai';
import { MdQueryStats } from 'react-icons/md';
import { 
  ScanFace, 
  QrCode, 
  MessageSquare, 
  UserPlus,
  Briefcase,
  DollarSign
} from 'lucide-react';
import * as moduleApi from '../../api/moduleApi';

const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Module states
  const [organizationModules, setOrganizationModules] = useState({
    moduleFaceRecognitionAttendanceMarking: false,
    moduleQrAttendanceMarking: false,
    moduleEmployeeFeedback: false,
    moduleHiringManagement: false
  });
  const [modulesLoading, setModulesLoading] = useState(true);

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

  // Fetch organization modules for HR_STAFF
  useEffect(() => {
    const fetchModules = async () => {
      if (user?.role === 'HR_STAFF' || user?.role === 'ORG_ADMIN') {
        try {
          setModulesLoading(true);
          const response = await moduleApi.getOrganizationModules();
          if (response.success && response.data) {
            setOrganizationModules({
              moduleFaceRecognitionAttendanceMarking: response.data.moduleFaceRecognitionAttendanceMarking || false,
              moduleQrAttendanceMarking: response.data.moduleQrAttendanceMarking || false,
              moduleEmployeeFeedback: response.data.moduleEmployeeFeedback || false,
              moduleHiringManagement: response.data.moduleHiringManagement || false
            });
          }
        } catch (error) {
          console.error('Error fetching organization modules:', error);
        } finally {
          setModulesLoading(false);
        }
      } else {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, [user?.role]);

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
            current: location.pathname.startsWith('/sys_admin/organizations')
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
            current: location.pathname.startsWith('/sys_admin/users')
          },
          {
            name: 'Billing & Plans',
            icon: TbDeviceAirpodsCase,
            path: '/sys_admin/billing',
            current: location.pathname.startsWith('/sys_admin/billing')
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
            icon: BuildingOfficeIcon,
            path: '/org_admin/departmentmanagement',
            current: location.pathname.startsWith('/org_admin/departmentmanagement')
          },
          {
            name: 'Designation Management',
            icon: Briefcase,
            path: '/org_admin/designationmanagement',
            current: location.pathname.startsWith('/org_admin/designationmanagement')
          },
          {
            name: 'Module Configuration',
            icon: Cog6ToothIcon,
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
        // Base navigation items (always visible)
        const baseNavigation = [
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
          }
          ,
          {
            name: 'Attendance Marking',
            icon: CheckSquare,
            path: '/hr_staff/attendancemarking',
            current: location.pathname.startsWith('/hr_staff/attendancemarking')
          } ,
          {
            name: 'Payroll Management',
            icon: DollarSign,
            path: '/hr_staff/payrollmanagement',
            current: location.pathname.startsWith('/hr_staff/payrollmanagement')
          },
          {
            name: 'HR Reports',
            icon: ChartBarIcon,
            path: '/hr_staff/hrreportingmanagement',
            current: location.pathname.startsWith('/hr_staff/hrreportingmanagement')
          }

        ];

        // Module-based navigation items (conditional)
        const moduleNavigation = [];

        // Add Face Recognition Attendance if enabled
        if (organizationModules.moduleFaceRecognitionAttendanceMarking) {
          moduleNavigation.push({
            name: 'Face Attendance',
            icon: ScanFace,
            path: '/hr_staff/faceattendance',
            current: location.pathname.startsWith('/hr_staff/faceattendance'),
            moduleEnabled: true
          });
        }

        // Add QR Attendance if enabled
        if (organizationModules.moduleQrAttendanceMarking) {
          moduleNavigation.push({
            name: 'QR Attendance',
            icon: QrCode,
            path: '/hr_staff/qrattendance',
            current: location.pathname.startsWith('/hr_staff/qrattendance'),
            moduleEnabled: true
          });
        }

        // Add Employee Feedback if enabled
        if (organizationModules.moduleEmployeeFeedback) {
          moduleNavigation.push({
            name: 'Feedback Management',
            icon: MessageSquare,
            path: '/hr_staff/feedbackmanagement',
            current: location.pathname.startsWith('/hr_staff/feedbackmanagement'),
            moduleEnabled: true
          });
        }

        // Add Hiring Management if enabled
        if (organizationModules.moduleHiringManagement) {
          moduleNavigation.push({
            name: 'Hiring Management',
            icon: UserPlus,
            path: '/hr_staff/hiringmanagement',
            current: location.pathname.startsWith('/hr_staff/hiringmanagement'),
            moduleEnabled: true
          });
        }

        // Combine base and module navigation
        return [...baseNavigation, ...moduleNavigation];

      case 'EMPLOYEE':
        return [
          {
            name: 'My Profile',
            icon: UserIcon,
            path: '/employee/profile',
            current: location.pathname === '/employee/profile' || location.pathname.startsWith('/employee/profile/edit')
          },
          {
            name: 'Leave & Attendance',
            icon: CalendarDaysIcon,
            path: '/employee/viewleaveandattendance',
            current: location.pathname.startsWith('/employee/viewleaveandattendance')
          },
          {
            name: 'Leave Request',
            icon: ClockIcon,
            path: '/employee/leaverequest',
            current: location.pathname.startsWith('/employee/leaverequest')
          },
          {
            name: 'Feedback',
            icon: MessageSquare,
            path: '/employee/feedback',
            current: location.pathname.startsWith('/employee/feedback')
          },
          {
            name: 'Notices',
            icon: BellIcon,
            path: '/employee/notices',
            current: location.pathname.startsWith('/employee/notices')
          },
          {
            name: 'My Payslips',
            icon: DocumentTextIcon,
            path: '/employee/payslips',
            current: location.pathname.startsWith('/employee/payslips')
          }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationConfig();

  const renderMenuItem = (item) => {
    const handleMenuClick = (e) => {
      // Prevent event bubbling that might trigger sidebar expansion
      e.stopPropagation();
    };

    return (
      <div key={item.name} className="mb-1">
        <Link
          to={item.path}
          onClick={handleMenuClick}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            item.moduleEnabled ? 'relative' : ''
          }`}
          style={item.current 
            ? { 
                backgroundColor: 'transparent',
                color: '#02C39A',
                borderLeft: '2px solid #02C39A',
                borderRight: '1px solid #02C39A',
                borderTop: '1px solid #02C39A',
                borderBottom: '1px solid #02C39A',
                boxShadow: '0 0 0 1px rgba(2, 195, 154, 0.1) inset'
              } 
            : { 
                color: '#333333',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '1px solid transparent',
                borderBottom: '1px solid transparent'
              }
          }
          onMouseEnter={(e) => {
            if (!item.current) {
              e.currentTarget.style.backgroundColor = '#F1FDF9';
              e.currentTarget.style.color = '#05668D';
              e.currentTarget.style.borderLeftColor = '#E0F5F0';
            }
          }}
          onMouseLeave={(e) => {
            if (!item.current) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#333333';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }
          }}
        >
          <item.icon
            className={`${isCollapsed ? 'h-5 w-5 ' : 'h-5 w-5 mr-3'} shrink-0 transition-all duration-200`}
            style={{ 
              color: item.current ? '#02C39A' : '#05668D'
            }}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="flex-1 font-medium">{item.name}</span>
          )}
          {!isCollapsed && item.moduleEnabled && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
              EXT
            </span>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div 
      className={`shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div 
          className="flex h-16 px-4"
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
          {modulesLoading && user?.role === 'HR_STAFF' ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            navigationItems.map(renderMenuItem)
          )}
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