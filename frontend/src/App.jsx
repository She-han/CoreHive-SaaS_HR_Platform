import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import store from './store/store';
import { selectUser } from './store/slices/authSlice';


import AuthWrapper from './pages/auth/AuthWrapper';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ModuleConfigPage from './pages/auth/ModuleConfigPage';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OrgDashboard from './pages/dashboard/OrgDashboard';

// Admin Pages
/* import AdminApprovals from './pages/admin/AdminApprovals';
import AdminOrganizations from './pages/admin/AdminOrganizations';

// Organization Pages
import EmployeesPage from './pages/org/EmployeesPage';
import PayrollPage from './pages/org/PayrollPage';
import LeavesPage from './pages/org/LeavesPage';
import AttendancePage from './pages/org/AttendancePage';
import ReportsPage from './pages/org/ReportsPage';
import SettingsPage from './pages/org/SettingsPage'; */

/* // Error Pages
import NotFoundPage from './pages/common/NotFoundPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage'; */

/**
 * Main App Component
 * Application routing සහ global providers
 */
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthWrapper>
          <div className="min-h-screen bg-background-primary flex flex-col">
            {/* Navigation Bar */}
            <Navbar />
            
            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Module Configuration (First-time ORG_ADMIN) */}
                <Route 
                  path="/configure-modules" 
                  element={
                    <ProtectedRoute requiredUserType="ORG_USER" requiredRole="ORG_ADMIN">
                      <ModuleConfigPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Dashboard Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } 
                />
                
                {/* System Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requiredUserType="SYSTEM_ADMIN" requiredRole="SYS_ADMIN">
                      <AdminRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization Routes */}
                <Route 
                  path="/employees/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER" 
                      requireModulesConfigured={true}
                    >
                      <EmployeeRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/payroll/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER" 
                      requiredRole="ORG_ADMIN"
                      requireModulesConfigured={true}
                    >
                      <PayrollRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/leaves/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER"
                      requireModulesConfigured={true}
                    >
                      <LeaveRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/attendance/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER"
                      requireModulesConfigured={true}
                    >
                      <AttendanceRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/reports/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER"
                      requireModulesConfigured={true}
                    >
                      <ReportRoutes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/settings/*" 
                  element={
                    <ProtectedRoute 
                      requiredUserType="ORG_USER" 
                      requiredRole="ORG_ADMIN"
                      requireModulesConfigured={true}
                    >
                      <SettingsRoutes />
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
            <Footer />
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
 * Dashboard Router Component
 * Role-based dashboard routing
 */
const DashboardRouter = () => {
  const user = useSelector(selectUser);
  
  if (user?.userType === 'SYSTEM_ADMIN') {
    return <AdminDashboard />;
  } else if (user?.userType === 'ORG_USER') {
    return <OrgDashboard />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

/**
 * Admin Routes Component
 * System admin nested routes
 */
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="approvals" element={<AdminApprovals />} />
      <Route path="organizations" element={<AdminOrganizations />} />
      <Route path="organizations/:id" element={<AdminOrganizationDetail />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

/**
 * Employee Routes Component
 * Employee management nested routes
 */
const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<EmployeesPage />} />
      <Route path="add" element={<AddEmployeePage />} />
      <Route path=":id" element={<EmployeeDetailPage />} />
      <Route path=":id/edit" element={<EditEmployeePage />} />
    </Routes>
  );
};

/**
 * Payroll Routes Component
 * Payroll management nested routes
 */
const PayrollRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<PayrollPage />} />
      <Route path="process" element={<ProcessPayrollPage />} />
      <Route path="payslips" element={<PayslipsPage />} />
      <Route path="payslips/:id" element={<PayslipDetailPage />} />
      <Route path="components" element={<PayrollComponentsPage />} />
    </Routes>
  );
};

/**
 * Leave Routes Component
 * Leave management nested routes
 */
const LeaveRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<LeavesPage />} />
      <Route path="apply" element={<ApplyLeavePage />} />
      <Route path="pending" element={<PendingLeavesPage />} />
      <Route path="balance" element={<LeaveBalancePage />} />
      <Route path="my" element={<MyLeavesPage />} />
      <Route path="types" element={<LeaveTypesPage />} />
    </Routes>
  );
};

/**
 * Attendance Routes Component
 * Attendance management nested routes
 */
const AttendanceRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AttendancePage />} />
      <Route path="mark" element={<MarkAttendancePage />} />
      <Route path="my" element={<MyAttendancePage />} />
      <Route path="reports" element={<AttendanceReportsPage />} />
    </Routes>
  );
};

/**
 * Report Routes Component
 * Reports and analytics nested routes
 */
const ReportRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<ReportsPage />} />
      <Route path="employees" element={<EmployeeReportsPage />} />
      <Route path="payroll" element={<PayrollReportsPage />} />
      <Route path="attendance" element={<AttendanceReportsPage />} />
      <Route path="leaves" element={<LeaveReportsPage />} />
    </Routes>
  );
};

/**
 * Settings Routes Component
 * Organization settings nested routes
 */
const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<SettingsPage />} />
      <Route path="organization" element={<OrganizationSettingsPage />} />
      <Route path="users" element={<UserManagementPage />} />
      <Route path="modules" element={<ModuleSettingsPage />} />
      <Route path="payroll" element={<PayrollSettingsPage />} />
      <Route path="leaves" element={<LeaveSettingsPage />} />
    </Routes>
  );
};



export default App;