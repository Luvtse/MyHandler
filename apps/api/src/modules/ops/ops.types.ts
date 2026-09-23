/**
 * Ops module shared types.
 * Mirrors apps/web/src/types/operations.ts — keep both in sync.
 */

export type ShipmentStatus =
  | 'in_transit'
  | 'delayed'
  | 'customs_hold'
  | 'misrouted'
  | 'delivered';

export interface ShipmentFlowItem {
  id: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  estimatedArrival: string; // e.g., "2h 15m", "4h 30m", "—"
  vehicleId: string;
  routeLoadPct: number; // 0–100
}

export interface SLAData {
  onTimeRate: number;      // percentage, e.g. 92.4
  totalDeliveries: number; // today's count
  atRiskCount: number;     // shipments likely to miss SLA
}

export type IncidentType = 'weather' | 'accident' | 'customs' | 'mechanical';
export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  severity: IncidentSeverity;
  affectedRoutes: string[];
}
