// @/dashboard/fleet-manager/useFleetData.tsx
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  plateNumber: string;
  licensePlate: string;
  type: string;
  status: string;
  driverId: string | null;
  driverName: string | null;
  lastMaintenance: string | null;
  nextMaintenanceMileage: number;
  currentMileage: number;
  fuelLevel: number;
  location: string;
  currentLocation: string;
  lastPing: string;
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useFleetData = (): FleetDataState => {
  const [data, setData] = useState<FleetDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Parallel requests for performance — note: apiService.request<T> returns
      // ApiResponse<T> whose `.data` field IS of type T (the API response body).
      // The API returns { success, data: Vehicle[] } so we type T = Vehicle[].
      const [vehiclesRes, metricsRes] = await Promise.all([
        apiService.request<Vehicle[]>({ url: '/fleet/vehicles', method: 'GET' }),
        apiService.request<FleetMetrics>({ url: '/fleet/metrics', method: 'GET' }),
      ]);

      if (!vehiclesRes.success || !metricsRes.success) {
        throw new Error('Failed to fetch fleet data');
      }

      setData({
        vehicles: Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [],
        metrics: metricsRes.data,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      const msg = (err as Error).message || 'Failed to load fleet data';
      setError(msg);
      toast.error(msg, { id: 'fleet-error' });
      console.error('[FleetDashboard] Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 45 s
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 45_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: () => fetchData(true) };
};
