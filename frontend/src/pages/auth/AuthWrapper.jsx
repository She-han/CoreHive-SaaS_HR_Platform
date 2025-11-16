import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  initializeAuth, 
  selectIsAuthenticated, 
  selectIsLoading 
} from '../../store/slices/authSlice';

import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Authentication Wrapper
 * Initialize authentication state when app loads
 */
const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  
  useEffect(() => {
    // Check for existing authentication on app load
    dispatch(initializeAuth());
  }, [dispatch]);
  
  // Show loading screen during initial auth check
  if (isLoading && !isAuthenticated) {
    return (
      <LoadingSpinner 
        centerScreen 
        size="lg"
        text="Loading CoreHive..." 
      />
    );
  }
  
  return children;
};

export default AuthWrapper;