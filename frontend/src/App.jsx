import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import store from './store/store';
import { selectUser } from './store/slices/authSlice';


import AuthWrapper from './pages/auth/AuthWrapper';
import ProtectedRoute from './pages/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ModuleConfigPage from './pages/auth/ModuleConfigPage';

// System admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import Settings from './pages/admin/Settings';
import Support from './pages/admin/Support';
import AuditLogs from './pages/admin/AuditLogs';
import Analytics from './pages/admin/SystemAnalytics';
import Billing from './pages/admin/BillingAndPlans';
import Users from './pages/admin/Users';
import Organizations from './pages/admin/Organizations';


import OrgDashboard from './pages/dashboard/OrgDashboard';
import HRDashboard from './pages/Dashboard';
import MainHRLayout from "../src/components/layout/MainHRLayout"; 
import EmployeeManagement from './pages/EmployeeManagement';
import LeaveManagement from './pages/LeaveManagement';
import HiringManagement from './pages/HiringManagement';
import HRReportingManagement from './pages/HRReportingManagement';
import FeedBackManagement from './pages/FeedBackManagement';
import AttendanceManagement from './pages/AttendanceManagement';

/* // Admin Pages
 import AdminApprovals from './pages/admin/AdminApprovals';
import AdminOrganizations from './pages/admin/AdminOrganizations'; */

// Organization Pages
import HRStaffManagement from './pages/org_admin/HRStaffManagement';
import DepartmentManagement from './pages/org_admin/DepartmentManagement';
/* import PayrollPage from './pages/org/PayrollPage';
import LeavesPage from './pages/org/LeavesPage';
import AttendancePage from './pages/org/AttendancePage';
import ReportsPage from './pages/org/ReportsPage';
import SettingsPage from './pages/org/SettingsPage'; */ 

/* // Error Pages
import NotFoundPage from './pages/common/NotFoundPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage'; */

/**
 * Main App Component
 * Application routing and role-based access control
 * 
 * user type path structure:
 * - System Admin: /sys_admin/* 
 * - Org Admin: /org_admin/*
 * - HR Staff: /hr_staff/* 
 * - Employee: /employee/*
 */
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthWrapper>
          <div className="min-h-screen bg-background-primary flex flex-col">
            {/* Navigation Bar */}
            
            
            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes - any user can access */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Module Configuration (First-time ORG_ADMIN only) */}
                <Route 
                  path="/configure-modules" 
                  element={
                    <ProtectedRoute requiredUserType="ORG_USER" requiredRole="ORG_ADMIN">
                      <ModuleConfigPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Legacy Dashboard Route - Redirects to role-specific dashboard */}
                <Route 
                  path="/dashboard" 
                  element={
                   
                      <DashboardRedirect />
                   
                  } 
                />
                
                {/* System Admin Routes - SYS_ADMIN role */}
                <Route 
                  path="/sys_admin/*" 
                  element={
                    <ProtectedRoute requiredUserType="SYSTEM_ADMIN" requiredRole="SYS_ADMIN">
                      <SystemAdminRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization Admin Routes - ORG_ADMIN role */}
                <Route 
                  path="/org_admin/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER" 
                      requiredRole="ORG_ADMIN"
                      requireModulesConfigured={true}
                    >
                      <OrgAdminRoutes />
                    </ProtectedRoute>
                  } 
                />

                {/* HR Staff Routes - HR_STAFF only */}
                <Route 
                  path="/hr_staff/*" 
                  element={
             
                      <HRStaffRoutes />
                   
                  } 
                />

                {/* Employee Routes - EMPLOYEE role only*/}
                <Route 
                  path="/employee/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER" 
                      requiredRole="EMPLOYEE"
                      requireModulesConfigured={true}
                    >
                      <EmployeeRoutes />
                    </ProtectedRoute>
                  } 
                />
                
         {/*        {/* Error Routes 
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} /> */}
              </Routes>
            </main>
            
            {/* Footer */}
           
          </div>
          
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#02C39A',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthWrapper>
      </Router>
    </Provider>
  );
}

/**
 * Dashboard Redirect Component
 * According to role of user -> redirect to selected dashboard
 */
const DashboardRedirect = () => {
  const user = useSelector(selectUser);
  
  switch (user?.role) {
    case 'SYS_ADMIN':
      return <Navigate to="/sys_admin/dashboard" replace />;
    case 'ORG_ADMIN':
      return <Navigate to="/org_admin/dashboard" replace />;
    case 'HR_STAFF':
      return <Navigate to="/hr_staff/dashboard" replace />;
    case 'EMPLOYEE':
      return <Navigate to="/employee/profile" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

/**
 * System Admin Routes Component
 * SYS_ADMIN role only access - platform management
 */
const SystemAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="approvals" element={<AdminApprovals />} />
      <Route path="settings" element={<Settings />} />
      <Route path="support" element={<Support />} />
      <Route path="audits" element={<AuditLogs />} />
      <Route path='analytics' element={<Analytics />} />
      <Route path='billing' element={<Billing />} />
      <Route path='users' element={<Users />} />
      <Route path='organizations' element={<Organizations />} />
 {/*      <Route path="organizations" element={<AdminOrganizations />} />
      <Route path="organizations/:id" element={<AdminOrganizationDetail />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="settings" element={<AdminSettings />} /> 
      <Route path="" element={<Navigate to="dashboard" replace />} /> */}
    </Routes>
  );
};

/**
 * Organization Admin Routes Component  
 * ORG_ADMIN role -> all organization permissions
 * Path structure: /org_admin/* (relative paths)
 */
const OrgAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<OrgDashboard />} />
     <Route path="hrstaffmanagement" element={<HRStaffManagement />} />
     <Route path="departmentmanagement" element={<DepartmentManagement />} />
     {/*   <Route path="employeemanagement" element={<EmployeeManagement />} />
      <Route path="employeemanagement/add" element={<AddEmployee />} />
      <Route path="employeemanagement/:id" element={<EmployeeDetail />} />
      <Route path="employeemanagement/:id/edit" element={<EditEmployee />} />
      <Route path="payrollmanagement" element={<PayrollManagement />} />
      <Route path="payrollmanagement/process" element={<ProcessPayroll />} />
      <Route path="payrollmanagement/payslips" element={<PayslipManagement />} />
      <Route path="leavemanagement" element={<LeaveManagement />} />
      <Route path="leavemanagement/approvals" element={<LeaveApprovals />} />
      <Route path="attendancemanagement" element={<AttendanceManagement />} />
      <Route path="reports" element={<OrgReports />} />
      <Route path="" element={<Navigate to="dashboard" replace />} /> */}
    </Routes>
  );
};

/**
 * HR Staff Routes Component
 * HR_STAFF role -> HR related permissions 
 */
// MainHRLayout is the parent layout
// HRDashboard and EmployeeManagement are child pages

const HRStaffRoutes = () => {
  return (
    <Routes>
      <Route element={<MainHRLayout />}>
        <Route path="dashboard" element={<HRDashboard />} />
        {/* Add more HR pages here later */}
        <Route path="EmployeeManagement" element={<EmployeeManagement />} /> 
        <Route path="HiringManagement" element={<HiringManagement />} /> 
        <Route path="LeaveManagement" element={<LeaveManagement />} /> 
        <Route path="AttendanceManagement" element={<AttendanceManagement />} /> 
        <Route path="FeedBackManagement" element={<FeedBackManagement />} /> 
        <Route path="HRReportingManagement" element={<HRReportingManagement />} /> 
      </Route>
    </Routes>
  );
};


/**
 * Employee Routes Component
 * EMPLOYEE role - self-service functions only
 */
const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="profile" element={<EmployeeProfile />} />
      <Route path="profile/edit" element={<EditProfile />} />
      <Route path="viewattendance" element={<ViewAttendance />} />
      <Route path="viewleaves" element={<ViewLeaves />} />
      <Route path="viewleaves/apply" element={<ApplyLeave />} />
      <Route path="viewpayslips" element={<ViewPayslips />} />
      <Route path="viewpayslips/:id" element={<PayslipDetail />} />
      <Route path="" element={<Navigate to="profile" replace />} />
    </Routes>
  );
};



export default App;