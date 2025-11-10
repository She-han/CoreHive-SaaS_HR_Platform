/**
 * Application Constants
 * Global constants and configuration values
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CONFIGURE_MODULES: '/auth/configure-modules'
  },
  
  // Admin
  ADMIN: {
    PENDING_APPROVALS: '/admin/organizations/pending',
    ORGANIZATIONS: '/admin/organizations',
    APPROVE_ORG: (uuid) => `/admin/organizations/${uuid}/approve`,
    REJECT_ORG: (uuid) => `/admin/organizations/${uuid}/reject`,
    CHANGE_STATUS: (uuid) => `/admin/organizations/${uuid}/status`,
    STATISTICS: '/admin/statistics'
  },
  
  // Dashboard
  DASHBOARD: '/dashboard'
};

// User Roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYS_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  HR_STAFF: 'HR_STAFF',
  EMPLOYEE: 'EMPLOYEE'
};

// User Types
export const USER_TYPES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ORG_USER: 'ORG_USER'
};

// Organization Status
export const ORG_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  DORMANT: 'DORMANT',
  SUSPENDED: 'SUSPENDED'
};

// Employee Count Ranges
export const EMPLOYEE_COUNT_RANGES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

// Module Names
export const MODULES = {
  EMPLOYEE_MANAGEMENT: 'employeeManagement',
  PAYROLL_MANAGEMENT: 'payrollManagement',
  LEAVE_MANAGEMENT: 'leaveManagement',
  ATTENDANCE_MANAGEMENT: 'attendanceManagement',
  REPORT_GENERATION: 'reportGeneration',
  ADMIN_ACTIVITY_TRACKING: 'adminActivityTracking',
  NOTIFICATION_SYSTEM: 'notificationSystem',
  BASIC_DASHBOARD: 'basicDashboard',
  
  // Extended modules
  PERFORMANCE_TRACKING: 'performanceTracking',
  EMPLOYEE_FEEDBACK: 'employeeFeedback',
  HIRING_MANAGEMENT: 'hiringManagement'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'corehive_token',
  USER: 'corehive_user',
  THEME: 'corehive_theme',
  LANGUAGE: 'corehive_language'
};

// Application Settings
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'CoreHive',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100
};

// Date/Time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'MMM DD, YYYY HH:mm'
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  USER_TYPES,
  ORG_STATUS,
  EMPLOYEE_COUNT_RANGES,
  MODULES,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  APP_CONFIG,
  PAGINATION,
  DATE_FORMATS
};