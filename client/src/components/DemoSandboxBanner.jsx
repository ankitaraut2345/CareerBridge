import React from 'react';
import { Sparkles, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { role: 'STUDENT', label: 'Student', color: 'hover:bg-blue-600' },
  { role: 'ALUMNI', label: 'Alumni', color: 'hover:bg-emerald-600' },
  { role: 'TPO', label: 'TPO Officer', color: 'hover:bg-amber-600' },
  { role: 'ADMIN', label: 'Admin', color: 'hover:bg-rose-600' },
];

export const DemoSandboxBanner = () => {
  const { user, isDemoSandbox, enterDemoSandbox, exitDemoSandbox } = useAuth();

  if (!isDemoSandbox) return null;

  const currentRole = user?.role || 'STUDENT';

  return (
    <div
      role="region"
      aria-label="Demo Showcase Mode Announcement"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-3 sm:px-6 py-2.5 shadow-md sticky top-0 z-50 text-xs sm:text-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Indicator & Description */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold text-[11px] uppercase tracking-wider flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Showcase Sandbox</span>
          </div>

          <div className="truncate text-slate-300 text-xs">
            Viewing as <strong className="text-white capitalize">{currentRole.toLowerCase()}</strong> ({user?.name || 'Demo User'})
            <span className="hidden lg:inline text-slate-400 ml-1.5">
              • Institutional data is isolated (mutations affect local session only)
            </span>
          </div>
        </div>

        {/* Right: Switch Role Pills & Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Role Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            {ROLES.map(({ role, label }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => enterDemoSandbox(role)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Switch to ${label} Showcase`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Exit Demo Button */}
          <button
            type="button"
            onClick={exitDemoSandbox}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            title="Exit Demo Sandbox and return to login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Exit Demo</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default DemoSandboxBanner;
