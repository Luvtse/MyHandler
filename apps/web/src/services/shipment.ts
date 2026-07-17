import { apiService, apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { canonicalToPrismaSnake } from '@/lib/tracking-utils';
import { SHIPMENT_STATUSES } from '@/types/shipmentStatus';

export interface ShipmentSummary {
  id: string;
  awb?: string;
  status?: string;
  createdAt?: string;
}

export interface CreateShipmentDTO {
  // Define minimal fields used by UI when needed
  awb?: string;
}

export interface UpdateShipmentDTO {
  status?: string;
  originAddress?: string;
  originCity?: string;
  originCountry?: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationCountry?: string;
  serviceLevel?: string;
  weightKg?: number;
}

export interface ShipmentFilters {
  search?: string;
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentType?: string;
}

export const ShipmentService = {
  async getShipments(filters: ShipmentFilters = {}) {
    const normalizePaymentType = (pt?: string) => {
      if (!pt) return pt;
      const key = pt.toLowerCase();
      if (key === 'prepaid') return 'PREPAID';
      if (key === 'collect') return 'COLLECT';
      if (key === 'account') return 'ACCOUNT';
      return pt;
    };
    const params = {
      ...filters,
      ...(filters.status ? { status: canonicalToPrismaSnake(filters.status) } : {}),
      paymentType: normalizePaymentType(filters.paymentType),
    };
    const payload = await apiRequestData<{ data: any[]; pagination: { total: number; page: number; limit: number } }>({
      method: 'GET',
      url: API_ENDPOINTS.shipments.list,
      params,
    });
    // apiRequestData returns payload.data if available, otherwise payload
    // If it returned the shipments array directly, normalize to array
    return Array.isArray(payload) ? payload : (payload as any);
  },

  async getShipmentById(id: string) {
    const { success, data, error } = await apiService.request<ShipmentSummary>({
      method: 'GET',
      url: API_ENDPOINTS.shipments.details(id),
    });
    if (!success || !data) throw new Error(error || 'Failed to load shipment');
    return data;
  },

  async deleteShipment(id: string) {
    const { success, data, error } = await apiService.request<{ message: string }>({
      method: 'DELETE',
      url: API_ENDPOINTS.shipments.delete(id),
    });
    if (!success) throw new Error(error || 'Failed to delete shipment');
    return data;
  },

  async updateShipment(id: string, data: UpdateShipmentDTO) {
    const canonicalIds = new Set<string>(SHIPMENT_STATUSES.map(s => s.id));
    const payload: UpdateShipmentDTO = { ...data };
    if (typeof data.status === 'string') {
      const v = String(data.status || '').trim().toLowerCase();
      if (canonicalIds.has(v)) {
        payload.status = v;
      } else {
        // omit invalid status to avoid sending 'unknown'
        delete (payload as any).status;
      }
    }

    const { success, data: resp, error } = await apiService.request<ShipmentSummary>({
      method: 'PUT',
      url: API_ENDPOINTS.shipments.update(id),
      data: payload,
    });
    if (!success || !resp) throw new Error(error || 'Failed to update shipment');
    return resp;
  },
};
