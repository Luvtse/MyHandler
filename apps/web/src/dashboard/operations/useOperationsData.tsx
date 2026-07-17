// @/dashboard/operations/hooks/useOperationsData.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';
import type { ShipmentFlowItem, SLAData, Incident } from '@/types/operations'; // ✅ Explicit import

export interface OperationsSnapshot {
  shipments: ShipmentFlowItem[];
  sla: SLAData;
  incidents: Incident[];
  lastUpdated: string; // client-side freshness timestamp
}

interface OperationsDataState {
  data: OperationsSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOperationsData = (): OperationsDataState => {
  const [data, setData] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const [shipmentsRes, slaRes, incidentsRes] = await Promise.all([
        apiService.request<{ data: ShipmentFlowItem[] }>({ url: '/ops/shipments/live' }),
        apiService.request<{ data: SLAData }>({ url: '/ops/sla' }),
        apiService.request<{ data: Incident[] }>({ url: '/ops/incidents/active' }),
      ]);

      // Enforce atomic consistency — all or nothing
      if (!shipmentsRes.success || !slaRes.success || !incidentsRes.success) {
        throw new Error('Failed to load complete operations snapshot');
      }

      const snapshot: OperationsSnapshot = {
        shipments: shipmentsRes.data.data,
        sla: slaRes.data.data,
        incidents: incidentsRes.data.data,
        lastUpdated: new Date().toISOString(), // UI freshness indicator
      };

      setData(snapshot);
      toast.success('Operations data refreshed', { id: 'ops-refresh' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error loading operations data';
      setError(msg);
      toast.error(msg, { id: 'ops-error' });
      console.error('[useOperationsData] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchData(true),
  };
};