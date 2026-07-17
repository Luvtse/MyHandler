import { apiService } from '@/lib/api/client';
import { apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { normalizeStatusId } from '@/lib/tracking-utils';

export interface TrackingEventDTO {
  id?: string;
  shipmentId: string;
  status: string;
  location?: string;
  timestamp?: string;
  notes?: string;
}

export const TrackingService = {
  async listEvents(shipmentId: string) {
    const payload = await apiRequestData<{ events: TrackingEventDTO[] }>({
      method: 'GET',
      url: API_ENDPOINTS.shipments.trackingEvents(shipmentId),
      params: { shipmentId },
    });
    return payload.events;
  },

  async addEvent(event: TrackingEventDTO) {
    const apiStatus = normalizeStatusId(event.status);
    if (!apiStatus) {
      throw new Error('Invalid canonical status id provided to TrackingService.addEvent');
    }
    const data = {
      shipmentId: event.shipmentId,
      status: apiStatus,
      location: event.location,
      description: event.notes || event.status,
      eventTime: event.timestamp,
    };
    const created = await apiRequestData<TrackingEventDTO>({
      method: 'POST',
      url: API_ENDPOINTS.shipments.trackingEvents(event.shipmentId),
      data,
    });
    return created;
  },

  async deleteEvent(id: string) {
    const { success, error } = await apiService.request<{ message: string }>({
      method: 'DELETE',
      url: API_ENDPOINTS.shipments.trackingEvents(id),
    });
    if (!success) throw new Error(error || 'Failed to delete tracking event');
  },
};
