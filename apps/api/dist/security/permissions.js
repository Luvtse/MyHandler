"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.ROLE_PERMISSIONS = {
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
        'finance:generate_reports',
        'service_point:use'
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
        'hr:access'
    ],
    hr_staff: [
        'user:read',
        'reports:view',
        'shipment:read',
        'hr:access'
    ],
    service_point_agent: [
        'shipment:create',
        'shipment:read_all',
        'user:read_all',
        'finance:view_invoice',
        'finance:create_invoice',
        'finance:update_payment',
        'service_point:use'
    ],
    operations: [
        'shipment:read_all',
        'shipment:update_all',
        'user:read_all',
        'system:logs',
        'hr:access'
    ],
    fleet_manager: [
        'shipment:read_all',
        'shipment:update_all',
        'user:read_all',
        'system:logs',
        'hr:access'
    ],
    account_manager: [
        'user:read_all',
        'user:update_all',
        'reports:view',
        'reports:export',
        'shipment:read_all',
        'system:logs',
        'hr:access'
    ],
    coo: [
        'user:read_all',
        'user:update_all',
        'reports:view',
        'reports:export',
        'shipment:read_all',
        'system:logs',
        'hr:access'
    ],
    cfo: [
        'user:read_all',
        'user:update_all',
        'reports:view',
        'reports:export',
        'shipment:read_all',
        'system:logs',
        'hr:access'
    ]
};
function hasPermission(user, permission) {
    if (!user)
        return false;
    const primaryHas = exports.ROLE_PERMISSIONS[user.role]?.includes(permission);
    if (primaryHas)
        return true;
    const secondary = user.secondaryRoles || [];
    return secondary.some((role) => exports.ROLE_PERMISSIONS[role]?.includes(permission));
}
