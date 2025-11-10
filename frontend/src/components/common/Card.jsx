import React from 'react';

/**
 * Reusable Card Component
 * Content containers සඳහා consistent styling
 */
const Card = ({
  children,
  title,
  subtitle,
  className = '',
  bodyClassName = '',
  padding = 'default',
  shadow = 'default',
  ...props
}) => {
  // Padding variants
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  // Shadow variants
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-card',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const cardClasses = `
    bg-background-white rounded-xl border border-gray-100 
    ${shadowClasses[shadow]} 
    ${paddingClasses[padding]} 
    ${className}
  `;
  
  return (
    <div className={cardClasses} {...props}>
      {/* Card header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-text-primary mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Card body */}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
};

export default Card;