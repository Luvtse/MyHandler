/**
 * Warehouse Dashboard Service
 * Fetches real inventory / equipment / storage / shipment metrics from the
 * WORIYA EXPRESS API (/api/warehouse/*) and performs inventory CRUD + scans.
 */
import { apiService } from '@/lib/api/client';

const BASE = '/warehouse';

// ─── Types (mirrored in apps/api/src/modules/warehouse/warehouse.service.ts) ─

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  reorderPoint: number;
  status: StockStatus;
  updatedAt: string;
}

export interface EquipmentRow {
  id: string;
  name: string;
  status: string; // Operational | Maintenance Required | In Transit | Decommissioned
  lastMaintenance: string | null;
  nextMaintenance: string | null;
}

export interface WarehouseDashboardData {
  inventory: InventoryRow[];
  equipment: EquipmentRow[];
  storage: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPct: number;
    zones: { zone: string; items: number; pct: number }[];
  };
  shipments: {
    incoming: number;
    outgoing: number;
    deliveredToday: number;
    exceptions: number;
  };
  stats: {
    totalSkus: number;
    totalUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    operationalRatePct: number;
  };
}

export interface ScanResult {
  found: boolean;
  message?: string;
  shipment?: {
    id: string;
    reference: string;
    status: string;
    destinationCity: string;
    destinationCountry: string;
  };
}

export interface InventoryInput {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  location: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function unwrap<T>(promise: Promise<{ success: boolean; data?: any; message?: string }>): Promise<T> {
  const res = await promise;
  if (!res.success || !res.data) throw new Error(res.message ?? 'Warehouse API request failed');
  return (res.data as any).data as T;
}

// ─── Loaders / mutations ─────────────────────────────────────────────────────

export async function getWarehouseDashboard(): Promise<WarehouseDashboardData> {
  return unwrap<WarehouseDashboardData>(
    apiService.request({ method: 'GET', url: `${BASE}/dashboard` }),
  );
}

export async function createInventoryItem(input: InventoryInput): Promise<InventoryRow> {
  return unwrap<InventoryRow>(
    apiService.request({ method: 'POST', url: `${BASE}/inventory`, data: input }),
  );
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<InventoryInput>,
): Promise<InventoryRow> {
  return unwrap<InventoryRow>(
    apiService.request({ method: 'PATCH', url: `${BASE}/inventory/${encodeURIComponent(id)}`, data: patch }),
  );
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await unwrap<{ message: string }>(
    apiService.request({ method: 'DELETE', url: `${BASE}/inventory/${encodeURIComponent(id)}` }),
  );
}

export async function scanWarehouseItem(code: string, location?: string): Promise<ScanResult> {
  const res = await apiService.request({
    method: 'POST',
    url: `${BASE}/scan`,
    data: { code, location: location ?? 'Warehouse' },
  });
  // A 404 ("no shipment for code") is a valid scan outcome, not a crash.
  if (!res.success) {
    return { found: false, message: res.message ?? `No shipment found for code "${code}"` };
  }
  return (res.data as any).data as ScanResult;
}
