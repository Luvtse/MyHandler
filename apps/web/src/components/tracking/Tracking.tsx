import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TrackingForm from '@/components/tracking/TrackingForm';
import ShipmentDetails from '@/components/tracking/ShipmentDetails';
import { ShipmentStatus } from '@/types/tracking';
import { SHIPMENT_STATUSES } from '@/types/shipmentStatus';
import { Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShipmentStatus } from '@/hooks/useShipmentStatus';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { useQueryData } from '@/hooks/useReactQuery';

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [serverShipmentId, setServerShipmentId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use React Query for tracking data
  const { 
    data: shipmentData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQueryData<any>(
    ['tracking', trackingNumber || ''],
    trackingNumber ? API_ENDPOINTS.shipments.track(trackingNumber) : API_ENDPOINTS.shipments.track(''),
    {
      enabled: !!trackingNumber,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  React.useEffect(() => {
    if (isError && error) {
      const message = (error as any)?.message || 'Failed to fetch tracking information';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }, [isError, error, toast]);


  // Use React Query for tracking data with the existing shipment status hook
  const { shipment, loading: localLoading, updateStatus, setShipment } = useShipmentStatus({ 
    initialStatus: null 
  });

  const mapServerShipmentToStatus = React.useCallback((srv: any): ShipmentStatus => {
    const latest = Array.isArray(srv?.trackingEvents) ? srv.trackingEvents[0] : undefined;
    const statusEnum = String(latest?.status || srv?.status || 'IN_TRANSIT');
    const statusId = statusEnum.toLowerCase().replace(/_/g, '-');
    const statusOpt = SHIPMENT_STATUSES.find(s => s.id === statusId);
    const statusText = statusOpt?.label || statusId.replace(/-/g, ' ').replace(/^[a-z]/, (c) => c.toUpperCase());
    const progressMap: Record<string, number> = {
      'order-received': 10,
      'shipment-scheduled': 15,
      'awaiting-pickup': 20,
      'picked-up': 30,
      'in-transit-to-sorting': 35,
      'received-at-hub': 40,
      'scanned-inbound': 45,
      'sorting-in-progress': 50,
      'departing-to-next-hub': 55,
      'in-transit-to-destination': 60,
      'arrived-at-destination-hub': 65,
      'customs-clearance-initiated': 70,
      'customs-cleared': 75,
      'dispatched-for-delivery': 80,
      'in-local-delivery-facility': 82,
      'out-for-delivery': 90,
      'delivery-attempted': 92,
      'delivery-rescheduled': 93,
      'delivered-successfully': 100,
      'signature-obtained': 100,
      'returned-to-sender': 0,
      'lost-exception': 0,
      'damaged-upon-arrival': 0,
      'cancelled': 0,
    };
    const events = (srv?.trackingEvents || []).map((e: any) => {
      const evStatusId = String(e.status || '').toLowerCase().replace(/_/g, '-');
      return {
        date: new Date(e.eventTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(e.eventTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        location: e.location || '—',
        status: evStatusId,
        notes: e.description || '',
      };
    });
    return {
      status: statusId,
      statusText,
      progress: progressMap[statusId] ?? 50,
      estimatedDelivery: '',
      currentLocation: latest?.location || '',
      trackingEvents: events,
      shipmentDetails: {
        trackingNumber: String(srv?.reference || srv?.awbNumber || ''),
        shipDate: new Date(srv?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        service: String(srv?.serviceLevel || 'Standard'),
        weight: srv?.weightKg ? `${srv.weightKg} kg` : '',
        dimensions: String(srv?.dimensionsCm || ''),
        sender: '',
        recipient: '',
        from: (srv?.originCity || '') + (srv?.originCountry ? ` • ${srv.originCountry}` : ''),
        to: (srv?.destinationCity || '') + (srv?.destinationCountry ? ` • ${srv.destinationCountry}` : ''),
      }
    };
  }, []);

  React.useEffect(() => {
    if (shipmentData && (shipmentData.data || shipmentData.reference)) {
      const srv = shipmentData.data || shipmentData;
      if (srv?.id) setServerShipmentId(srv.id);
      setShipment(mapServerShipmentToStatus(srv));
    }
  }, [shipmentData, setShipment, mapServerShipmentToStatus]);

  const handleSubmit = async (trackingNum: string) => {
    setTrackingNumber(trackingNum);
    // React Query will automatically fetch data when trackingNumber changes
  };

  const handleStatusUpdate = async (status: ShipmentStatus['status'], location: string, notes: string) => {
    const idOrAwb = serverShipmentId || trackingNumber;
    if (idOrAwb) {
      await updateStatus(idOrAwb, status, location, notes);
    }
  };

  const handleCreateShipment = () => {
    navigate('/create-shipment');
  };

  return (
    <MainLayout>
      <section className="py-10 md:py-12 bg-muted min-h-[70vh]">
        <div className="logistics-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Your Shipment</h1>
              <p className="text-gray-500 mt-1">Real-time visibility from pickup to delivery.</p>
            </div>
            <Button
              onClick={handleCreateShipment}
              className="flex items-center gap-2 bg-brand hover:bg-brand-600 font-semibold shrink-0"
            >
              <Package className="h-4 w-4" />
              Create Shipment
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-4">
              <TrackingForm onSubmit={handleSubmit} />
            </div>

            <div className="lg:col-span-8">
              {(isLoading || localLoading) ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center min-h-[420px] gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-100 border-t-brand" />
                  <p className="text-gray-500 text-sm">Fetching tracking information…</p>
                </div>
              ) : shipment ? (
                <ShipmentDetails
                  shipment={shipment}
                  trackingNumber={trackingNumber || undefined}
                  onStatusUpdate={handleStatusUpdate}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-14 border border-gray-100 flex flex-col items-center text-center min-h-[420px] justify-center">
                  <div className="bg-brand-50 rounded-2xl p-6 mb-5">
                    <Search className="h-12 w-12 text-brand" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Enter a tracking number to begin</h2>
                  <p className="text-gray-500 max-w-md leading-relaxed">
                    Enter your GoodsHandler tracking number to get detailed information about your shipment status and location.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Tracking;
