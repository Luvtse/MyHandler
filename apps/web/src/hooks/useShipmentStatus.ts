import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ShipmentStatus } from '@/types/tracking';
import { TrackingService } from '@/services/tracking';

interface UseShipmentStatusProps {
  initialStatus: ShipmentStatus | null;
}

export const useShipmentStatus = ({ initialStatus }: UseShipmentStatusProps) => {
  const [shipment, setShipment] = useState<ShipmentStatus | null>(initialStatus);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const pollTimer = useRef<number | null>(null);
  const currentShipmentId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        window.clearInterval(pollTimer.current);
      }
    };
  }, []);

  const updateStatus = async (trackingNumber: string, status: string, location: string, notes: string) => {
    try {
      setLoading(true);

      // Persist tracking event
      try {
        await TrackingService.addEvent({ shipmentId: trackingNumber, status, location, notes });
      } catch (err) {
        // Non-blocking error: UI will still update
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      const uiStatus = status.toLowerCase();

      setShipment(prev => {
        if (!prev) return prev;

        const now = new Date();
        const newEvent = {
          date: format(now, 'MMM d, yyyy'),
          time: format(now, 'h:mm a'),
          location,
          status: notes || status
        };

        return {
          ...prev,
          status: uiStatus,
          statusText: uiStatus.replace(/-/g, ' ').replace(/^[a-z]/, (c) => c.toUpperCase()),
          currentLocation: location,
          trackingEvents: [newEvent, ...prev.trackingEvents]
        };
      });

      toast({
        title: 'Status Updated',
        description: 'The shipment status has been successfully updated.',
      });

      return true;
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update the shipment status. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    shipment,
    setShipment,
    loading,
    updateStatus,
    startPolling: async (shipmentId: string, intervalMs = 5000) => {
      currentShipmentId.current = shipmentId;
      // initial fetch
      try {
        const events = await TrackingService.listEvents(shipmentId);
        setShipment(prev => prev ? { ...prev, trackingEvents: events.map(e => ({
          date: format(new Date((e as any).eventTime || (e as any).timestamp as string), 'MMM d, yyyy'),
          time: format(new Date((e as any).eventTime || (e as any).timestamp as string), 'h:mm a'),
          location: e.location || '',
          status: e.notes || e.status,
        })) } : prev);
      } catch {}
      // start interval
      if (pollTimer.current) window.clearInterval(pollTimer.current);
      pollTimer.current = window.setInterval(async () => {
        if (!currentShipmentId.current) return;
        try {
          const events = await TrackingService.listEvents(currentShipmentId.current);
          setShipment(prev => prev ? { ...prev, trackingEvents: events.map(e => ({
            date: format(new Date((e as any).eventTime || (e as any).timestamp as string), 'MMM d, yyyy'),
            time: format(new Date((e as any).eventTime || (e as any).timestamp as string), 'h:mm a'),
            location: e.location || '',
            status: e.notes || e.status,
          })) } : prev);
        } catch {}
      }, intervalMs);
    },
  };
};
