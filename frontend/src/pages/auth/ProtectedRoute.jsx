
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { 
  selectIsAuthenticated, 
  selectUser, 
  selectIsLoading,
  selectRequiresPayment
} from '../../store/slices/authSlice';

import LoadingSpinner from "../../components/common/LoadingSpinner";

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
  const requiresPayment = useSelector(selectRequiresPayment);
  
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
  
  // ⭐ ENHANCED: Payment flow for ORG users
  if (user?.userType === 'ORG_USER' && user?.role === 'ORG_ADMIN') {
    
    // Priority 1: Payment required (highest priority)
    if (requiresPayment) {
      // Allow access to payment-related routes
      const allowedRoutes = ['/payment-gateway', '/payment/success', '/payment/cancel', '/logout'];
      if (!allowedRoutes.includes(location.pathname)) {
        console.log('Payment required, redirecting to payment gateway...');
        return <Navigate to="/payment-gateway" replace />;
      }
    }
    
    // Priority 2: Module configuration (after payment)
    if (!requiresPayment && !user?.modulesConfigured) {
      const allowedRoutes = ['/configure-modules', '/change-password', '/logout'];
      if (!allowedRoutes.includes(location.pathname)) {
        console.log('ORG_ADMIN needs module configuration...');
        return <Navigate to="/configure-modules" replace />;
      }
    }
    
    // If on payment page but payment not required, redirect to dashboard
    if (!requiresPayment && location.pathname === '/payment-gateway') {
      console.log('Payment already completed, redirecting to dashboard...');
      return <Navigate to="/org_admin/dashboard" replace />;
    }
    
    // If on config page but modules already configured, go to dashboard
    if (user?.modulesConfigured && location.pathname === "/configure-modules") {
      console.log(
        "Modules already configured, redirecting to org_admin dashboard..."
      );
      return <Navigate to="/org_admin/dashboard" replace />;
    }
  }
 
  return children;
};

export default ProtectedRoute;
