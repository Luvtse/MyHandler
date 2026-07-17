import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks';
import { useDashboardVisibility } from '@/dashboard/dashboardVisibilityContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  DollarSign,
  FileText,
  Warehouse,
  Settings,
  LogOut,
  Building,
  CheckCircle,
  BarChart3,
  Target,
  MapPin,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  featureKey: string;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['admin', 'customer', 'driver', 'finance', 'report', 'warehouse', 'hr_manager', 'hr_staff', 'service_point_agent', 'operations', 'fleet_manager', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo', 'regional_manager'],
    featureKey: 'overview',
  },
  {
    title: 'User Management',
    href: '/dashboard/users',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin'],
    featureKey: 'user_management',
  },
  {
    title: 'Role Management',
    href: '/dashboard/roles',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin'],
    featureKey: 'role_management',
  },
  {
    title: 'Shipments',
    href: '/dashboard/shipments',
    icon: <Package className="h-5 w-5" />,
    roles: ['admin', 'customer', 'driver', 'warehouse', 'fleet_manager', 'operations', 'regional_manager', 'coo', 'cfo', 'cmo', 'ceo'],
    featureKey: 'shipments',
  },
  {
    title: 'Deliveries',
    href: '/dashboard/deliveries',
    icon: <Truck className="h-5 w-5" />,
    roles: ['driver', 'fleet_manager'],
    featureKey: 'deliveries',
  },
  {
    title: 'Finance',
    href: '/dashboard/finance',
    icon: <DollarSign className="h-5 w-5" />,
    roles: ['admin', 'finance'],
    featureKey: 'finance',
  },
  {
    title: 'Payout Requests',
    href: '/dashboard/finance/payout-requests',
    icon: <DollarSign className="h-5 w-5" />,
    roles: ['admin', 'finance', 'cfo'],
    featureKey: 'finance_payout_requests',
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: <FileText className="h-5 w-5" />,
    roles: ['admin', 'finance', 'report', 'cmo', 'ceo', 'regional_manager', 'coo', 'cfo'],
    featureKey: 'reports',
  },
  {
    title: 'HR',
    href: '/dashboard/hr',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff'],
    featureKey: 'hr_dashboard',
  },
  {
    title: 'Leave Management',
    href: '/dashboard/hr/leave-management',
    icon: <Users className="h-5 w-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff'],
    featureKey: 'leave_management',
  },
  {
    title: 'Warehouse',
    href: '/dashboard/warehouse',
    icon: <Warehouse className="h-5 w-5" />,
    roles: ['admin', 'warehouse'],
    featureKey: 'warehouse',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    roles: ['admin'],
    featureKey: 'settings',
  },
  {
   title: 'Operations',
   href: '/dashboard/operations',
   icon: <Truck className="h-5 w-5" />,
   roles: ['admin', 'operations'],
   featureKey: 'operations_dashboard',
  },
  {
  title: 'Accounts',
  href: '/dashboard/account',
  icon: <Building className="h-5 w-5" />,
  roles: ['admin', 'account_manager'],
  featureKey: 'account_dashboard',
  },
 {
  title: 'Approvals',
  href: '/dashboard/account/approvals',
  icon: <CheckCircle className="h-5 w-5" />,
  roles: ['admin', 'account_manager'],
  featureKey: 'account_approvals',
},
{
  title: 'Analytics',
  href: '/dashboard/account/analytics',
  icon: <BarChart3 className="h-5 w-5" />,
  roles: ['admin', 'account_manager'],
  featureKey: 'account_analytics',
},
{
  title: 'COO Dashboard',
  href: '/dashboard/coo',
  icon: <Truck className="h-5 w-5" />,
  roles: ['admin', 'coo'],
  featureKey: 'coo_dashboard',
},
{
  title: 'CFO Dashboard',
  href: '/dashboard/cfo',
  icon: <DollarSign className="h-5 w-5" />,
  roles: ['admin', 'cfo'],
  featureKey: 'cfo_dashboard',
},
{
  title: 'Growth Dashboard',
  href: '/dashboard/cmo',
  icon: <BarChart3 className="h-5 w-5" />,
  roles: ['admin', 'cmo', 'account_manager', 'coo', 'cfo', 'ceo'], // ← Both roles
  featureKey: 'cmo_dashboard',
},
{
  title: 'CEO Dashboard',
  href: '/dashboard/ceo',
  icon: <Target className="h-5 w-5" />,
  roles: ['admin', 'ceo'],
  featureKey: 'ceo_dashboard',
},
{
  title: 'Regional Dashboard',
  href: '/dashboard/regional/addis_ababa', // Default region
  icon: <MapPin className="h-5 w-5" />,
  roles: ['admin', 'regional_manager', 'coo', 'ceo'],
  featureKey: 'regional_dashboard',
}
];

const DashboardNav = () => {
  const { user, logout } = useAuth();
  const { visibility, isLoading } = useDashboardVisibility();
  const role = user?.role;

  if (isLoading || !visibility || !role) return null;

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles.includes(role)) return false;
    const v = (visibility as any)[role];
    if (v && item.featureKey in v) {
      return v[item.featureKey] !== false;
    }
    return true;
  });

  return (
    <nav className="grid items-start gap-2">
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              isActive ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'transparent'
            )
          }
        >
          {item.icon}
          {item.title}
        </NavLink>
      ))}
      <Button
        variant="ghost"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        onClick={logout}
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </nav>
  );
};

export default DashboardNav;
