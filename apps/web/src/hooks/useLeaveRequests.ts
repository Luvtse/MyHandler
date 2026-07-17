// src/hooks/useLeaveRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useAuth } from '@/features/auth/hooks';

// =====================
// Type Definitions
// =====================

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysPerYear: number | null;
  remainingDays: number | null;
  usedDays: number;
  requiresDocumentation: boolean;
  color?: string;
  icon?: string;
}

export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalanceSummary {
  annualLeave: LeaveBalance;
  sickLeave: LeaveBalance;
  personalLeave: LeaveBalance;
}

export interface LeaveApprover {
  id: string;
  name: string;
  email: string | null;
  departmentId: string | null;
  role?: string;
}

export interface LeaveApproversData {
  managers: LeaveApprover[];
  hrStaff: LeaveApprover[];
  backupEmployees: LeaveApprover[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    user?: { id: string; name: string; email: string; };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  emergencyContact?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  managerApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrApproval: 'PENDING' | 'APPROVED' | 'REJECTED';
  managerId?: string;
  hrId?: string;
  backupEmployeeId?: string;
  createdAt: string;
  updatedAt?: string;
  managerApprovedAt?: string;
  hrApprovedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  managerComments?: string;
  hrComments?: string;
  rejectionReason?: string;
}

export interface LeaveRequestListResponse {
  leaves: LeaveRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateLeaveRequestInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  emergencyContact?: string;
  backupEmployeeId?: string;
  managerId: string;
  hrId: string;
  documents?: File[];
}

export interface UpdateLeaveStatusInput {
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}

export interface UpdateLeaveBalanceInput {
  annualLeave?: number;
  sickLeave?: number;
  personalLeave?: number;
}

const ROLES_WITH_FULL_ACCESS = [
  'admin',
  'hr_manager', 
  'ceo',
  'hr_staff',
];

// Safe unwrapper to guarantee type alignment with TanStack Query
// In useLeaveRequests.ts, at the top of the file
function unwrapApiResponse<T>(response: any): T {
  // First: apiService returns { success: true, data: backendResponse }
  let backendResponse = response?.data;
  
  if (!backendResponse) return response as T;
  
  // Now check backend returns { status: 'success', data: ... } OR { success: true, data: ... }
  if (backendResponse.status === 'success' && backendResponse.data !== undefined) {
    return backendResponse.data;
  }
  
  if (backendResponse.success && backendResponse.data !== undefined) {
    return backendResponse.data;
  }

  // Fallback to backendResponse
  return backendResponse;
}

// =====================
// Leave Types & Form Data
// =====================

export const useLeaveTypes = () => {
  return useQuery<LeaveType[]>({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.leaveTypes);
      return unwrapApiResponse<LeaveType[]>(response);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: { errorMessage: 'Unable to load leave types.' },
  });
};

export const useLeaveApprovers = () => {
  return useQuery<LeaveApproversData>({
    queryKey: ['leave-approvers'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.leaves.approvers);
      return unwrapApiResponse<LeaveApproversData>(response);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// =====================
// Leave Balance
// =====================

export const useLeaveBalance = (employeeId?: string) => {
  const { user, isRole } = useAuth();
  
  return useQuery<LeaveBalanceSummary>({
    queryKey: ['leave-balance', employeeId],
    queryFn: async () => {
      // Check if user has full access to view any employee
      const hasFullAccess = ROLES_WITH_FULL_ACCESS.some(role => isRole(role as any));
      
      // If employeeId is provided but user doesn't have full access, block the request
      if (employeeId && !hasFullAccess) {
        throw new Error('You can only view your own leave balance. Only HR, Admin, and Executive roles can view other employees.');
      }
      
      // Make the API call - if employeeId is undefined, URL will be '/hr/leave-balance'
      const response = await apiService.get(API_ENDPOINTS.hr.leaveBalance.get(employeeId));
      return unwrapApiResponse<LeaveBalanceSummary>(response);
    },
    enabled: !!user?.id, // Only fetch when user is logged in
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if (error instanceof Error && error.message.includes('only view your own')) {
        return false;
      }
      return failureCount < 1;
    },
  });
};

// =====================
// Leave Requests CRUD
// =====================

export const useLeaveRequests = (params?: {
  status?: string;
  employeeId?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  departmentId?: string;
  search?: string;
}) => {
  return useQuery<LeaveRequestListResponse>({
    queryKey: ['leave-requests', params],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.leaveRequests.list, { params });
      return unwrapApiResponse<LeaveRequestListResponse>(response);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// =====================
// Employee & Colleagues
// =====================

interface Employee {
  id: string;
  userId?: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

export const useEmployeeSelf = () => {
  return useQuery<Employee>({
    queryKey: ['employee-self'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.employees.self);
      return unwrapApiResponse<Employee>(response);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useColleagues = () => {
  return useQuery<Employee[]>({
    queryKey: ['colleagues'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.employees.colleagues);
      return unwrapApiResponse<Employee[]>(response);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// =====================
// Mutations
// =====================

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<LeaveRequest, Error, CreateLeaveRequestInput>({
    mutationFn: async (data) => {
      const response = await apiService.post(API_ENDPOINTS.hr.leaveRequests.create, data);
      return unwrapApiResponse<LeaveRequest>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

// Alias for EmployeeLeaveInspector
export const useEmployees = useColleagues;

export const usePendingHrApprovals = () => {
  return useQuery<LeaveRequest[]>({
    queryKey: ['pending-hr-approvals'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.leaveRequests.list, {
        params: { status: 'PENDING' }
      });
      const data = unwrapApiResponse<LeaveRequestListResponse>(response);
      return data.leaves.filter(req => req.hrApproval === 'PENDING');
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateHrApproval = () => {
  const queryClient = useQueryClient();
  return useMutation<LeaveRequest, Error, { id: string; status: 'APPROVED' | 'REJECTED'; comments?: string }>({
    mutationFn: async ({ id, status, comments }) => {
      const response = await apiService.patch(API_ENDPOINTS.hr.leaveRequests.approve.hr(id), { status, comments });
      return unwrapApiResponse<LeaveRequest>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-hr-approvals'] });
    },
  });
};
