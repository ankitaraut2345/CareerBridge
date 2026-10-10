import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context';

/**
 * Protects a route based on authentication state and allowed roles.
 * If the user is not logged in → redirect to /login.
 * If the user is logged in but lacks a required role → redirect to /unauthorized.
 */
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // could render a spinner here

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
