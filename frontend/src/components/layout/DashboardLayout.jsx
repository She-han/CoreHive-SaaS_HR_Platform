import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import { Bell, Calendar, Clock, Search, ChevronDown } from "lucide-react";

// Theme colors
const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  background: '#F1FDF9',
  success: '#1ED292',
  text: '#333333',
  muted: '#9B9B9B'
};

// Memoized Header Date/Time Component for performance
const HeaderDateTime = memo(({ date, time }) => (
  <div 
    className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl"
    style={{ 
      backgroundColor: THEME.background, 
      border: `1px solid ${THEME.primary}`,
      boxShadow: '0 2px 4px rgba(2, 195, 154, 0.1)'
    }}
  >
    <div className="flex items-center gap-1.5" style={{ color: THEME.secondary }}>
      <Calendar className="w-4 h-4" />
      <span className="text-sm font-medium">{date}</span>
    </div>
    <div 
      className="w-px h-4"
      style={{ backgroundColor: THEME.primary }}
    />
    <div className="flex items-center gap-1.5" style={{ color: THEME.secondary }}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{time}</span>
    </div>
  </div>
));
HeaderDateTime.displayName = 'HeaderDateTime';

// Memoized Notification Button
const NotificationButton = memo(() => (
  <button 
    className="relative p-2.5 rounded-xl transition-all duration-200 hover:shadow-md"
    style={{ 
      backgroundColor: THEME.background,
      color: THEME.secondary 
    }}
  >
    <Bell className="w-5 h-5" />
    <span 
      className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse"
      style={{ backgroundColor: THEME.success }}
    />
  </button>
));
NotificationButton.displayName = 'NotificationButton';


// Memoized User Welcome Component
const UserWelcome = memo(({ user }) => {

   // Extract username from email
  const userName = useMemo(() => 
    user?.email?.split('@')[0] || 'Admin',
    [user?.email]
  );
  
  const displayName = useMemo(() => 
    user?.firstName || user?.role?.replace('_', ' ') || 'User',
    [user?.firstName, user?.role]
  );
  
  return (
    <div className="hidden lg:flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium" style={{ color: THEME.text }}>
          Welcome, <span style={{ color: THEME.primary }}>{userName}</span>!
        </p>
   
      </div>
    </div>
  );
});
UserWelcome.displayName = 'UserWelcome';




/**
 * Dashboard Layout with Sidebar
 * Modern design with CoreHive theme colors
 * Optimized with memoization for performance
 */
const DashboardLayout = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { user } = useSelector((state) => state.auth);

  // Update time every minute for performance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);




  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  // Memoized date/time formatting
  const formattedDateTime = useMemo(() => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    const date = currentTime.toLocaleDateString('en-US', options);
    const time = currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return { date, time };
  }, [currentTime]);

  // Memoized toggle handlers
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  


  return (
    <div className="flex h-screen" style={{ backgroundColor: THEME.background }}>
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar isCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isCollapsed={false} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header 
          className="flex items-center justify-between h-16 px-4 lg:px-6 shadow-sm relative z-10"
          style={{ 
            backgroundColor: '#FFFFFF', 
            borderBottom: `3px solid ${THEME.primary}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl transition-all duration-200 lg:hidden hover:shadow-md"
              style={{ 
                backgroundColor: THEME.background,
                color: THEME.secondary 
              }}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl transition-all duration-200 hover:shadow-md"
              style={{ 
                backgroundColor: THEME.background,
                color: THEME.secondary 
              }}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

         
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* User Welcome */}
            <UserWelcome user={user} />

            {/* Notification Icon */}
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-0 right-0 block w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
            {/*profile*/}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                CH
              </div>

              {/* Name + Email */}
              <div className="leading-tight">
                <p className="text-[13px] text-gray-900">p</p>
                <p className="text-xs text-gray-500">pp</p>
              </div>
            </div>
            {/* Logout Icon */  }
            <LogOut className="w-4 h-4 text-gray-600 cursor-pointer hover:text-black" />
            <NotificationButton />

            {/* DateTime Display */}
            <HeaderDateTime 
              date={formattedDateTime.date} 
              time={formattedDateTime.time} 
            />
          </div>
        </header>

        {/* Main content */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: THEME.background }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;