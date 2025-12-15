import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import Button from './Button';

/**
 * Alert Component
 * Display messages as centered modal popup with different types
 */
const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  isOpen = true,
  closeOnOverlayClick = true,
  autoClose = false,
  autoCloseDuration = 3000,
  className = ''
}) => {
  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      textColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700'
    }
  };
  
  const config = alertConfig[type];
  const Icon = config.icon;
  
  // Close alert on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when alert is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDuration, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute bg-black/30 inset-0 transition-all duration-100 backdrop-blur-sm"
        onClick={closeOnOverlayClick && onClose ? onClose : undefined}
      />
      
      {/* Alert Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full max-w-md bg-white
            rounded-xl shadow-xl transform transition-all animate-slide-up translate-z-80
            ${className}
          `}
        >
          {/* Header with Icon and Close Button */}
          <div className={`flex items-start p-6 border-b ${config.borderColor}`}>
            <div className={`flex-shrink-0 ${config.bgColor} rounded-full p-2`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            
            <div className="ml-4 flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${config.titleColor}`}>
                  {title}
                </h3>
              )}
            </div>
            
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={X}
                className="ml-auto -mt-1"
              />
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {message && (
              <p className={`text-sm ${config.textColor}`}>
                {message}
              </p>
            )}
          </div>
          
          {/* Footer with action button */}
          {onClose && (
            <div className="flex justify-end gap-3 px-6 pb-6">
              <Button
                variant="primary"
                onClick={onClose}
                className="min-w-[100px]"
              >
                OK
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;