import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute Component
 * Protects role-specific routes and dashboards within CareerBridge.
 *
 * If the user is unauthenticated:
 *   Redirects to /login with replace: true.
 *
 * If the user is authenticated but attempts to navigate to a route
 * intended for a different role (e.g. Student -> /tpo, Alumni -> /admin):
 *   Gracefully redirects to their own canonical role dashboard
 *   (/student, /alumni, /tpo, /admin) with replace: true.
 *
 * This prevents cross-role dashboard leaks, 403 API errors, and invalid history entries.
 */
export const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const canonicalDashboard = `/${user.role.toLowerCase()}`;
    return <Navigate to={canonicalDashboard} replace />;
  }

  return children;
};

export default RoleRoute;
