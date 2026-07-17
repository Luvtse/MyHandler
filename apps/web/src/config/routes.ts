import { UserRole } from '@/types/auth';

interface Route {
  path: string;
  component: string;
  permission?: string;
  roles?: UserRole[];
}

export const PUBLIC_ROUTES: Route[] = [
  {
    path: '/',
    component: 'Index',
  },
  {
    path: '/tracking',
    component: 'Tracking',
  },
  {
    path: '/support',
    component: 'Support',
  },
  {
    path: '/login',
    component: 'Login',
  },
  {
    path: '/register',
    component: 'Register',
  },
  {
    path: '/express-delivery',
    component: 'services/ExpressDelivery',
  },
  {
    path: '/standard-shipping',
    component: 'services/StandardShipping',
  },
  {
    path: '/international',
    component: 'services/International',
  },
  {
    path: '/secure-shipping',
    component: 'services/SecureShipping',
  },
  {
    path: '/time-definite',
    component: 'services/TimeDefinite',
  },
  {
    path: '/cargo',
    component: 'services/Cargo',
  },
  {
    path: '/warehousing',
    component: 'services/Warehousing',
  },
  {
    path: '/about',
    component: 'company/About',
  },
  {
    path: '/careers',
    component: 'company/Careers',
  },
  {
    path: '/news',
    component: 'company/News',
  },
  {
    path: '/sustainability',
    component: 'company/Sustainability',
  },
  {
    path: '/terms',
    component: 'company/Terms',
  },
];

export const PROTECTED_ROUTES: Route[] = [
  {
    path: '/dashboard',
    component: 'dashboard/DashboardLayout',
    roles: ['admin', 'customer', 'driver', 'finance', 'report', 'warehouse', 'hr_manager', 'hr_staff', 'service_point_agent', 'operations', 'fleet_manager', 'account_manager'],
  },
  {
    path: '/dashboard/driver/schedule',
    component: 'dashboard/driver/DriverSchedule',
    roles: ['driver'],
  },
  {
    path: '/shipments',
    component: 'ShipmentsManagement',
    permission: 'shipment:read',
  },
  {
    path: '/users',
    component: 'UsersManagement',
    permission: 'user:read_all',
  },
  {
    path: '/reports',
    component: 'ReportsPage',
    permission: 'reports:view',
  },
  {
    path: '/create-shipment',
    component: 'CreateShipment',
    permission: 'shipment:create',
  },
];

export const ROLE_DASHBOARDS: Partial<Record<UserRole, string>> = {
  admin: 'AdminDashboard',
  customer: 'CustomerDashboard',
  driver: 'DriverDashboard',
  warehouse: 'WarehouseDashboard',
  finance: 'FinanceDashboard',
  report: 'ReportDashboard',
  hr_manager: 'HRDashboard',
  hr_staff: 'HRDashboard',
  service_point_agent: 'ServicePointDashboard',
  operations: 'OperationsDashboard',
  fleet_manager: 'FleetManagerDashboard',
  account_manager: 'AccountManagerDashboard',
  coo: 'AdminDashboard',
  cfo: 'FinanceDashboard',
  cmo: 'AdminDashboard',
  ceo: 'AdminDashboard',
  regional_manager: 'OperationsDashboard',
};