import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';

/**
 * Role-based access control component for HR dashboard
 * Restricts access based on user roles
 */
const HRRoleGuard = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (!allowedRoles || user.role === 'admin') return children;
  const hasRequiredRole = Array.isArray(allowedRoles) ? allowedRoles.includes(user.role) : user.role === allowedRoles;
  if (!hasRequiredRole) return <Navigate to="/dashboard" replace />;
  return children;
};

export default HRRoleGuard;
