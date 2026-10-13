import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { ArrowRight, LogOut, User } from 'lucide-react';

/**
 * Reusable Navbar Component
 * - Public Landing Page: displays only the CareerBridge Logo on the left and 'Log In' + 'Get Started' on the right.
 * - Authenticated: displays user notification bell, dashboard shortcut, profile badge, and logout.
 */
export const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo (Preserved official original CareerBridge logo asset) */}
          <div className="flex-shrink-0">
            <BrandLogo size="default" />
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationDropdown />

                <Button
                  to={`/${user.role.toLowerCase()}`}
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="hidden sm:inline-flex"
                >
                  Open Dashboard
                </Button>

                <Link
                  to={`/${user.role.toLowerCase()}`}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-bold text-[#172033] leading-tight truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#4F46E5] uppercase">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public Navbar Actions: Only 'Log In' and 'Get Started' */
              <div className="flex items-center gap-2 sm:gap-3">
                <Button to="/login" variant="ghost" size="sm">
                  Log In
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
