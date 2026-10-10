import React from 'react';

/**
 * Reusable Card Component for SaaS layout.
 * Clean, subtle border, white background, controlled elevation.
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'default',
  border = true,
  ...rest
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl ${
        border ? 'border border-slate-200/90' : ''
      } ${paddingStyles[padding] || paddingStyles.default} ${
        hoverEffect
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300'
          : 'shadow-sm'
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
