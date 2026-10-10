import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CareerBridge Brand Logo
 * Accurately represents the official CB connected ribbon symbol,
 * brand wordmark, and optional tagline.
 */
export const BrandLogo = ({ showTagline = false, size = 'default', className = '' }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`} aria-label="CareerBridge Home">
      {/* Official CB Monogram Symbol */}
      <svg
        className={`${iconSize} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="bridgeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="bGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>

        {/* 'C' Contour */}
        <path
          d="M 42 16 C 24 16 12 28 12 45 C 12 62 24 74 42 74 C 49 74 55 71 60 66 L 51 57 C 48 60 45 62 41 62 C 30 62 24 55 24 45 C 24 35 30 28 41 28 C 45 28 49 30 52 33 L 61 24 C 55 19 49 16 42 16 Z"
          fill="url(#cGradient)"
        />

        {/* Bridge Ribbon */}
        <polygon points="36,54 58,25 68,25 46,54" fill="url(#bridgeGradient)" />

        {/* 'B' Contour */}
        <path
          d="M 52 16 L 73 16 C 82 16 89 21 89 29 C 89 34 85 39 80 41 C 87 43 92 49 92 57 C 92 66 84 74 74 74 L 52 74 L 60 62 L 73 62 C 77 62 80 59 80 55 C 80 51 77 48 73 48 L 62 48 L 65 37 L 72 37 C 76 37 79 34 79 30 C 79 26 76 24 72 24 L 56 24 Z"
          fill="url(#bGradient)"
        />
      </svg>

      <div className="flex flex-col">
        <span className={`${textSize} font-extrabold tracking-tight leading-none text-[#172033]`}>
          <span>Career</span>
          <span className="text-[#7C3AED]">Bridge</span>
        </span>
        {showTagline && (
          <span className={`${taglineSize} text-slate-500 font-medium tracking-normal mt-1 leading-tight`}>
            Where Talent Meets Opportunity &amp; the Right Guidance
          </span>
        )}
      </div>
    </Link>
  );
};

export default BrandLogo;
