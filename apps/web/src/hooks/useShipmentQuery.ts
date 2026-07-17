import { useQueryData, useMutationData } from './useReactQuery';
import { useMutation } from '@tanstack/react-query';
import { apiService, apiRequestData } from '@/lib/api/client';
import { Shipment } from '@/types/shared';
import { useToast } from './use-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Custom hook for fetching shipment data with React Query
 */
export function useShipmentQuery(shipmentId?: string) {
  const { toast } = useToast();
  
  return useQueryData<Shipment>(
    ['shipment', shipmentId || ''],
    shipmentId ? API_ENDPOINTS.shipments.details(shipmentId) : API_ENDPOINTS.shipments.list,
    {
      enabled: !!shipmentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch shipment data',
          variant: 'destructive',
        });
      }
    }
  );
}

/**
 * Custom hook for fetching multiple shipments with React Query
 */
export function useShipmentsQuery(page = 1, limit = 10, filters?: Record<string, any>) {
  const { toast } = useToast();
  
  // Create query string from filters
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  return useQueryData<{ data: Shipment[], total: number, page: number, limit: number }>(
    ['shipments', page, limit, JSON.stringify(filters)],
    `${API_ENDPOINTS.shipments.list}?${queryParams.toString()}`,
    {
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000, // 3 minutes
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch shipments',
          variant: 'destructive',
        });
      }
    }
  );
}

/**
 * Custom hook for creating a new shipment with React Query
 */
export function useCreateShipment() {
  const { toast } = useToast();
  
  return useMutationData<Shipment, Partial<Shipment>>(
    API_ENDPOINTS.shipments.create,
    {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Shipment created successfully',
        });
      },
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to create shipment',
          variant: 'destructive',
        });
      }
    }
  );
}

/**
 * Custom hook for updating a shipment with React Query
 */
export function useUpdateShipment(shipmentId?: string) {
  const { toast } = useToast();
  
  return useMutation<Shipment, Error, Partial<Shipment>>({
    mutationFn: async (data) => {
      if (!shipmentId) throw new Error('Missing shipmentId');
      const { success, data: resp, error } = await apiService.request<Shipment>({
        method: 'PUT',
        url: API_ENDPOINTS.shipments.update(shipmentId),
        data,
      });
      if (!success || !resp) throw new Error(error || 'Request failed');
      return resp;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Shipment updated successfully',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update shipment',
        variant: 'destructive',
      });
    }
  });
}
