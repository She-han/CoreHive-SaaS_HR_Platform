import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  Building2
} from 'lucide-react';
import Logo from '../../assets/logo_full.png';


import { logout, selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import Button from '../common/Button';

/**
 * Navigation Bar Component
 * Site-wide Navigation
 * Responsive navbar for site-wide navigation
 * Adaptive menu based on authentication and user role
 */
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
  };
  
  // Navigation links based on user role - UPDATED FOR NEW ROUTES
  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', href: '/', current: location.pathname === '/' },
        { name: 'Features', href: '/#features', current: false },
        { name: 'Pricing', href: '/#pricing', current: false },
        { name: 'Contact', href: '/contact', current: location.pathname === '/contact' }
      ];
    }
    
    // Navigation paths based on role - according to new route structure
    switch (user?.role) {
      case 'SYS_ADMIN':
        return [
          { name: 'Dashboard', href: '/sys_admin/dashboard', current: location.pathname === '/sys_admin/dashboard' },
          { name: 'Organizations', href: '/sys_admin/organizations', current: location.pathname.startsWith('/sys_admin/organizations') },
          { name: 'Requests', href: '/sys_admin/requests', current: location.pathname.startsWith('/sys_admin/requests') },
          { name: 'Reports', href: '/sys_admin/reports', current: location.pathname.startsWith('/sys_admin/reports') },
          { name: 'Reportss', href: '/sys_admin/reports', current: location.pathname.startsWith('/sys_admin/reports') }
        ];
      
      case 'ORG_ADMIN':
        return [
          { name: 'Dashboard', href: '/org_admin/dashboard', current: location.pathname === '/org_admin/dashboard' },
          { name: 'Employees', href: '/org_admin/employeemanagement', current: location.pathname.startsWith('/org_admin/employeemanagement') },
          { name: 'Reports', href: '/org_admin/reports', current: location.pathname.startsWith('/org_admin/reports') },
          { name: 'Settings', href: '/org_admin/settings', current: location.pathname.startsWith('/org_admin/settings') }
        ];
        
      case 'HR_STAFF':
        return [
          { name: 'Dashboard', href: '/hr_staff/dashboard', current: location.pathname === '/hr_staff/dashboard' },
          { name: 'Employees', href: '/hr_staff/employeemanagement', current: location.pathname.startsWith('/hr_staff/employeemanagement') },
          { name: 'Leaves', href: '/hr_staff/leavemanagement', current: location.pathname.startsWith('/hr_staff/leavemanagement') },
          { name: 'Reports', href: '/hr_staff/reports', current: location.pathname.startsWith('/hr_staff/reports') }
        ];
        
      case 'EMPLOYEE':
        return [
          { name: 'Profile', href: '/employee/profile', current: location.pathname === '/employee/profile' },
          { name: 'Leaves', href: '/employee/viewleaves', current: location.pathname.startsWith('/employee/viewleaves') },
          { name: 'Attendance', href: '/employee/viewattendance', current: location.pathname.startsWith('/employee/viewattendance') }
        ];
      
      default:
        return [];
    }
  };
  
  const navigationLinks = getNavigationLinks();
  
  return (
    <nav className="bg-[#0C397A] backdrop-blur-lg bg-opacity-95 shadow-lg border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
             
              <img src={Logo} alt="CoreHive Logo" className="w-45 " />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group ${
                  item.current
                    ? 'text-white bg-[#02C39A] shadow-lg shadow-[#02C39A]/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
                {!item.current && (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#02C39A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                )}
              </Link>
            ))}
          </div>
          
          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Guest user buttons
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#02C39A] to-[#1ED292] rounded-lg shadow-lg shadow-[#02C39A]/30 hover:shadow-xl hover:shadow-[#02C39A]/40 hover:scale-105 transition-all duration-300">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#02C39A] to-[#1ED292] rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-white/60">
                      {user?.role?.replace('_', ' ') || 'User'}
                    </p>
                  </div>
                </button>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-[#0C397A] to-[#05668D]">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        {user?.role?.replace('_', ' ')}
                        {user?.organizationName && ` • ${user.organizationName}`}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#02C39A]/10 hover:text-[#0C397A] transition-all duration-200 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Profile Settings
                      </Link>
                      
                      {user?.role === 'ORG_ADMIN' && (
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#02C39A]/10 hover:text-[#0C397A] transition-all duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                          Organization Settings
                        </Link>
                      )}
                      
                      <Link
                        to="/help"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#02C39A]/10 hover:text-[#0C397A] transition-all duration-200 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Help & Support
                      </Link>
                      
                      <hr className="my-2 border-gray-200" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0C397A]/98 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${
                    item.current
                      ? 'text-white bg-[#02C39A] shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile auth buttons */}
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#02C39A] to-[#1ED292] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;