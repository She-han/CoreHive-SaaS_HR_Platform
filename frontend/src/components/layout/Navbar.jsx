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
import Logo from '../../assets/corehive_logo_full.png';


import { logout, selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import Button from '../common/Button';

/**
 * Navigation Bar Component
 * Site-wide navigation සඳහා responsive navbar
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
  
  // Navigation links based on user type
  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', href: '/', current: location.pathname === '/' },
        { name: 'Features', href: '/features', current: location.pathname === '/features' },
        { name: 'Pricing', href: '/pricing', current: location.pathname === '/pricing' },
        { name: 'Contact', href: '/contact', current: location.pathname === '/contact' }
      ];
    }
    
    switch (user?.userType) {
      case 'SYSTEM_ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', current: location.pathname === '/admin/dashboard' },
          { name: 'Organizations', href: '/admin/organizations', current: location.pathname.startsWith('/admin/organizations') },
          { name: 'Approvals', href: '/admin/approvals', current: location.pathname === '/admin/approvals' },
          { name: 'Reports', href: '/admin/reports', current: location.pathname === '/admin/reports' }
        ];
      
      case 'ORG_USER':
        const orgLinks = [
          { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' }
        ];
        
        // Role-based navigation additions
        if (user?.role === 'ORG_ADMIN' || user?.role === 'HR_STAFF') {
          orgLinks.push(
            { name: 'Employees', href: '/employees', current: location.pathname.startsWith('/employees') },
            { name: 'Leave', href: '/leaves', current: location.pathname.startsWith('/leaves') },
            { name: 'Attendance', href: '/attendance', current: location.pathname.startsWith('/attendance') }
          );
        }
        
        if (user?.role === 'ORG_ADMIN') {
          orgLinks.push(
            { name: 'Payroll', href: '/payroll', current: location.pathname.startsWith('/payroll') },
            { name: 'Reports', href: '/reports', current: location.pathname.startsWith('/reports') },
            { name: 'Settings', href: '/settings', current: location.pathname.startsWith('/settings') }
          );
        }
        
        return orgLinks;
      
      default:
        return [];
    }
  };
  
  const navigationLinks = getNavigationLinks();
  
  return (
    <nav className="bg-background-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={Logo} alt="CoreHive Logo" className="w-36" />
              <span className="text-2xl font-bold text-text-primary">
                Core<span className="text-primary-500">Hive</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  item.current
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-text-secondary hover:text-primary-500 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Guest user buttons
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {user?.role?.replace('_', ' ') || 'User'}
                    </p>
                  </div>
                </button>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.email}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {user?.role?.replace('_', ' ')}
                        {user?.organizationName && ` • ${user.organizationName}`}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                      
                      {user?.role === 'ORG_ADMIN' && (
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Organization Settings
                        </Link>
                      )}
                      
                      <Link
                        to="/help"
                        className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 mr-3" />
                        Help & Support
                      </Link>
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
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
                className="p-2 rounded-md text-text-secondary hover:text-primary-500 hover:bg-gray-50 transition-colors duration-200"
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
          <div className="md:hidden border-t border-gray-200 bg-background-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    item.current
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-text-secondary hover:text-primary-500 hover:bg-gray-50'
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
                    className="block w-full text-center px-3 py-2 border border-transparent rounded-md text-text-secondary hover:text-primary-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
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