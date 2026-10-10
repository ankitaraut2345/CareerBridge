import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CareerBridge Brand Logo
 * Displays the official CareerBridge stacked logo.
 */
export const BrandLogo = ({
  size = 'default',
  className = '',
  asLink = true,
}) => {
  const heightClass =
    size === 'sm'
      ? 'h-9 sm:h-10'
      : size === 'lg'
      ? 'h-16 sm:h-20'
      : size === 'xl'
      ? 'h-20 sm:h-24'
      : 'h-12 sm:h-14';

  const content = (
    <div className={`inline-flex items-center group ${className}`}>
      <img
        src="/careerbridge-logo.png"
        alt="CareerBridge"
        className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link to="/" className="inline-flex items-center" aria-label="CareerBridge Home">
      {content}
    </Link>
  );
};

export default BrandLogo;
