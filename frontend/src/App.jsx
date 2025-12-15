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
import { ForgetPasswordPage } from './pages/auth/ForgetPasswordPage';

// Middle auth pages
import ModuleConfigPage from './pages/auth/ModuleConfigPage';
import {ChangePasswordPage} from './pages/auth/ChangePasswordPage';

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

// Organization admin Pages
import OrgDashboard from './pages/org_admin/OrgDashboard';
import HRStaffManagement from './pages/org_admin/HRStaffManagement';
import ModuleConfiguration from './pages/org_admin/ModuleConfiguration';
import DepartmentManagement from './pages/org_admin/DepartmentManagement';
import {DesignationManagement} from './pages/org_admin/DesignationManagement';

// HR Staff pages
import HRDashboard from './pages/hrstaff/HRDashboard';
import MainHRLayout from "../src/components/layout/MainHRLayout"; 
import EmployeeManagement from './pages/hrstaff/EmployeeManagement';
import AddEmployee from './components/hrstaff/employeemanagement/AddEmployee';
import EditEmployee from './components/hrstaff/employeemanagement/EditeEmployee';
import LeaveManagement from './pages/hrstaff/LeaveManagement';
import HRReportingManagement from './pages/hrstaff/HRReportingManagement';
import AttendanceManagement from './pages/AttendaceManagement/AttendanceManagement';
import PayrollDashboard from './pages/hrstaff/payroll/PayrollDashboard';
import SalaryStructure from './pages/hrstaff/payroll/SalaryStructure';
import PayrollRun from './pages/hrstaff/payroll/PayrollRun';
import PayslipList from './pages/hrstaff/payroll/PayslipList';
import PayrollReports from './pages/hrstaff/payroll/PayrollReports';

import HiringManagement from './pages/hrstaff/HiringManagement';
import FeedBackManagement from './pages/hrstaff/FeedBackManagement';
import FaceAttendancePage from './pages/AttendaceManagement/FaceAttendancePage';
import QRAttendancePage from './pages/AttendaceManagement/QRAttendancePage';

// Employee Pages
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EditProfile from './pages/employee/EditProfile';
import ViewLeaveAndAttendance from './pages/employee/ViewLeaveAndAttendance';
import LeaveRequest from './pages/employee/LeaveRequest';
import Feedback from './pages/employee/Feedback';
import Notices from './pages/employee/Notices';
import Payslips from './pages/employee/Payslips';

/* // Error Pages
import NotFoundPage from './pages/common/NotFoundPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage'; */

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
                <Route path="/forgot-password" element={<ForgetPasswordPage />} />

                {/* Change Password (First-time any ORG_USER) */}
                <Route 
                  path="/change-password" 
                  element={
                    <ProtectedRoute requiredUserType="ORG_USER">
                      <ChangePasswordPage />
                    </ProtectedRoute>
                  } 
                />
                
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
      <Route path="" element={<Navigate to="dashboard" replace />} />
 {/*  
      <Route path="reports" element={<AdminReports />} />
      <Route path="settings" element={<AdminSettings />} /> 
       */}
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
     <Route path="designationmanagement" element={<DesignationManagement />} />
     <Route path="modules" element={<ModuleConfiguration />} />
     <Route path="" element={<Navigate to="dashboard" replace />} />
     {/*   
      <Route path="reports" element={<OrgReports />} />
       */}
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
        <Route path="EmployeeManagement" element={<EmployeeManagement />} /> 
        <Route path="EmployeeManagement/addemployee" element={<AddEmployee />} /> 
        <Route path="EmployeeManagement/editemployee/:id" element={<EditEmployee />} />  {/* ADD :id parameter */}
        <Route path="LeaveManagement" element={<LeaveManagement />} /> 
        <Route path="AttendanceManagement" element={<AttendanceManagement />} /> 
        <Route path="HRReportingManagement" element={<HRReportingManagement />} /> 
   
        <Route path="PayrollDashboard" element={<PayrollDashboard />} />
        <Route path="payroll/salary-structure" element={<SalaryStructure />} />
        <Route path="payroll/payroll-run" element={<PayrollRun />} />
        <Route path="payroll/payslips" element={<PayslipList />} />
        <Route path="payroll/reports" element={<PayrollReports />} />

        <Route path="FeedBackManagement" element={<FeedBackManagement />} /> 
        <Route path="HiringManagement" element={<HiringManagement />} /> 
        <Route path="faceattendance" element={<FaceAttendancePage />} />
        <Route path="qrattendance" element={<QRAttendancePage />} />
        
        <Route path="" element={<Navigate to="dashboard" replace />} />
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
      <Route path="viewleaveandattendance" element={<ViewLeaveAndAttendance />} />
      <Route path="leaverequest" element={<LeaveRequest />} />
      <Route path="feedback" element={<Feedback />} />
      <Route path="notices" element={<Notices />} />
      <Route path="payslips" element={<Payslips />} />
      <Route path="" element={<Navigate to="profile" replace />} />
    </Routes>
  );
};



export default App;