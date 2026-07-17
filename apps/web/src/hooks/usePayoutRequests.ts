import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/client';

// Payout Request Interfaces
export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bankAccount?: string;
  mobileNumber?: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreatePayoutRequestData {
  amount: number;
  currency?: string;
  paymentMethod: string;
  bankAccount?: string;
  mobileNumber?: string;
  description: string;
}

export interface UpdatePayoutRequestStatusData {
  status: string;
  rejectionReason?: string;
  notes?: string;
}

// Payout Request Hooks
export const usePayoutRequests = (params?: {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<PayoutRequest[]>({
    queryKey: ['payoutRequests', params],
    queryFn: async () => {
      const { success, data } = await apiService.request<{ data: PayoutRequest[] }>({ method: 'GET', url: '/finance/payout-requests', params });
      return (success && (data as any)?.data) || [];
    },
  });
};

export const usePayoutRequest = (id: string) => {
  return useQuery<PayoutRequest | null>({
    queryKey: ['payoutRequest', id],
    queryFn: async () => {
      const { success, data } = await apiService.request<{ data: PayoutRequest }>({ method: 'GET', url: `/finance/payout-requests/${id}` });
      return (success && (data as any)?.data) || null;
    },
    enabled: !!id,
  });
};

export const useCreatePayoutRequest = () => {
  return useMutation<{ data: PayoutRequest }, { message: string }, CreatePayoutRequestData>({
    mutationFn: async (body) => {
      const { success, data, error } = await apiService.request<{ data: PayoutRequest }>({ method: 'POST', url: '/finance/payout-requests', data: body });
      if (!success) throw { message: error || 'Failed to create payout request' };
      return data as any;
    },
  });
};

export const useUpdatePayoutRequestStatus = () => {
  return useMutation<{ data: PayoutRequest }, { message: string }, { body: UpdatePayoutRequestStatusData; urlParams: { id: string } }>({
    mutationFn: async ({ body, urlParams }) => {
      const { id } = urlParams;
      const { success, data, error } = await apiService.request<{ data: PayoutRequest }>({ method: 'PATCH', url: `/finance/payout-requests/${id}/status`, data: body });
      if (!success) throw { message: error || 'Failed to update payout request status' };
      return data as any;
    },
  });
};

export const useDeletePayoutRequest = () => {
  return useMutation<{ success: boolean }, { message: string }, { id: string }>({
    mutationFn: async ({ id }) => {
      const { success, data, error } = await apiService.request<{ success: boolean }>({ method: 'DELETE', url: `/finance/payout-requests/${id}` });
      if (!success) throw { message: error || 'Failed to delete payout request' };
      return data as any;
    },
  });
};