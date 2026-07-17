// Unified React Query hooks entrypoint
export { useQueryData, useMutationData, usePutMutation, useDeleteMutation } from './useReactQuery';
export { useShipmentQuery, useShipmentsQuery, useCreateShipment, useUpdateShipment } from './useShipmentQuery';
export { useDashboardSummary, useDashboardAnalytics, useRecentActivities } from './useDashboardQuery';

// Optional GraphQL helper using the shared API service
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/api/client';

export function useGraphQL<TData = unknown, TError = Error>(
  queryKey: string[],
  query: string,
  variables?: Record<string, any>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const { success, data, error } = await apiService.graphql<TData>(query, variables);
      if (!success) throw new Error(error || 'GraphQL request failed');
      return data as TData;
    },
    ...options,
  });
}