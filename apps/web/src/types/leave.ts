export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface EmployeeSummary {
  name: string
  email: string
  department?: string
}

export interface BackupEmployee {
  id?: string
  name: string
}

export interface LeaveTypeSummary {
  name: string
  code?: string
}

export interface LeaveType {
  id: string
  name: string
  code?: string
}

export interface LeaveRequest {
  id: string
  employee: EmployeeSummary
  leaveType: LeaveTypeSummary
  totalDays: number
  startDate: string | Date
  endDate: string | Date
  reason?: string | null
  emergencyContact?: string | null
  backupEmployee?: BackupEmployee | null
  managerApproval: ApprovalStatus
  hrApproval: ApprovalStatus
  status: ApprovalStatus
}

export interface LeaveRequestApproval {
  id: string
  approvalStatus: ApprovalStatus
}

export interface LeaveRequestCalendar {
  id: string
  approvalStatus: ApprovalStatus
}

export interface LeaveStats {
  total: number
  approved: number
  rejected: number
}
