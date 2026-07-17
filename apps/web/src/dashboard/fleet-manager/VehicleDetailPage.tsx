// src/dashboard/fleet-manager/VehicleDetailPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateMaintenancePDF } from '@/shared/utils/generateMaintenancePDF';
import type {
  Vehicle,
  VehicleWithMaintenance,
  MaintenanceRecord as SharedMaintenanceRecord,
} from '@/types/fleet';
import {
  Truck,
  Wrench,
  Fuel,
  MapPin,
  Calendar,
  User,
  FileText,
  History,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Use shared types
type VehicleDetailData = VehicleWithMaintenance;
type MaintenanceRecord = SharedMaintenanceRecord;

// Mock service (replace with real API call)
const fetchVehicleDetail = async (id: string): Promise<VehicleDetailData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockVehicleDetails[id] || mockVehicleDetails.V001;
};

// Mock data — ensure it matches VehicleWithMaintenance exactly
const mockVehicleDetails: Record<string, VehicleDetailData> = {
  V001: {
    id: 'V001',
    vehicleDetail: 'Scania R450 Truck', // required
    licensePlate: 'ADD-1234', // required
    plateNumber: 'ADD-1234',
    type: 'truck',
    make: 'Scania',
    model: 'R450',
    year: 2023,
    vin: 'VIN123456789',
    capacityKg: 12000,
    currentMileage: 148200,
    lastMaintenanceDate: '2025-12-10', // ✅ Correct property name
    nextMaintenanceMileage: 150000,
    fuelLevel: 65,
    currentLocation: 'Addis Ababa Hub',
    status: 'active',
    driverId: 'D1001',
    driverName: 'Abebe Kebede',
    driverEmail: 'abebe@example.com',
    fleetManagerId: null,
    fleetManagerName: null,
    lastPing: '2026-01-05T10:23:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    deletedAt: null,
    updatedAt: '2026-01-05T10:23:00Z',
    location: 'Addis Ababa Hub',
    maintenanceHistory: [
      {
        id: 'M101',
        vehicleId: 'V001',
        type: 'full_inspection',
        status: 'completed',
        scheduledAt: '2025-12-10T00:00:00Z',
        completedAt: '2025-12-10T00:00:00Z',
        mileageAtService: 140000,
        cost: 2450,
        notes: 'Replaced brake pads',
        vendor: 'Yohannes Auto',
        performedById: 'MECH001',
        performedByName: 'Mechanic Yohannes',
        createdBy: 'ADMIN001',
        createdByName: 'Admin',
        createdAt: '2025-12-10T00:00:00Z',
        updatedAt: '2025-12-10T00:00:00Z',
        deletedAt: null,
        calendarSyncButton: '',
        lastMaintenanceDate: '2025-12-10', // optional; can be omitted if redundant
      },
      {
        id: 'M100',
        vehicleId: 'V001',
        type: 'oil_change',
        status: 'completed',
        scheduledAt: '2025-09-05T00:00:00Z',
        completedAt: '2025-09-05T00:00:00Z',
        mileageAtService: 120000,
        cost: 850,
        notes: 'Standard service',
        vendor: 'Yohannes Auto',
        performedById: 'MECH001',
        performedByName: 'Mechanic Yohannes',
        createdBy: 'ADMIN001',
        createdByName: 'Admin',
        createdAt: '2025-09-05T00:00:00Z',
        updatedAt: '2025-09-05T00:00:00Z',
        deletedAt: null,
        calendarSyncButton: '',
        lastMaintenanceDate: '2025-09-05',
      },
    ],
    upcomingServices: ['Brake fluid flush', 'Tire alignment'],
    insuranceExpiry: '2026-08-15',
    registrationExpiry: '2026-11-30',
    totalTrips: 1240,
    totalDistance: 892500,
  },
};

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportPDF = () => {
    if (!vehicle) return;
    const pdf = generateMaintenancePDF(vehicle);
    pdf.save(`maintenance-record-${vehicle.licensePlate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.vehicleDetail}</h1>
          <p className="text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
        </div>
        <Badge className={getStatusColor(vehicle.status)}>
          {vehicle.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehicle Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Driver</p>
                <p className="font-medium">{vehicle.driverName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.location}</span>
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
          <CardHeader>
            <CardTitle>Compliance & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Insurance Expiry</p>
              <p className={new Date(vehicle.insuranceExpiry) < new Date() ? 'text-destructive' : ''}>
                {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Expiry</p>
              <p className={new Date(vehicle.registrationExpiry) < new Date() ? 'text-destructive' : ''}>
                {new Date(vehicle.registrationExpiry).toLocaleDateString()}
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
          <div className="space-y-4">
            {vehicle.maintenanceHistory.map(record => (
              <div key={record.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{record.type.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.scheduledAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">{record.notes}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">ETB {record.cost?.toLocaleString() ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    by {record.performedByName || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
                  const start = new Date(vehicle.maintenanceHistory[0].scheduledAt);
                  const end = new Date(start.getTime() + 2 * 3600 * 1000);
                  const ics = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'BEGIN:VEVENT',
                    `UID:${vehicle.id}@fleet.com`,
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
          <CardHeader>
            <CardTitle>Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {vehicle.upcomingServices.map((service, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fleet Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Trips</span>
              <span className="font-medium">{vehicle.totalTrips}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Distance</span>
              <span className="font-medium">{vehicle.totalDistance.toLocaleString()} km</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Avg. Trips/Day</span>
              <span className="font-medium">24</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetailPage;