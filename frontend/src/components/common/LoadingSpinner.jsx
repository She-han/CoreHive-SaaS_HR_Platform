import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 * Different size loading indicators
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text,
  className = '',
  centerScreen = false 
}) => {
  // Size classes for bar loader
  const barSizeClasses = {
    sm: 'h-6 w-1',
    md: 'h-8 w-2', 
    lg: 'h-12 w-2',
    xl: 'h-16 w-3'
  };
  
  // Color classes for bars
  const barColorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    white: 'bg-white',
    gray: 'bg-gray-500'
  };
  
  const containerClasses = centerScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex items-center justify-center';
  
  const variants = {
    initial: {
      scaleY: 0.5,
      opacity: 0,
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1,
        ease: "circIn",
      },
    },
  };

  const BarLoader = () => {
    return (
      <motion.div
        transition={{
          staggerChildren: 0.15,
        }}
        initial="initial"
        animate="animate"
        className={`flex gap-1 ${className}`}
      >
        <motion.div 
          variants={variants} 
          className={`${barSizeClasses[size]} ${barColorClasses[color]} rounded-sm`} 
        />
        <motion.div 
          variants={variants} 
          className={`${barSizeClasses[size]} ${barColorClasses[color]} rounded-sm`} 
        />
        <motion.div 
          variants={variants} 
          className={`${barSizeClasses[size]} ${barColorClasses[color]} rounded-sm`} 
        />
        <motion.div 
          variants={variants} 
          className={`${barSizeClasses[size]} ${barColorClasses[color]} rounded-sm`} 
        />
        <motion.div 
          variants={variants} 
          className={`${barSizeClasses[size]} ${barColorClasses[color]} rounded-sm`} 
        />
      </motion.div>
    );
  };
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <BarLoader />
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