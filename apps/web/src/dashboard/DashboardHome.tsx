
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { Loader2 } from 'lucide-react';

const DashboardHome = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !user.role) return;

    // Multi-role user handling (Express Centre Representatives)
    if (user.secondaryRoles && user.secondaryRoles.length > 0) {
      navigate('/dashboard/admin', { replace: true });
      return;
    }

    // Redirect based on user's primary role
    switch (user.role) {
      case 'customer':
        navigate('/dashboard/customer', { replace: true });
        break;
      case 'driver':
        navigate('/dashboard/driver', { replace: true });
        break;
      case 'admin':
        navigate('/dashboard/admin', { replace: true });
        break;
      case 'report':
        navigate('/dashboard/reports', { replace: true });
        break;
      case 'warehouse':
        navigate('/dashboard/warehouse', { replace: true });
        break;
      case 'finance':
        navigate('/dashboard/finance', { replace: true });
        break;
      case 'service_point_agent':
        navigate('/dashboard/service-point', { replace: true });
        break;
      case 'hr_manager':
      case 'hr_staff':
        navigate('/dashboard/hr', { replace: true });
        break;
      case 'operations':
        navigate('/dashboard/operations', { replace: true });
        break;
      case 'account_manager':
        navigate('/dashboard/account', { replace: true });
        break;
      case 'fleet_manager':
        navigate('/dashboard/fleet-manager', { replace: true });
        break;
      case 'regional_manager':
        navigate(`/dashboard/regional/${user.region || 'addis_ababa'}`, { replace: true });
        break;
      case 'coo':
        navigate('/dashboard/coo', { replace: true });
        break;
      case 'cfo':
        navigate('/dashboard/cfo', { replace: true });
        break;
      case 'cmo':
        navigate('/dashboard/cmo', { replace: true });
        break;
      case 'ceo':
        navigate('/dashboard/ceo', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
        break;
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="mt-4 text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardHome;
