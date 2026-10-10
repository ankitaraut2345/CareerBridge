import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component adhering to CareerBridge design tokens.
 * Variants: primary (#4F46E5), secondary (#7C3AED), accent (#38BDF8), outline, ghost, white.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  icon: Icon,
  iconPosition = 'left',
  ...rest
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm hover:shadow focus:ring-[#4F46E5]',
    secondary:
      'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm hover:shadow focus:ring-[#7C3AED]',
    accent:
      'bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#172033] font-semibold shadow-sm focus:ring-[#38BDF8]',
    outline:
      'border border-slate-300 bg-white text-[#172033] hover:bg-slate-50 hover:border-slate-400 focus:ring-[#4F46E5]',
    ghost:
      'text-slate-600 hover:text-[#172033] hover:bg-slate-100 focus:ring-slate-300',
    white:
      'bg-white text-[#4F46E5] hover:bg-slate-50 shadow-sm focus:ring-white',
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedStyles} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedStyles} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={combinedStyles} disabled={disabled} onClick={onClick} {...rest}>
      {content}
    </button>
  );
};

export default Button;
