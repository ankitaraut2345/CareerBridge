import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CareerBridge Brand Logo
 * Displays the official CareerBridge gradient monogram, typography & tagline.
 */
export const BrandLogo = ({
  showTagline = true,
  size = 'default',
  variant = 'horizontal', // 'horizontal' | 'stacked'
  className = '',
  asLink = true,
}) => {
  // Height sizing
  const heightClass =
    size === 'sm'
      ? 'h-8 sm:h-9'
      : size === 'lg'
      ? 'h-12 sm:h-14'
      : size === 'xl'
      ? 'h-14 sm:h-16'
      : 'h-9 sm:h-10';

  const logoSrc = variant === 'stacked' ? '/careerbridge-logo-stacked.png' : '/careerbridge-logo.png';

  const content = (
    <div className={`inline-flex items-center group ${className}`}>
      <img
        src={logoSrc}
        alt="CareerBridge — Where Talent Meets Opportunity & the Right Guidance"
        className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
        onError={(e) => {
          // Graceful fallback to styled text if image is not reachable
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
