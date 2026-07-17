// @/dashboard/fleet/FleetDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Truck,
  Wrench,
  Fuel,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Types
interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'van' | 'truck' | 'motorbike' | 'car';
  status: 'active' | 'maintenance' | 'decommissioned' | 'idle';
  driverId: string | null;
  driverName: string | null;
  lastMaintenance: string; // ISO date
  nextMaintenanceMileage: number;
  currentMileage: number;
  fuelLevel: number; // 0–100
  location: string;
  lastPing: string; // ISO timestamp
}

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesDueMaintenance: number;
  avgFuelConsumption: number; // L/100km
  utilizationRate: number; // %
}

// Mock data (replace with API)
const mockVehicles: Vehicle[] = [
  { id: 'V001', plateNumber: 'ADD-1234', type: 'truck', status: 'active', driverId: 'D1001', driverName: 'Abebe Kebede', lastMaintenance: '2025-12-10', nextMaintenanceMileage: 150000, currentMileage: 148200, fuelLevel: 65, location: 'Addis Ababa Hub', lastPing: '2026-01-05T10:23:00Z' },
  { id: 'V002', plateNumber: 'HAW-5678', type: 'van', status: 'maintenance', driverId: null, driverName: null, lastMaintenance: '2026-01-02', nextMaintenanceMileage: 80000, currentMileage: 80100, fuelLevel: 0, location: 'Hawassa Workshop', lastPing: '2026-01-02T14:15:00Z' },
  { id: 'V003', plateNumber: 'DIR-9012', type: 'motorbike', status: 'active', driverId: 'D1005', driverName: 'Tigst Yohannes', lastMaintenance: '2025-11-20', nextMaintenanceMileage: 25000, currentMileage: 23400, fuelLevel: 30, location: 'Dire Dawa', lastPing: '2026-01-05T10:25:00Z' },
  { id: 'V004', plateNumber: 'MEK-3456', type: 'truck', status: 'idle', driverId: null, driverName: null, lastMaintenance: '2025-10-15', nextMaintenanceMileage: 200000, currentMileage: 195000, fuelLevel: 80, location: 'Mekelle Yard', lastPing: '2026-01-04T18:00:00Z' },
];

const mockMetrics: FleetMetrics = {
  totalVehicles: 42,
  activeVehicles: 36,
  vehiclesDueMaintenance: 5,
  avgFuelConsumption: 18.7,
  utilizationRate: 85.2,
};

const getStatusColor = (status: Vehicle['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'maintenance': return 'bg-orange-100 text-orange-800';
    case 'idle': return 'bg-yellow-100 text-yellow-800';
    case 'decommissioned': return 'bg-gray-100 text-gray-800';
    default: return 'bg-muted';
  }
};

const getTypeIcon = (type: Vehicle['type']) => {
  switch (type) {
    case 'truck': return <Truck className="h-4 w-4" />;
    case 'van': return <HardDrive className="h-4 w-4" />;
    case 'motorbike': return <TrendingUp className="h-4 w-4" />;
    case 'car': return <Truck className="h-4 w-4" />;
    default: return <Truck className="h-4 w-4" />;
  }
};

const FleetDashboard = () => {
  const { user } = useAuth();
  if (user?.role !== 'fleet_manager') {
    toast.error('You do not have permission to access the fleet dashboard');
    return null;
  }
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [metrics] = useState<FleetMetrics>(mockMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Fleet data refreshed');
    }, 600);
  };

  // Auto-refresh (optional)
  useEffect(() => {
    const interval = setInterval(refreshData, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your vehicle fleet in real time
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Fleet KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">{metrics.utilizationRate}% utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vehiclesDueMaintenance}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fuel Use</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgFuelConsumption}</div>
            <p className="text-xs text-muted-foreground">L/100km</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle Vehicles</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalVehicles - metrics.activeVehicles}
            </div>
            <p className="text-xs text-muted-foreground">Not in use</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>Real-time status of all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.plateNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(v.type)}
                      {v.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(v.status)}>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.driverName || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>{v.fuelLevel}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {v.currentMileage.toLocaleString()} km
                    {v.currentMileage >= v.nextMaintenanceMileage && (
                      <Badge variant="destructive" className="ml-2">Overdue</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {v.location}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.lastPing).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Maintenance</CardTitle>
            <CardDescription>Book service for vehicles due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              + New Maintenance
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assign Driver</CardTitle>
            <CardDescription>Pair unassigned vehicles with drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Assign Now
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fuel Reports</CardTitle>
            <CardDescription>View consumption trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetDashboard;