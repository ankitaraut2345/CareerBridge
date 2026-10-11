import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RootRedirect Component
 * - If user is authenticated, immediately routes to their respective role dashboard:
 *   STUDENT -> /student
 *   ALUMNI  -> /alumni
 *   TPO     -> /tpo
 *   ADMIN   -> /admin
 * - If user is not authenticated, immediately routes to /login (with 1-click Quick Access for all 4 roles),
 *   completely bypassing the obsolete public landing page.
 */
export const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to CareerBridge Portal...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    const rolePath = user.role.toLowerCase();
    return <Navigate to={`/${rolePath}`} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RootRedirect;
