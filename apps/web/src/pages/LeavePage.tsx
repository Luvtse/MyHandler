// src/pages/LeavePage.tsx
import { useAuth } from '@/features/auth/hooks';
import { IS_LEAVE_ELIGIBLE } from '@/dashboard/hr/views/constants';
import { EmployeeLeaveView } from '@/dashboard/hr/views/EmployeeLeaveView';
import { HrLeaveView } from '@/dashboard/hr/views/HrLeaveView';
import { AdminLeaveView } from '@/dashboard/hr/views/AdminLeaveView';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const LeavePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Block customers
  if (user.role === 'customer') {
    return <Navigate to="/dashboard" replace />;
  }

  // HR roles → HR view
  if (user.role === 'hr_manager' || user.role === 'hr_staff') {
    return <HrLeaveView />;
  }

  // Admin → full power
  if (user.role === 'admin') {
    return <AdminLeaveView />;
  }

  // All other internal roles → employee self-service
  if (IS_LEAVE_ELIGIBLE(user.role)) {
    return <EmployeeLeaveView />;
  }

  // Fallback for unauthorized roles
  return <Navigate to="/dashboard" replace />;
};