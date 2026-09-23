// src/pages/dashboard/ShipmentsManagement.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/Table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectLabel } from '@/shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Package, 
  EyeIcon,
  FileEdit,
  Trash2,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Shipment, ShipmentStatus, Address } from '@/types/shipment';
import { SHIPMENT_STATUSES, ShipmentStatusCategory } from '@/types/shipmentStatus';
import { normalizeStatusId, formatDate, prismaSnakeToCanonical, canonicalToPrismaSnake } from '@/lib/tracking-utils';
import { AWBStatusBadge } from '@/components/tracking/AWBStatusBadge';
import { TrackingService } from '@/services/tracking';
import { ShipmentService } from '@/services/shipment';
import { apiService as apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '@/lib/api/endpoints';
import type { Shipment as PrintableShipment } from '@/types/shipment';
import generateAWBPDF from '@/shared/utils/generateAwb';

type UIShipment = {
  id?: string;
  awbNumber?: string;
  createdAt?: string;
  serviceType?: Shipment['serviceType'];
  totalWeight?: number;
  sender?: Partial<Address>;
  recipient?: Partial<Address>;
  status?: ShipmentStatus;
  originAirportCode?: string;
  destinationAirportCode?: string;
};

// ✅ FIXED: Now uses structured fields from DB
const toPartialShipment = (s: any): UIShipment => ({
  id: s.id,
  awbNumber: s.reference || s.awb || s.awbNumber,
  createdAt: s.createdAt,
  serviceType: s.serviceLevel,
  totalWeight: s.weightKg,
  sender: {
    name: s.originAddress,
    company: s.originCompany || '',
    city: s.originCity || '',
    country: s.originCountry || '',
    address1: s.originAddress,
    postalCode: '',
  },
  recipient: {
    name: s.destinationAddress,
    company: s.destinationCompany || '',
    city: s.destinationCity || '',
    country: s.destinationCountry || '',
    address1: s.destinationAddress,
    postalCode: '',
  },
  originAirportCode: s.originAirportCode,
  destinationAirportCode: s.destinationAirportCode,
  status: prismaSnakeToCanonical(String(s.status || '')),
});

const renderStatusBadge = (canonicalStatus?: string) => {
  if (!canonicalStatus) return null;
  const opt = SHIPMENT_STATUSES.find(s => s.id === canonicalStatus);
  const label = opt?.label || canonicalStatus.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  return (
    <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
      {label}
    </Badge>
  );
};

const ShipmentsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  type CanonicalStatusId = typeof SHIPMENT_STATUSES[number]['id'];
  const [statusFilter, setStatusFilter] = useState<'all' | CanonicalStatusId>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<UIShipment | null>(null);
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [shipments, setShipments] = useState<UIShipment[]>([]);
  const [drafts, setDrafts] = useState<UIShipment[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ShipmentStatusCategory>('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const resp: any = await ShipmentService.getShipments({
          search: searchTerm || undefined,
          status: 
            statusFilter === 'all' 
             ? undefined 
             : Object.values(SHIPMENT_STATUSES).some(s => s.id === statusFilter)
             ? canonicalToPrismaSnake(statusFilter)
             : undefined, // ignore invalid statuses
          page,
          limit,
        });
        const list = Array.isArray(resp) ? resp : (resp?.data ?? []);
        setShipments(list.map(toPartialShipment));
        const pagination = Array.isArray(resp) ? { total: list.length, page, limit } : (resp?.pagination || resp);
        setTotal(pagination.total || list.length);
        setPages(Math.max(1, Math.ceil((pagination.total || list.length) / (pagination.limit || limit))));
        
        // Fetch drafts
        try {
          const draftsResp: any = await apiClient.request({
            method: 'GET',
            url: API_ENDPOINTS.shipments.drafts.list,
          });
          const draftsList = Array.isArray(draftsResp.data) ? draftsResp.data : [];
          setDrafts(draftsList.map(toPartialShipment));
        } catch (e) {
          console.error('Failed to load drafts:', e);
        }
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Failed to load shipments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [searchTerm, statusFilter, page, limit]);

  const getServiceTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'express-domestic': 'Express: Domestic',
      'express-worldwide': 'Express: Worldwide',
      'priority': 'Priority',
      'standard': 'Standard',
      'economy': 'Economy'
    };
    return labels[type] || type;
  };
  
  const displayParty = (party: UIShipment['sender'], cityCode?: string): string => {
    const code = cityCode ? ` (${cityCode})` : '';
    const countryDisplay = party?.country ? ` • ${party.country}` : '';
    const city = party?.city || '';
    return `${city}${code}${countryDisplay}`.trim();
  };
  
  const formatCityAirport = (party: UIShipment['sender'], cityCode?: string): string => {
    const city = party?.city || '';
    const code = cityCode ? ` (${cityCode})` : '';
    const suffix = party?.country ? ' •' : '';
    return `${city}${code}${suffix}`.trim();
  };
  
  const partyCompanyLine = (party: UIShipment['sender']): string => {
    const company = String(party?.company || '').trim();
    const name = String(party?.name || '').trim();
    const address = String(party?.address1 || '').trim();
    return company || name || address;
  };
  
  const toPrintableShipment = (u: UIShipment): PrintableShipment => {
    return {
      id: u.id || '',
      awbNumber: u.awbNumber || '',
      createdAt: u.createdAt || new Date().toISOString(),
      sender: {
        name: u.sender?.name || '',
        company: u.sender?.company || '',
        email: '',
        phone: '',
        address1: u.sender?.address1 || '',
        address2: u.sender?.address2 || '',
        city: u.sender?.city || '',
        state: '',
        postalCode: u.sender?.postalCode || '',
        country: u.sender?.country || '',
      },
      recipient: {
        name: u.recipient?.name || '',
        company: u.recipient?.company || '',
        email: '',
        phone: '',
        address1: u.recipient?.address1 || '',
        address2: u.recipient?.address2 || '',
        city: u.recipient?.city || '',
        state: '',
        postalCode: u.recipient?.postalCode || '',
        country: u.recipient?.country || '',
      },
      packageType: 'box',
      serviceType: (u.serviceType as any) || 'standard',
      packageDetails: { length: 0, width: 0, height: 0, quantity: 1 },
      commodities: [{ description: 'AWB Label Reprint', quantity: 1, weight: 0, value: 0, currency: 'USD' }],
      options: { insurance: false, signature: false, fragile: false, saturday: false },
      paymentType: 'prepaid',
      chargesInformation: { amount: 0, currency: 'USD' },
      totalWeight: Number(u.totalWeight || 0),
      totalValue: 0,
      totalCurrency: 'USD',
    };
  };

  const filteredShipments = (() => {
    if (categoryFilter === 'all') return shipments;
    const categoryCanonical: Record<ShipmentStatusCategory, string[]> = {
      'Order Initiation & Shipment Preparation': [
        'order-received',
        'label-created',
        'shipment-scheduled',
        'shipment-information-received',
        'awaiting-pickup',
        'picked-up',
        'in-transit-to-sorting',
      ],
      'Inbound & Sorting': [
        'received-at-hub',
        'origin-scan',
        'scanned-inbound',
        'sorting-in-progress',
        'departing-to-next-hub',
        'arrival-scan',
        'processing-at-facility',
        'held-at-location',
      ],
      'Long-Haul / Inter-City/Country Transit': [
        'in-transit-to-destination',
        'departure-scan',
        'arrived-at-destination-hub',
        'arrived-at-facility',
        'departed-facility',
        'awaiting-clearance',
        'clearance-delay',
        'customs-clearance-initiated',
        'customs-cleared',
        'customs-released',
        'tendered-to-delivery-partner',
        'transferred-to-post-office',
        'weather-delay',
        'transportation-delay',
        'shipment-on-hold',
        'misrouted',
      ],
      'Final Delivery Preparation': [
        'dispatched-for-delivery',
        'in-local-delivery-facility',
        'out-for-delivery',
        'delivery-attempted',
        'delivery-rescheduled',
        'ready-for-pickup',
        'delivery-exception',
      ],
      'Delivery Completion or Exception Handling': [
        'delivered-successfully',
        'delivery-confirmed',
        'signature-obtained',
        'returned-to-sender',
        'lost-exception',
        'damaged-upon-arrival',
        'cancelled',
      ],
    };
    const allowed = categoryCanonical[categoryFilter] || [];
    return shipments.filter((s) => allowed.includes(String(s.status || '')));
  })();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Shipment Management</h1>
        <div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate('/dashboard/shipments/create')}
          >
            <Plus size={16} />
            New Shipment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Manage all shipments in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                  <Input 
                    placeholder="Search by AWB, origin, or destination..." 
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Select 
                    value={statusFilter} 
                    onValueChange={(v) => setStatusFilter(v as CanonicalStatusId | 'all')}
                  >
                    <SelectTrigger className="w-[220px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>{
                          statusFilter === 'all'
                            ? 'All Status'
                            : (SHIPMENT_STATUSES.find(s => s.id === statusFilter)?.label || statusFilter)
                        }</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {Object.entries(
                        SHIPMENT_STATUSES.reduce((acc, s) => {
                          (acc[s.category] = acc[s.category] || []).push(s);
                          return acc;
                        }, {} as Record<string, typeof SHIPMENT_STATUSES>)
                      ).map(([category, statuses]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={s.id} title={s.description}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <TabsContent value="all" className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">Loading...</TableCell>
                      </TableRow>
                    )}
                    {error && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-destructive">{error}</TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="font-mono">{shipment.awbNumber}</div>
                            {shipment.awbNumber && (
                              <AWBStatusBadge awbNumber={shipment.awbNumber} showLabel={false} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(shipment.createdAt || '')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <div className="text-sm">{partyCompanyLine(shipment.sender)}</div>
                            <div className="font-medium">{formatCityAirport(shipment.sender, shipment.originAirportCode)}</div>
                            <div className="text-sm text-muted-foreground">{shipment.sender?.country || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <div className="text-sm">{partyCompanyLine(shipment.recipient)}</div>
                            <div className="font-medium">{formatCityAirport(shipment.recipient, shipment.destinationAirportCode)}</div>
                            <div className="text-sm text-muted-foreground">{shipment.recipient?.country || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getServiceTypeLabel(shipment.serviceType || '')}
                        </TableCell>
                        <TableCell>
                          {shipment.totalWeight} kg
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(shipment.status as string)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => navigate(`/dashboard/shipments/${shipment.awbNumber}`)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => navigate(`/dashboard/shipments/${shipment.awbNumber}/edit`)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={async () => {
                                if (!shipment.id) return;
                                if (!window.confirm('Delete this shipment?')) return;
                                try {
                                  await ShipmentService.deleteShipment(shipment.id);
                                  setShipments((prev) => prev.filter((s) => s.id !== shipment.id));
                                } catch {}
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredShipments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <Package className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-muted-foreground">No shipments found</p>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, pages)}</div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                  <Button variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            </TabsContent>
        </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>View shipment reference and tracking information</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>Reference</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono">{selectedShipment.awbNumber}</span>
                  {selectedShipment.awbNumber && (
                    <AWBStatusBadge awbNumber={selectedShipment.awbNumber} />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>Service</Label>
                <div className="col-span-2">{getServiceTypeLabel(selectedShipment.serviceType || '')}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>Created</Label>
                <div className="col-span-2">{formatDate(selectedShipment.createdAt || '')}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>From</Label>
                <div className="col-span-2">{displayParty(selectedShipment.sender, selectedShipment.originAirportCode)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>To</Label>
                <div className="col-span-2">{displayParty(selectedShipment.recipient, selectedShipment.destinationAirportCode)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>Status</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select
                    value={(selectedShipment.status ? String(selectedShipment.status).toLowerCase().replace(/_/g, '-') : '')}
                    onValueChange={(v) => setSelectedShipment((s) => ({ ...s!, status: v as ShipmentStatus }))}
                  >
                    <SelectTrigger className="w-[200px]" />
                    <SelectContent>
                      {Object.entries(
                        SHIPMENT_STATUSES.reduce((acc, s) => {
                          (acc[s.category] = acc[s.category] || []).push(s);
                          return acc;
                        }, {} as Record<string, typeof SHIPMENT_STATUSES>)
                      ).map(([category, statuses]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={s.id} title={s.description}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Location"
                    className="w-[180px]"
                    value={updateLocation}
                    onChange={(e) => setUpdateLocation(e.target.value)}
                  />
                  <Input
                    placeholder="Notes"
                    className="w-[220px]"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!selectedShipment?.id) return;
                      try {
                        const updated = await ShipmentService.updateShipment(selectedShipment.id, { status: (selectedShipment.status as any) });
                        setShipments((prev) => prev.map((s) => (s.id === updated.id ? { ...s, status: updated.status as ShipmentStatus } : s)));
                        if (selectedShipment.status) {
                          try {
                            await TrackingService.addEvent({
                              shipmentId: selectedShipment.id,
                              status: String(selectedShipment.status),
                              location: updateNotes ? `${updateLocation} • ${updateNotes}` : updateLocation,
                              notes: updateNotes,
                              timestamp: new Date().toISOString(),
                            });
                          } catch {}
                        }
                        setDetailsOpen(false);
                      } catch {}
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (only status/location, no address editing here) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shipment Status</DialogTitle>
            <DialogDescription>Update shipment status and location.</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>AWB Number</Label>
                <Input className="col-span-2" value={selectedShipment.awbNumber || ''} disabled />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>From</Label>
                <div className="col-span-2">{displayParty(selectedShipment.sender, selectedShipment.originAirportCode)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>To</Label>
                <div className="col-span-2">{displayParty(selectedShipment.recipient, selectedShipment.destinationAirportCode)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label>Status</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Select
                    value={(selectedShipment.status ? String(selectedShipment.status).toLowerCase().replace(/_/g, '-') : '')}
                    onValueChange={(v) => setSelectedShipment((s) => ({ ...s!, status: v as ShipmentStatus }))}
                  >
                    <SelectTrigger className="w-[200px]" />
                    <SelectContent>
                      {Object.entries(
                        SHIPMENT_STATUSES.reduce((acc, s) => {
                          (acc[s.category] = acc[s.category] || []).push(s);
                          return acc;
                        }, {} as Record<string, typeof SHIPMENT_STATUSES>)
                      ).map(([category, statuses]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={s.id} title={s.description}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Location"
                    className="w-[180px]"
                    value={updateLocation}
                    onChange={(e) => setUpdateLocation(e.target.value)}
                  />
                  <Input
                    placeholder="Notes"
                    className="w-[220px]"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (!selectedShipment?.awbNumber) return;
                    try {
                      const printable = toPrintableShipment(selectedShipment);
                      await generateAWBPDF(printable);
                    } catch {}
                  }}
                >
                  Reprint AWB
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedShipment?.id) return;
                    try {
                      const updated = await ShipmentService.updateShipment(selectedShipment.id, { 
                        status: selectedShipment.status as any,
                      });
                      setShipments((prev) => prev.map((s) => (s.id === updated.id ? { ...s, status: updated.status as ShipmentStatus } : s)));
                      if (selectedShipment.status) {
                        try {
                          await TrackingService.addEvent({
                            shipmentId: selectedShipment.id,
                            status: String(selectedShipment.status),
                            location: updateNotes ? `${updateLocation} • ${updateNotes}` : updateLocation,
                            notes: updateNotes,
                            timestamp: new Date().toISOString(),
                          });
                        } catch {}
                      }
                      setEditOpen(false);
                    } catch {}
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipmentsManagement;
