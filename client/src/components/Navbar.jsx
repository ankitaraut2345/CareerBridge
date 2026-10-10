import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { Menu, X, ArrowRight, LogOut, User, Bell } from 'lucide-react';

/**
 * Reusable Navbar Component
 * Fully responsive with desktop navigation and mobile drawer.
 */
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const getOpportunitiesPath = () => {
    if (user?.role === 'TPO' || user?.role === 'ADMIN') return '/tpo/opportunities';
    return '/student/opportunities';
  };

  const navLinks = [
    ...(isAuthenticated && user?.role
      ? [{ name: 'Dashboard', path: `/${user.role.toLowerCase()}` }]
      : [{ name: 'Home', path: '/' }]),
    { name: 'Opportunities', path: getOpportunitiesPath() },
    ...(user?.role === 'STUDENT'
      ? [
          { name: 'Applications', path: '/student/applications' },
          { name: 'Referrals', path: '/student/referrals' },
          { name: 'Find Mentors', path: '/student/mentors' },
          { name: 'Mentorship', path: '/student/mentorship' },
          { name: 'Messages', path: '/student/chat' },
        ]
      : []),
    ...(user?.role === 'ALUMNI'
      ? [
          { name: 'Referrals Hub', path: '/alumni/referrals' },
          { name: 'Mentorship Hub', path: '/alumni/mentorship' },
          { name: 'Messages', path: '/alumni/chat' },
          { name: 'Alumni Network', path: '/alumni' },
        ]
      : user?.role === 'STUDENT'
      ? []
      : [{ name: 'Alumni Network', path: '/alumni' }]),
    { name: 'TPO Portal', path: '/tpo' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <BrandLogo size="default" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[#4F46E5] font-semibold'
                      : 'text-slate-600 hover:text-[#172033]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                <Link
                  to={`/${user.role.toLowerCase()}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left">
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
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu & Notification Bell */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-[#172033] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-[#4F46E5] hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm font-semibold text-[#4F46E5] flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </Link>

                <Link
                  to={`/${user.role.toLowerCase()}`}
                  onClick={closeMenu}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#172033] flex items-center justify-between"
                >
                  <span>{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline" size="md" fullWidth onClick={closeMenu}>
                  Log In
                </Button>
                <Button to="/register" variant="primary" size="md" fullWidth onClick={closeMenu}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
