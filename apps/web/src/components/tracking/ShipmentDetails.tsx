
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Download
} from "lucide-react";
import { ShipmentStatus, TrackingEvent } from "@/types/tracking";
import { TrackingService } from '@/services/tracking';
import { apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { SHIPMENT_STATUSES } from '@/types/shipmentStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { normalizeStatusId, formatDate, estimateEta, parseCityCountry } from '@/lib/tracking-utils';

export interface ShipmentDetailsProps {
  shipment: ShipmentStatus;
  trackingNumber?: string;
  shipmentId?: string;
  onStatusUpdate?: (status: string, location: string, notes: string) => void;
}

const MAX_EVENTS = 8;

const ShipmentDetails = ({ shipment, trackingNumber, shipmentId }: ShipmentDetailsProps) => {
  const [events, setEvents] = useState<TrackingEvent[]>(shipment.trackingEvents || []);
  const [etaText, setEtaText] = useState<string>(shipment.estimatedDelivery || '');
  const [etaLoading, setEtaLoading] = useState<boolean>(false);
  const [etaHint, setEtaHint] = useState<string>('');
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  // Helpers now extracted to shared util

  const statusId = normalizeStatusId(String(shipment.status || '').toLowerCase().replace(/_/g, '-'));
  const canonicalStatusLabel = useMemo(() => {
    const found = SHIPMENT_STATUSES.find(s => s.id === statusId)?.label;
    if (found) return found;
    const pretty = statusId.replace(/-/g, ' ').replace(/_/g, ' ').trim();
    return pretty ? pretty.replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown Status';
  }, [statusId]);

  const toTrackingEvent = (e: any): TrackingEvent => {
    const d = new Date(e.eventTime || e.timestamp || Date.now());
    const canonical = String(e.status || '').toLowerCase().replace(/_/g, '-');
    const id = normalizeStatusId(canonical);
    const locParsed = parseCityCountry(e.location || '');
    const locText = (locParsed.city && locParsed.country) ? `${locParsed.city}, ${locParsed.country}` : (e.location || '—');
    return {
      date: formatDate(d, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: formatDate(d, { hour: 'numeric', minute: '2-digit' }),
      location: locText,
      status: id,
      notes: e.description || '',
    };
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!shipmentId) return;
      try {
        setEventsLoading(true);
        const list = await TrackingService.listEvents(shipmentId);
        const mapped = (list || []).map(toTrackingEvent);
        if (active) setEvents(mapped);
      } catch {}
      finally { if (active) setEventsLoading(false); }
    })();
    return () => {
      active = false;
    };
  }, [shipmentId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!trackingNumber) return;
      try {
        setEventsLoading(true);
        const srv: any = await apiRequestData<any>({ method: 'GET', url: API_ENDPOINTS.shipments.track(trackingNumber) });
        const data = srv?.data || srv;
        const mapped = (data?.trackingEvents || []).map(toTrackingEvent);
        if (active) setEvents(mapped);
      } catch {}
      finally { if (active) setEventsLoading(false); }
    })();
    return () => { active = false; };
  }, [trackingNumber]);

  useEffect(() => {
    if (!shipmentId) {
      setEvents(shipment.trackingEvents || []);
    }
  }, [shipment.trackingEvents, shipmentId]);
  const getStatusProgress = (status: string): number => {
    const statuses = SHIPMENT_STATUSES.map(s => normalizeStatusId(s.id));
    const index = statuses.indexOf(status);
    return Math.max(((index + 1) / statuses.length) * 100, 10);
  };

  const getStatusText = (status: string): string => {
    const found = SHIPMENT_STATUSES.find(s => normalizeStatusId(s.id) === status);
    return found?.label || status.replace(/-/g, ' ').replace(/^[a-z]/, (c) => c.toUpperCase());
  };

  const parseTs = (ev: TrackingEvent) => new Date(`${ev.date} ${ev.time}`).getTime();
  const sortedEvents = useMemo(() => [...events].sort((a, b) => parseTs(b) - parseTs(a)), [events]);
  const [expanded, setExpanded] = useState(false);
  const visibleEvents = useMemo(() => expanded ? sortedEvents : sortedEvents.slice(0, MAX_EVENTS), [sortedEvents, expanded]);
  const grouped = useMemo(() => {
    const acc: Record<string, TrackingEvent[]> = {};
    for (const ev of visibleEvents) {
      (acc[ev.date] = acc[ev.date] || []).push(ev);
    }
    return acc;
  }, [visibleEvents]);

  const computeEta = (shipDateStr: string, service: string, statusId: string): string => {
    return estimateEta(shipDateStr, service, statusId, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      // Resolve a base ship date
      const baseShipDate = (() => {
        const raw = shipment.shipmentDetails.shipDate;
        if (raw) {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) return raw;
        }
        // Try earliest pickup or first event
        const pickupEvent = events.find(ev => /picked up/i.test(ev.status));
        if (pickupEvent) return `${pickupEvent.date} ${pickupEvent.time}`;
        const latest = events[events.length - 1];
        if (latest) return `${latest.date} ${latest.time}`;
        return new Date().toISOString();
      })();

      // Show a local estimate immediately; override with API result when available
      const immediate = computeEta(
        baseShipDate,
        shipment.shipmentDetails.service,
        statusId
      );
      if (active) { setEtaText(immediate); setEtaHint('Using estimated date'); }

      const fromCity = String(shipment.shipmentDetails.from || '').split(',')[0].trim();
      const toCity = String(shipment.shipmentDetails.to || '').split(',')[0].trim();
      const service = shipment.shipmentDetails.service;
      const dropoff = new Date(shipment.shipmentDetails.shipDate || Date.now());
      try {
        if (active) setEtaLoading(true);
        const result: any = await apiRequestData({
          method: 'POST',
          url: API_ENDPOINTS.shipments.etaCalculate,
          data: {
            originCity: fromCity,
            destinationCity: toCity,
            serviceLevel: service,
            dropoffTime: dropoff.toISOString(),
            currentStatus: statusId,
          }
        });
        const estIso = (result?.estimatedDelivery || result?.data?.estimatedDelivery) || '';
        if (estIso) {
          const formatted = formatDate(new Date(estIso), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
          if (active) { setEtaText(formatted); setEtaHint(''); }
        } else {
          // If API returns no estimatedDelivery, keep immediate estimate
          if (active) { setEtaHint('Using estimated date'); }
        }
      } catch {
        const fallback = computeEta(baseShipDate, shipment.shipmentDetails.service, statusId);
        if (active) { setEtaText(fallback); setEtaHint('Using estimated date'); }
      } finally {
        if (active) setEtaLoading(false);
      }
    })();
    return () => { active = false; };
  }, [shipment.shipmentDetails.from, shipment.shipmentDetails.to, shipment.shipmentDetails.service, shipment.shipmentDetails.shipDate, shipment.status]);

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand" aria-label="Package" />
            Tracking #{trackingNumber || shipment.shipmentDetails.trackingNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Status</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-semibold text-brand cursor-help">{canonicalStatusLabel}</span>
                </TooltipTrigger>
                <TooltipContent>
                  {(() => {
                    const m = SHIPMENT_STATUSES.find(s => s.id === statusId);
                    return m?.description || canonicalStatusLabel;
                  })()}
                </TooltipContent>
              </Tooltip>
            </div>
            <Progress 
              value={shipment.progress} 
              className="h-2 bg-gray-100" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Delivery</h3>
              <p className="font-semibold">
                {etaLoading ? 'Calculating ETA…' : etaText}
              </p>
              {etaHint && (
                <p className="text-xs text-gray-500 mt-1">{etaHint}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service Type</h3>
              <p className="font-semibold">{shipment.shipmentDetails.service}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <p className="font-semibold">
                  {(() => {
                    const p = parseCityCountry(shipment.shipmentDetails.from);
                    return [p.city, p.country].filter(Boolean).join(', ');
                  })()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">To</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <p className="font-semibold">
                  {(() => {
                    const p = parseCityCountry(shipment.shipmentDetails.to);
                    return [p.city, p.country].filter(Boolean).join(', ');
                  })()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Weight</h3>
              <p className="font-semibold">{shipment.shipmentDetails.weight}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Ship Date</h3>
              <p className="font-semibold">{shipment.shipmentDetails.shipDate}</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            {sortedEvents.length > MAX_EVENTS && (
              <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
                {expanded ? 'Collapse' : 'Show all'}
              </Button>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-label="Contact Support" />
              Contact Support
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" aria-label="Download Receipt" />
              Download Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand" aria-label="Shipment Updates" />
            Shipment Updates
            <span className="text-sm text-gray-500">• {canonicalStatusLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-gray-200 pl-6 py-2 space-y-10">
            {eventsLoading && (
              <div className="text-sm text-gray-500">Loading updates…</div>
            )}
            {Object.entries(grouped).map(([date, evs]) => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">{date}</h4>
                <div className="space-y-8">
                  {evs.map((update, idx) => (
                    <div key={`${update.date}-${update.time}-${update.status}-${update.location}`} className="relative">
                      <div className="absolute -left-[29px] top-0 h-4 w-4 rounded-full bg-brand" aria-hidden="true"></div>
                      <div>
                        <p className="text-sm text-gray-500">{update.time}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-semibold cursor-help">
                              {(() => {
                                const m = SHIPMENT_STATUSES.find(s => s.id === update.status);
                                return m?.label || update.status.replace(/-/g, ' ');
                              })()}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            {(() => {
                              const match = SHIPMENT_STATUSES.find(s => s.id === update.status);
                              return match?.description || update.status.replace(/-/g, ' ');
                            })()}
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-sm">{update.location}</p>
                        {update.notes && (
                          <p className="text-sm text-gray-600">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentDetails;
