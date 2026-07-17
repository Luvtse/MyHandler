// src/features/leave/constants.ts
import { UserRole } from '@/types/auth';

export const LEAVE_ELIGIBLE_ROLES: UserRole[] = [
  'driver',
  'warehouse',
  'finance',
  'service_point_agent',
  'operations',
  'fleet_manager',
  'account_manager',
  'coo',
  'cfo',
  'cmo',
  'ceo',
  'regional_manager',
  // Add more as needed
];

export const IS_LEAVE_ELIGIBLE = (role: UserRole): boolean => {
  return LEAVE_ELIGIBLE_ROLES.includes(role);
};