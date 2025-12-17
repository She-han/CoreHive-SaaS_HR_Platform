import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { 
  selectIsAuthenticated, 
  selectUser, 
  selectIsLoading 
} from '../../store/slices/authSlice';

import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Protected Route Component - FIXED VERSION
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredUserType = null,
  requireModulesConfigured = false 
}) => {
  const location = useLocation();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  
  // Show loading if authentication is being checked
  if (isLoading) {
    return <LoadingSpinner centerScreen text="Checking authentication..." />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check user type requirement
  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // ENHANCED: Module configuration check for ORG users
  if (user?.userType === 'ORG_USER' && user?.role === 'ORG_ADMIN') {
    
    // If ORG_ADMIN hasn't configured modules
    if (!user?.modulesConfigured) {
        // 👇 FIX: Allow access to BOTH '/configure-modules' AND '/change-password'
        if (location.pathname !== '/configure-modules' && location.pathname !== '/change-password') {
            console.log('ORG_ADMIN needs module configuration...');
            return <Navigate to="/configure-modules" replace />;
        }
    }
    
    // If on config page but modules already configured, go to dashboard
    if (user?.modulesConfigured && location.pathname === '/configure-modules') {
      console.log('Modules already configured, redirecting to org_admin dashboard...');
      return <Navigate to="/org_admin/dashboard" replace />;
    }
  }
  
 
  return children;
};

export default ProtectedRoute;