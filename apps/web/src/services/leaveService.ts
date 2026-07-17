import { apiService, apiRequestData } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/endpoints';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  managerId?: string;
  managerApproval?: ApprovalStatus;
  managerApprovedAt?: string;
  managerComments?: string;
  hrId?: string;
  hrApproval?: ApprovalStatus;
  hrApprovedAt?: string;
  hrComments?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  emergencyContact?: string;
  backupEmployeeId?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    department?: {
      id: string;
      name: string;
    };
  };
  manager?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  hr?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  backupEmployee?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface LeaveBalance {
  annualLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  sickLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  personalLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  maternityLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  paternityLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  bereavementLeave: {
    total: number;
    used: number;
    remaining: number;
  };
}

export interface CreateLeaveRequestData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  emergencyContact?: string;
  backupEmployeeId?: string;
}

export interface UpdateLeaveStatusData {
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  rejectionReason?: string;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT' | 'PERSONAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequestsResponse {
  leaves: LeaveRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class LeaveService {
  private basePath = '/hr';

  /**
   * Create a new leave request
   */
  async createLeaveRequest(data: CreateLeaveRequestData): Promise<LeaveRequest> {
    return await apiRequestData<LeaveRequest>({ method: 'POST', url: `${this.basePath}/leave-requests`, data });
  }

  /**
   * Get all leave requests with optional filtering
   */
  async getLeaveRequests(params?: {
    status?: string;
    employeeId?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<LeaveRequestsResponse> {
    return await apiRequestData<LeaveRequestsResponse>({ method: 'GET', url: `${this.basePath}/leave-requests`, params });
  }

  /**
   * Get a specific leave request by ID
   */
  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    return await apiRequestData<LeaveRequest>({ method: 'GET', url: `${this.basePath}/leave-requests/${id}` });
  }

  /**
   * Update manager approval status
   */
  async updateManagerApproval(id: string, data: UpdateLeaveStatusData): Promise<LeaveRequest> {
    return await apiRequestData<LeaveRequest>({ method: 'PATCH', url: `${this.basePath}/leave-requests/${id}/manager-approval`, data });
  }

  /**
   * Update HR approval status
   */
  async updateHrApproval(id: string, data: UpdateLeaveStatusData): Promise<LeaveRequest> {
    return await apiRequestData<LeaveRequest>({ method: 'PATCH', url: `${this.basePath}/leave-requests/${id}/hr-approval`, data });
  }

  /**
   * Get leave balance for an employee
   */
  async getLeaveBalance(employeeId?: string): Promise<LeaveBalance> {
    const url = employeeId 
      ? `${this.basePath}/leave-balance/${employeeId}`
      : `${this.basePath}/leave-balance`;
    
    return await apiRequestData<LeaveBalance>({ method: 'GET', url });
  }

  /**
   * Update leave balance (Admin/HR only)
   */
  async updateLeaveBalance(employeeId: string, data: Partial<LeaveBalance>): Promise<any> {
    return await apiRequestData<any>({ method: 'PATCH', url: `${this.basePath}/leave-balance/${employeeId}`, data });
  }

  /**
   * Delete a leave request (Admin only)
   */
  async deleteLeaveRequest(id: string): Promise<void> {
    const { success, error } = await apiService.request<unknown>({ method: 'DELETE', url: `${this.basePath}/leave-requests/${id}` });
    if (!success) throw new Error(error || 'Failed to delete leave request');
  }

  /**
   * Get leave requests that need manager approval
   */
  async getPendingManagerApprovals(managerId: string): Promise<LeaveRequest[]> {
    const response = await this.getLeaveRequests({
      status: 'PENDING',
      page: 1,
      limit: 100,
    });
    
    return response.leaves.filter(leave => 
      leave.managerId === managerId && leave.managerApproval === 'PENDING'
    );
  }

  /**
   * Get leave requests that need HR approval
   */
  async getPendingHrApprovals(): Promise<LeaveRequest[]> {
    const response = await this.getLeaveRequests({
      status: 'PENDING',
      page: 1,
      limit: 100,
    });
    
    return response.leaves.filter(leave => 
      leave.managerApproval === 'APPROVED' && leave.hrApproval === 'PENDING'
    );
  }

  /**
   * Get leave statistics for dashboard
   */
  async getLeaveStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  }> {
    const [allRequests, pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
      this.getLeaveRequests({ page: 1, limit: 1 }),
      this.getLeaveRequests({ status: 'PENDING', page: 1, limit: 1 }),
      this.getLeaveRequests({ status: 'APPROVED', page: 1, limit: 1 }),
      this.getLeaveRequests({ status: 'REJECTED', page: 1, limit: 1 }),
    ]);

    return {
      totalRequests: allRequests.pagination.total,
      pendingRequests: pendingRequests.pagination.total,
      approvedRequests: approvedRequests.pagination.total,
      rejectedRequests: rejectedRequests.pagination.total,
    };
  }
}

export const leaveService = new LeaveService();
