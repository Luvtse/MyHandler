
export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  notes?: string;
}

export interface ShipmentDetails {
  trackingNumber: string;
  shipDate: string;
  service: string;
  weight: string;
  dimensions: string;
  sender: string;
  recipient: string;
  from: string;
  to: string;
}

export interface ShipmentStatus {
  status: string;
  statusText: string;
  progress: number;
  estimatedDelivery: string;
  currentLocation: string;
  trackingEvents: TrackingEvent[];
  shipmentDetails: ShipmentDetails;
}
