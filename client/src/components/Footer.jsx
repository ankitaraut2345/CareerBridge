import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

/**
 * Reusable Footer Component
 * Clean modern footer with quick links, role portals, and ecosystem tagline.
 */
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="default" showTagline={false} />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              CareerBridge is the unified campus career ecosystem connecting Students, Alumni,
              TPOs, and Admins for placements, internships, mentorship, and career growth.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Status: All Services Operational
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-4">
              Platform Portals
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/student" className="hover:text-[#4F46E5] transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/alumni" className="hover:text-[#4F46E5] transition-colors">
                  Alumni Network
                </Link>
              </li>
              <li>
                <Link to="/tpo" className="hover:text-[#4F46E5] transition-colors">
                  TPO Placement Cell
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#4F46E5] transition-colors">
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-4">
              Account &amp; Access
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-[#4F46E5] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#4F46E5] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CareerBridge. All rights reserved.</p>
          <p className="font-medium text-slate-600">
            Tagline: <span className="italic">Where Talent Meets Opportunity &amp; the Right Guidance</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
