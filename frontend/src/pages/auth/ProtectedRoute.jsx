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
  
  // FIXED: Module configuration check
  if (user?.userType === 'ORG_USER' && user?.role === 'ORG_ADMIN') {
    // If ORG_ADMIN hasn't configured modules and not already on config page
    if (!user?.modulesConfigured && location.pathname !== '/configure-modules') {
      console.log('🔄 Redirecting to module configuration...');
      return <Navigate to="/configure-modules" replace />;
    }
    
    // If on config page but modules already configured, redirect to dashboard
    if (user?.modulesConfigured && location.pathname === '/configure-modules') {
      console.log('✅ Modules already configured, redirecting to dashboard...');
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Check if modules are configured for protected routes (except dashboard and config page)
  if (requireModulesConfigured && user?.role === 'ORG_ADMIN' && !user?.modulesConfigured) {
    return <Navigate to="/configure-modules" replace />;
  }
  
  return children;
};

export default ProtectedRoute;