/**
 * Regional Dashboard Service
 * Fetches real regional metrics + insights from the WORIYA EXPRESS API.
 */
import { apiService } from '@/lib/api/client';

const BASE = '/analytics/regional';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegionalMetrics {
  region: string;
  shipments: number;
  revenue: number; // ETB (month-to-date)
  activeClients: number;
  fleetUtilization: number; // %
  onTimeDelivery: number; // %
  avgFulfillmentTime: number; // hours
  costPerShipment: number; // ETB
  clientRetention: number; // %
}

export interface RegionalInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface RegionalData {
  metrics: RegionalMetrics;
  insights: RegionalInsight[];
  benchmarks: {
    nationalOnTimeDelivery: number;
    nationalCostPerShipment: number;
  };
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function getRegionalData(region: string): Promise<RegionalData> {
  const res = await apiService.request<{ data: RegionalData }>({
    method: 'GET',
    url: `${BASE}/${encodeURIComponent(region)}`,
  });
  if (!res.success || !res.data) throw new Error(res.message ?? 'Failed to load regional data');
  return (res.data as any).data;
}
