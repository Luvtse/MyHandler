// src/dashboard/fleet-manager/VehicleDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { generateMaintenancePDF } from '@/shared/utils/generateMaintenancePDF';
import type {
  VehicleWithMaintenance,
  MaintenanceRecord as SharedMaintenanceRecord,
} from '@/types/fleet';
import {
  Truck,
  Wrench,
  Fuel,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/client';

type VehicleDetailData = VehicleWithMaintenance;
type MaintenanceRecord = SharedMaintenanceRecord;

// ─── Real API fetch ───────────────────────────────────────────────────────────

const fetchVehicleDetail = async (id: string): Promise<VehicleDetailData> => {
  const res = await apiService.request<VehicleDetailData>({
    url: `/fleet/vehicles/${id}`,
    method: 'GET',
  });
  if (!res.success) throw new Error((res as any).message ?? 'Failed to load vehicle');
  return res.data;
};

// ─── Component ────────────────────────────────────────────────────────────────

const VehicleDetailPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = React.useState<VehicleDetailData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!vehicleId) {
      navigate('/dashboard/fleet');
      return;
    }
    setLoading(true);
    fetchVehicleDetail(vehicleId)
      .then(data => setVehicle(data))
      .catch(err => {
        toast.error('Failed to load vehicle details');
        console.error(err);
        navigate('/dashboard/fleet');
      })
      .finally(() => setLoading(false));
  }, [vehicleId, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'inTransit':      return 'bg-green-100 text-green-800';
      case 'maintenance':    return 'bg-orange-100 text-orange-800';
      case 'idle':
      case 'reserved':       return 'bg-yellow-100 text-yellow-800';
      default:               return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportPDF = () => {
    if (!vehicle) return;
    const pdf = generateMaintenancePDF(vehicle);
    pdf.save(`maintenance-record-${vehicle.licensePlate}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.vehicleDetail}</h1>
          <p className="text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/fleet')}>
            ← Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Vehicle Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plate / VIN</p>
                <p className="font-medium">{vehicle.licensePlate}</p>
                <p className="text-xs text-muted-foreground">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Driver</p>
                <p className="font-medium">{vehicle.driverName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.location ?? vehicle.currentLocation}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Ping</p>
                <p className="font-medium">{new Date(vehicle.lastPing).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fuel Level</p>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.fuelLevel}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mileage</p>
                <p className="font-medium">{vehicle.currentMileage.toLocaleString()} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Alerts */}
        <Card>
          <CardHeader><CardTitle>Compliance & Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Insurance Expiry</p>
              <p className={vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date() ? 'text-destructive font-medium' : ''}>
                {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Expiry</p>
              <p className={vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date() ? 'text-destructive font-medium' : ''}>
                {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString() : '—'}
              </p>
            </div>
            {vehicle.currentMileage >= vehicle.nextMaintenanceMileage && (
              <div className="p-3 bg-destructive/10 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Maintenance Overdue</p>
                  <p className="text-xs text-muted-foreground">
                    Next service at {vehicle.nextMaintenanceMileage.toLocaleString()} km
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>Service records and costs</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.maintenanceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No maintenance records</p>
          ) : (
            <div className="space-y-4">
              {vehicle.maintenanceHistory.map((record: MaintenanceRecord) => (
                <div key={record.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium capitalize">{record.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.scheduledAt).toLocaleDateString()}
                    </p>
                    {record.notes && <p className="text-sm mt-1">{record.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">ETB {record.cost?.toLocaleString() ?? '—'}</p>
                    {record.vendor && (
                      <p className="text-xs text-muted-foreground">{record.vendor}</p>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        record.status === 'completed' ? 'text-green-700 border-green-300' :
                        record.status === 'in_progress' ? 'text-amber-700 border-amber-300' :
                        record.status === 'cancelled' ? 'text-red-700 border-red-300' :
                        'text-blue-700 border-blue-300'
                      }
                    >
                      {record.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button onClick={() => navigate(`/dashboard/fleet/${vehicleId}/schedule-maintenance`)}>
              <Wrench className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
            {vehicle.maintenanceHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rec = vehicle.maintenanceHistory[0];
                  const start = new Date(rec.scheduledAt);
                  const end = new Date(start.getTime() + 2 * 3600 * 1000);
                  const ics = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'BEGIN:VEVENT',
                    `UID:${vehicle.id}@fleet.woriyaexpress.com`,
                    `DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    `DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    `SUMMARY:Maintenance: ${vehicle.licensePlate}`,
                    'END:VEVENT',
                    'END:VCALENDAR',
                  ].join('\n');
                  const blob = new Blob([ics], { type: 'text/calendar' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'maintenance.ics';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            )}
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Upcoming Services</CardTitle></CardHeader>
          <CardContent>
            {(vehicle.upcomingServices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming services scheduled</p>
            ) : (
              <ul className="space-y-2">
                {vehicle.upcomingServices.map((service, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fleet Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Trips</span>
              <span className="font-medium">{vehicle.totalTrips ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Distance</span>
              <span className="font-medium">{vehicle.totalDistance?.toLocaleString() ?? '—'} km</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Capacity</span>
              <span className="font-medium">{vehicle.capacityKg?.toLocaleString() ?? '—'} kg</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
