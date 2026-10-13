import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';

/**
 * SmartHomeRouter Component
 * Mounted on route "/" (root of the application)
 *
 * 1. For unauthenticated guests:
 *    Renders the public LandingPage so visitors landing on http://localhost:5173/
 *    see the home page.
 *
 * 2. For authenticated users:
 *    Immediately redirects to their canonical role dashboard
 *    (/student, /alumni, /tpo, /admin) with replace: true.
 *    This completely resolves the issue where pressing the browser Back button
 *    after logging in would mistakenly navigate back to the old landing page or navbar.
 */
export const SmartHomeRouter = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading CareerBridge Portal...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    const rolePath = user.role.toLowerCase();
    return <Navigate to={`/${rolePath}`} replace />;
  }

  return <LandingPage />;
};

export default SmartHomeRouter;
