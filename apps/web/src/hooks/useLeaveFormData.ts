// src/hooks/useLeaveFormData.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// =====================
// Type Definitions
// =====================

export interface Approver {
  id: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
}

export interface LeaveFormData {
  managers: Approver[];
  hrStaff: Approver[];
  backupEmployees: Approver[];
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

export interface LeaveFormDataWithBalance extends LeaveFormData {
  leaveBalance: LeaveBalanceSummary;
  userDepartment?: string;
}

// Safe unwrapper
function unwrapApiResponse<T>(response: any): T {
  if (!response.success || !response.data) {
    throw new Error(response.message || response.error || 'Failed to fetch data');
  }
  return response.data;
}

// =====================
// Hooks
// =====================

/**
 * Fetch form data: approvers (managers, HR, backup employees)
 * GET /api/hr/leaves/approvers
 */
export const useLeaveFormData = () => {
  return useQuery<LeaveFormData>({
    queryKey: ['leave-form-data', 'approvers'],
    queryFn: async () => {
      const response = await apiService.get(API_ENDPOINTS.hr.leaves.approvers);
      return unwrapApiResponse<LeaveFormData>(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Unable to load approvers. Please try again.',
    },
  });
};

/**
 * Fetch employee leave balance
 * GET /api/hr/leave-balance/:employeeId?
 */
export const useLeaveBalance = (employeeId?: string) => {
  return useQuery<LeaveBalanceSummary>({
    queryKey: ['leave-balance', employeeId],
    queryFn: async () => {
      const url = API_ENDPOINTS.hr.leaveBalance.get(employeeId);
      const response = await apiService.get(url);
      const data = unwrapApiResponse<LeaveBalanceSummary>(response);
      
      // Handle nested response structure if backend returns { currentYearBalance: {...} }
      return (data as any).currentYearBalance || data;
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch combined form data with balance (optional convenience hook)
 */
export const useLeaveFormCompleteData = (employeeId?: string) => {
  const formDataQuery = useLeaveFormData();
  const balanceQuery = useLeaveBalance(employeeId);

  const isLoading = formDataQuery.isLoading || balanceQuery.isLoading;
  const isError = formDataQuery.isError || balanceQuery.isError;
  const error = formDataQuery.error || balanceQuery.error;

  const combinedData = formDataQuery.data && balanceQuery.data
    ? {
        ...formDataQuery.data,
        leaveBalance: balanceQuery.data,
      } as LeaveFormDataWithBalance
    : undefined;

  return {
    ...formDataQuery,
    data: combinedData,
    isLoading,
    isError,
    error,
  };
};
