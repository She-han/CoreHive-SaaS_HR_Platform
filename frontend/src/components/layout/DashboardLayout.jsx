import React, { useState, useEffect, useMemo } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { Bell, Calendar, Clock } from "lucide-react";

/**
 * Dashboard Layout with Sidebar
 * Provides consistent layout structure for all dashboard pages
 * Theme Colors: #333333, #02C39A, #9B9B9B, #1ED292, #0C397A, #F1FDF9, #05668D, #FFFFFF
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
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Memoized date/time formatting
  const formattedDateTime = useMemo(() => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
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

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F1FDF9' }}>
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-opacity-75 lg:hidden"
          style={{ backgroundColor: 'rgba(51, 51, 51, 0.75)' }}
          onClick={toggleMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar isCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
     
        <Sidebar isCollapsed={false} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header 
          className="flex items-center justify-between h-16 px-4 lg:px-6 shadow-sm"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #02C39A' }}
        >
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg transition-all duration-200 lg:hidden"
              style={{ color: '#05668D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1FDF9';
                e.currentTarget.style.color = '#02C39A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#05668D';
              }}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-lg transition-all duration-200"
              style={{ color: '#05668D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1FDF9';
                e.currentTarget.style.color = '#02C39A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#05668D';
              }}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Page title */}
            {title && (
              <h1 
                className="ml-4 text-lg font-semibold"
                style={{ color: '#0C397A' }}
              >
                {title}
              </h1>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Welcome Message - Hidden on small screens */}
            {user && (
              <div className="hidden lg:block">
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#333333' }}
                >
                  Welcome, <span style={{ color: '#02C39A' }}>{user?.firstName || user?.role?.replace('_', ' ')}</span>
                </p>
              </div>
            )}

                {/* Notification Icon */}
            <button 
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ color: '#05668D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1FDF9';
                e.currentTarget.style.color = '#02C39A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#05668D';
              }}
            >
              <Bell className="w-5 h-5" />
              <span 
                className="absolute top-1 right-1 block w-2.5 h-2.5 rounded-full ring-2 ring-white"
                style={{ backgroundColor: '#1ED292' }}
              />
            </button>

            {/* DateTime Display - Hidden on small screens */}
            <div 
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#F1FDF9', border: '1px solid #02C39A' }}
            >
              <div className="flex items-center gap-1.5" style={{ color: '#05668D' }}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{formattedDateTime.date}</span>
              </div>
              <div 
                className="w-px h-4"
                style={{ backgroundColor: '#02C39A' }}
              />
              <div className="flex items-center gap-1.5" style={{ color: '#05668D' }}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{formattedDateTime.time}</span>
              </div>
            </div>

        

         
          </div>
        </header>

        {/* Main content */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: '#F1FDF9' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;