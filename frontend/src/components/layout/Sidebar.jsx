import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import { FaRegChartBar } from "react-icons/fa";
import { FiUsers, FiHeadphones  } from "react-icons/fi";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { VscGraphLine } from "react-icons/vsc";





const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Role-based navigation configurations
  const getNavigationConfig = () => {
    switch (user?.role) {
      case 'SYS_ADMIN':
        return [
          {
            name: 'Dashboard',
            icon: FaRegChartBar,
            path: '/sys_admin/dashboard',
            current: location.pathname === '/sys_admin/dashboard'
          },
          {
            name: 'Organizations',
            icon: BuildingOfficeIcon,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          {
            name: 'Users',
            icon: FiUsers,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          {
            name: 'Billing & Plans',
            icon: LiaMoneyBillSolid,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          {
            name: 'Audit Logs',
            icon: HiOutlineDocumentReport,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          {
            name: 'Support',
            icon: FiHeadphones ,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          {
            name: 'Syatem Analytics',
            icon: VscGraphLine,
            path: '/sys_admin/organizations',
            current: location.pathname.startsWith('/sys_admin/organizations')
            /*submenu: [
              { name: 'All Organizations', path: '/sys_admin/organizations' },
              { name: 'Add Organization', path: '/sys_admin/organizations/add' },
              { name: 'Pending Requests', path: '/sys_admin/organizations/pending' }
            ]*/
          },
          /*
          {
            name: 'System Requests',
            icon: DocumentTextIcon,
            path: '/sys_admin/requests',
            current: location.pathname.startsWith('/sys_admin/requests'),
            submenu: [
              { name: 'Registration Requests', path: '/sys_admin/requests/registration' },
              { name: 'Module Requests', path: '/sys_admin/requests/modules' },
              { name: 'Support Tickets', path: '/sys_admin/requests/support' }
            ]
          },
          {
            name: 'System Reports',
            icon: ChartBarIcon,
            path: '/sys_admin/reports',
            current: location.pathname.startsWith('/sys_admin/reports'),
            submenu: [
              { name: 'Usage Analytics', path: '/sys_admin/reports/usage' },
              { name: 'Performance', path: '/sys_admin/reports/performance' },
              { name: 'System Health', path: '/sys_admin/reports/health' }
            ]
          },*/
          {
            name: 'System Settings',
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
            name: 'Employee Management',
            icon: UsersIcon,
            path: '/org_admin/employeemanagement',
            current: location.pathname.startsWith('/org_admin/employeemanagement')
          },
          {
            name: 'Leave Management',
            icon: CalendarDaysIcon,
            path: '/org_admin/leavemanagement',
            current: location.pathname.startsWith('/org_admin/leavemanagement')
          },
          {
            name: 'Attendance Management',
            icon: ClockIcon,
            path: '/org_admin/attendancemanagement',
            current: location.pathname.startsWith('/org_admin/attendancemanagement')
          },
          {
            name: 'Payroll Management',
            icon: CurrencyDollarIcon,
            path: '/org_admin/payroll',
            current: location.pathname.startsWith('/org_admin/payroll')
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
        {hasSubmenu ? (
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              item.current
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'} shrink-0`}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </>
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center px-3 py-3 text-[15px] font-medium rounded-lg transition-colors duration-200 ${
              item.current
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'} shrink-0`}
              aria-hidden="true"
            />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )}

        {/* Submenu */}
        {hasSubmenu && isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-1 space-y-1"
          >
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.name}
                to={subItem.path}
                className={`block px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                  location.pathname === subItem.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {subItem.name}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CH</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">CoreHive</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map(renderMenuItem)}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;