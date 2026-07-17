import { useQueryData } from './useReactQuery';
import { useToast } from './use-toast';

/**
 * Custom hook for fetching dashboard summary data with React Query
 */
export interface DashboardSummary {
  totalShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  averageOrderValue: number;
  profitMargin: number;
  onTimeDeliveryRate: number;
  delayedShipments: number;
}

export function useDashboardSummary() {
  const { toast } = useToast();
  
  return useQueryData<DashboardSummary>(
    ['dashboard-summary'],
    '/dashboard/summary',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch dashboard data',
          variant: 'destructive',
        });
      }
    }
  );
}

/**
 * Custom hook for fetching dashboard analytics data with React Query
 */
export function useDashboardAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const { toast } = useToast();
  
  return useQueryData(
    ['dashboard-analytics', period],
    `/dashboard/analytics?period=${period}`,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch analytics data',
          variant: 'destructive',
        });
      }
    }
  );
}

/**
 * Custom hook for fetching recent activities with React Query
 */
export function useRecentActivities(limit = 5) {
  const { toast } = useToast();
  
  return useQueryData(
    ['recent-activities', limit],
    `/dashboard/activities?limit=${limit}`,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch recent activities',
          variant: 'destructive',
        });
      }
    }
  );
}
