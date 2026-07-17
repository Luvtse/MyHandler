
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { Permission, UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ 
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, hasPermission, isRole } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to dashboard if missing specific permission
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && !isRole(requiredRole)) {
    // Redirect to dashboard if missing specific role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
