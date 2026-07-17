export type UserRole = 'customer' | 'driver' | 'admin' | 'warehouse' | 'finance' | 'report' | 'hr_manager' | 'hr_staff' | 'coo' | 'cfo' | 'cmo' | 'ceo' | 'regional_manager' | 'service_point_agent' | 'operations' | 'fleet_manager' | 'account_manager';

export type Permission =
  | 'shipment:create'
  | 'shipment:read'
  | 'shipment:read_all'
  | 'shipment:update'
  | 'shipment:update_all'
  | 'shipment:delete'
  | 'shipment:delete_all'
  | 'shipment:assign'
  | 'user:read'
  | 'user:read_all'
  | 'user:create'
  | 'user:update'
  | 'user:update_all'
  | 'user:delete'
  | 'user:delete_all'
  | 'user:assign_role'
  | 'address:create'
  | 'address:read'
  | 'address:read_all'
  | 'address:update'
  | 'address:update_all'
  | 'address:delete'
  | 'pickup:create'
  | 'pickup:read'
  | 'pickup:read_all'
  | 'pickup:update'
  | 'pickup:update_all'
  | 'pickup:assign'
  | 'reports:view'
  | 'reports:export'
  | 'system:settings'
  | 'system:logs'
  | 'finance:create_invoice'
  | 'finance:view_invoice'
  | 'finance:update_payment'
  | 'finance:generate_reports';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'shipment:create',
    'shipment:read',
    'shipment:update_all',
    'shipment:delete_all',
    'shipment:assign',
    'user:read_all',
    'user:create',
    'user:update_all',
    'user:delete_all',
    'user:assign_role',
    'address:read_all',
    'pickup:read_all',
    'pickup:assign',
    'reports:view',
    'reports:export',
    'system:settings',
    'system:logs',
    'finance:create_invoice',
    'finance:view_invoice',
    'finance:update_payment',
    'finance:generate_reports'
  ],
  customer: [
    'shipment:create',
    'shipment:read',
    'shipment:update',
    'address:create',
    'address:read',
    'address:update',
    'address:delete',
    'pickup:create',
    'pickup:read',
    'pickup:update'
  ],
  driver: [
    'shipment:read',
    'shipment:update',
    'pickup:read',
    'pickup:update'
  ],
  finance: [
    'finance:create_invoice',
    'finance:view_invoice',
    'finance:update_payment',
    'finance:generate_reports',
    'reports:view',
    'reports:export',
    'shipment:read_all',
    'user:read_all'
  ],
  report: [
    'reports:view',
    'reports:export',
    'shipment:read_all',
    'finance:view_invoice'
  ],
  warehouse: [
    'shipment:read_all',
    'shipment:update',
    'pickup:read_all',
    'pickup:update',
    'user:read',
    'system:logs'
  ],

 hr_manager: [
    'user:read_all',
    'user:update_all',
    'reports:view',
    'reports:export',
    'shipment:read_all',
    'system:logs',
  ],
  hr_staff: [
    'user:read',
    'reports:view',
    'shipment:read',
  ],
  service_point_agent: [
    'shipment:create',
    'shipment:read_all',
    'user:read_all',
    'finance:view_invoice',
    'finance:create_invoice',
    'finance:update_payment',

  ],
  operations: [
    'shipment:read_all',
    'shipment:update_all',
    'user:read_all',
    'system:logs',
  ],
  fleet_manager: [
    'shipment:read_all',
    'shipment:update_all',
    'user:read_all',
  ],  
  account_manager: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'         
],
coo: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'         
], 
cfo: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'         
],
cmo: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'  
],
ceo: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'  
],
regional_manager: [
  'shipment:read_all',      
  'shipment:update',        
  'user:read_all',          
  'finance:view_invoice',   
  'reports:view',           
  'address:read_all',       
  'pickup:read_all'  
],

};

export function hasPermission(
  user: { role: UserRole; secondaryRoles?: UserRole[] } | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false;
  const primaryHas = ROLE_PERMISSIONS[user.role]?.includes(permission);
  if (primaryHas) return true;
  const secondary = user.secondaryRoles || [];
  return secondary.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}