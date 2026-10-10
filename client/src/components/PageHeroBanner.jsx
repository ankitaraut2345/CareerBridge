import React from 'react';

/**
 * Standardized PageHeroBanner matching the CareerBridge SaaS visual design across all mockups.
 * Includes soft dual-tone ambient gradient backdrop, large typography, subtitle,
 * decorative illustration badge / tagline, and optional action pills.
 */
export const PageHeroBanner = ({
  title,
  subtitle,
  tagline,
  taglineIcon: TaglineIcon,
  badgeText,
  featurePills = [],
  actionButtons = null,
  searchSlot = null,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-purple-50/80 border border-slate-200/70 p-6 sm:p-8 lg:p-9 shadow-xs mb-7 ${className}`}
    >
      {/* Ambient background decorative orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/35 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-100/40 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          {badgeText && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100/80 text-[#4F46E5] mb-2.5">
              {badgeText}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}

          {actionButtons && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {actionButtons}
            </div>
          )}
        </div>

        {/* Top-Right Decorative Tagline Pill / Illustration Card */}
        {tagline && (
          <div className="hidden md:flex flex-col items-end justify-center self-start lg:self-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100/90 shadow-xs text-xs sm:text-sm font-bold text-[#4F46E5] transform rotate-1 hover:rotate-0 transition-transform">
              {TaglineIcon && <TaglineIcon className="w-4 h-4 text-[#7C3AED]" />}
              <span className="font-semibold italic text-[#4F46E5]">{tagline}</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards / Stat Highlights Row */}
      {featurePills && featurePills.length > 0 && (
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-indigo-100/60">
          {featurePills.map((pill, idx) => {
            const Icon = pill.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs hover:bg-white hover:border-indigo-200 transition-all"
              >
                {Icon && (
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      pill.iconBg || 'bg-indigo-50 text-[#4F46E5]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#172033] truncate">
                    {pill.title}
                  </div>
                  {pill.subtitle && (
                    <div className="text-[11px] text-slate-500 truncate">
                      {pill.subtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Search / Input Slot (e.g. in Help & Support) */}
      {searchSlot && <div className="relative z-10 mt-6">{searchSlot}</div>}
    </div>
  );
};

export default PageHeroBanner;
