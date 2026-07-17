import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';

type Role = 'admin' | 'user' | 'manager' | 'guest';

interface RoleBasedRouteProps {
  allowedRoles: Role[];
  redirectPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  redirectPath = '/login',
}) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If user has no role or role is not in allowed roles, redirect
  if (!user?.role || !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has allowed role
  return <Outlet />;
};

export default RoleBasedRoute;