// @/types/operations.ts

/**
 * Shipment Flow
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

/**
 * SLA & Performance Metrics
 */
export interface SLAData {
  onTimeRate: number;      // e.g., 92.4 (percentage)
  totalDeliveries: number; // today’s count
  atRiskCount: number;     // shipments likely to miss SLA
}

/**
 * Operational Incidents
 */
export type IncidentType = 'weather' | 'accident' | 'customs' | 'mechanical';
export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  severity: IncidentSeverity;
  affectedRoutes: string[]; // e.g., ['RT-04', 'RT-07']
}

/**
 * (Optional) API Response Wrapper – if your backend uses a consistent envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string; // ISO 8601, useful for `lastUpdated`
}