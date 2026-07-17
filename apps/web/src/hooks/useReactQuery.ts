import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiService } from '@/lib/api/client';
import { useEffect } from 'react';

// Using the shared apiClient instance exported from the API client module

// Generic type for API responses
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// Hook for GET requests with React Query
type ExtendedQueryOptions<TData, TError> = Omit<UseQueryOptions<TData, TError, TData, readonly unknown[]>, 'queryKey' | 'queryFn'> & {
  onError?: (error: TError) => void;
  keepPreviousData?: boolean;
};

export function useQueryData<TData = unknown, TError = AxiosError>(
  queryKey: readonly unknown[],
  endpoint: string,
  options?: ExtendedQueryOptions<TData, TError>
) {
  const { onError, keepPreviousData, ...rqOptions } = options || {};

  const result = useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const { success, data, error } = await apiService.request<TData>({ method: 'GET', url: endpoint });
      if (!success) throw new Error(error || 'Request failed');
      return data as TData;
    },
    ...(keepPreviousData
      ? {
          placeholderData: (previousData => previousData as TData) as any,
        }
      : {}),
    ...rqOptions,
  });

  useEffect(() => {
    if (onError && result.isError && result.error) {
      onError(result.error as unknown as TError);
    }
  }, [onError, result.isError, result.error]);

  return result;
}

// Hook for POST requests with React Query
export function useMutationData<TData = unknown, TVariables = unknown, TError = AxiosError>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const { success, data, error } = await apiService.request<TData>({ method: 'POST', url: endpoint, data: variables });
      if (!success) throw new Error(error || 'Request failed');
      return data as TData;
    },
    ...options,
  });
}

export function usePutMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const { success, data, error } = await apiService.request<TData>({ method: 'PUT', url: endpoint, data: variables });
      if (!success) throw new Error(error || 'Request failed');
      return data as TData;
    },
    ...options,
  });
}

export function useDeleteMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const { success, data, error } = await apiService.request<TData>({ method: 'DELETE', url: endpoint, data: variables });
      if (!success) throw new Error(error || 'Request failed');
      return data as TData;
    },
    ...options,
  });
}

// Hook for PUT requests with React Query
// Removed duplicate implementations