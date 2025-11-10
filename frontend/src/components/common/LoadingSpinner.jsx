import React from 'react';

/**
 * Loading Spinner Component
 * Different sizes සමඟ loading indicators
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text,
  className = '',
  centerScreen = false 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };
  
  const spinnerClasses = `
    animate-spin rounded-full border-4 border-opacity-30 border-t-opacity-100
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `;
  
  const containerClasses = centerScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex items-center justify-center';
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <div className={spinnerClasses}></div>
        {text && (
          <p className="text-text-secondary text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;