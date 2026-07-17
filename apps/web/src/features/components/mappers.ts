// src/features/leave/utils/mappers.ts
import { LeaveRequest as ApiLeaveRequest } from '@/services/leaveService';
import { LeaveBalance as ApiLeaveBalance } from '@/services/leaveService';

export interface UiLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department?: string;
  leaveType: string;
  leaveTypeName: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  reason?: string;
  emergencyContact?: string;
  backupEmployeeName?: string;
  managerApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UiLeaveBalanceItem {
  leaveType: string;
  used: number;
  total: number;
  remaining: number;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
  BEREAVEMENT: 'Bereavement Leave',
  PERSONAL: 'Personal Leave',
};

export const mapApiToUiLeaveRequest = (api: ApiLeaveRequest): UiLeaveRequest => ({
  id: api.id,
  employeeId: api.employeeId,
  employeeName: api.employee.user.name,
  employeeEmail: api.employee.user.email,
  department: api.employee.department?.name,
  leaveType: api.leaveType,
  leaveTypeName: LEAVE_TYPE_LABELS[api.leaveType] || api.leaveType,
  totalDays: api.totalDays,
  startDate: api.startDate,
  endDate: api.endDate,
  reason: api.reason,
  emergencyContact: api.emergencyContact,
  backupEmployeeName: api.backupEmployee?.user.name,
  managerApproval: api.managerApproval || 'PENDING',
  hrApproval: api.hrApproval || 'PENDING',
  status: api.status,
});

export const mapApiToUiLeaveBalance = (api: ApiLeaveBalance): UiLeaveBalanceItem[] => {
  const mapping = [
    { key: 'annualLeave', label: 'Annual Leave' },
    { key: 'sickLeave', label: 'Sick Leave' },
    { key: 'personalLeave', label: 'Personal Leave' },
    { key: 'maternityLeave', label: 'Maternity Leave' },
    { key: 'paternityLeave', label: 'Paternity Leave' },
    { key: 'bereavementLeave', label: 'Bereavement Leave' },
  ] as const;

  return mapping.map(({ key, label }) => {
    const entry = api[key as keyof typeof api];
    if (!entry || !('total' in entry)) return null;
    return {
      leaveType: label,
      used: entry.used,
      total: entry.total,
      remaining: entry.remaining ?? entry.total - entry.used,
    };
  }).filter(Boolean) as UiLeaveBalanceItem[];
};