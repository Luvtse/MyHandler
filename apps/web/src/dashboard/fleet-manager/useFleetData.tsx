// @/dashboard/fleet/hooks/useFleetData.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { toast } from 'sonner';

// Types (reuse or extend from global types)
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'van' | 'truck' | 'motorbike' | 'car';
  status: 'active' | 'maintenance' | 'decommissioned' | 'idle';
  driverId: string | null;
  driverName: string | null;
  lastMaintenance: string; // ISO date
  nextMaintenanceMileage: number;
  currentMileage: number;
  fuelLevel: number; // 0–100
  location: string;
  lastPing: string; // ISO timestamp
  vin: string;
  make: string;
  model: string;
  year: number;
}

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesDueMaintenance: number;
  avgFuelConsumption: number;
  utilizationRate: number;
}

interface FleetDataSnapshot {
  vehicles: Vehicle[];
  metrics: FleetMetrics;
  lastUpdated: string;
}

interface FleetDataState {
  data: FleetDataSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useFleetData = (): FleetDataState => {
  const [data, setData] = useState<FleetDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Parallel requests for performance
      const [vehiclesRes, metricsRes] = await Promise.all([
        apiService.request<{ data: Vehicle[] }>({
          url: '/fleet/vehicles',
          method: 'GET',
        }),
        apiService.request<{ data: FleetMetrics }>({
          url: '/fleet/metrics',
          method: 'GET',
        }),
      ]);

      if (!vehiclesRes.success || !metricsRes.success) {
        throw new Error('Failed to fetch fleet data');
      }

      const snapshot: FleetDataSnapshot = {
        vehicles: vehiclesRes.data.data,
        metrics: metricsRes.data.data,
        lastUpdated: new Date().toISOString(),
      };

      setData(snapshot);
      toast.success('Fleet data synced', { id: 'fleet-sync' });
    } catch (err) {
      const msg = (err as Error).message || 'Failed to load fleet data';
      setError(msg);
      toast.error(msg, { id: 'fleet-error' });
      console.error('[FleetDashboard] Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 45s
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 45_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchData(true),
  };
};