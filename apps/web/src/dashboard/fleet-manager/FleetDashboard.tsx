import React, { useEffect } from 'react';
import {
  Truck,
  Car,
  Bike,
  Wrench,
  Fuel,
  MapPin,
  Clock,
  AlertTriangle,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFleetData } from './useFleetData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type VehicleStatus = 'active' | 'maintenance' | 'decommissioned' | 'idle' | 'inTransit' | 'reserved';
type VehicleType   = 'van' | 'truck' | 'motorbike' | 'motorcycle' | 'car' | 'bus';

const getStatusColor = (status: VehicleStatus | string) => {
  switch (status) {
    case 'active':
    case 'inTransit':    return 'bg-green-100 text-green-800';
    case 'maintenance':  return 'bg-orange-100 text-orange-800';
    case 'idle':
    case 'reserved':     return 'bg-yellow-100 text-yellow-800';
    case 'decommissioned': return 'bg-gray-100 text-gray-800';
    default:             return 'bg-muted';
  }
};

const getTypeIcon = (type: VehicleType | string) => {
  switch (type) {
    case 'truck':
    case 'bus':        return <Truck className="h-4 w-4" />;
    case 'van':        return <Car className="h-4 w-4" />;
    case 'motorbike':
    case 'motorcycle': return <Bike className="h-4 w-4" />;
    case 'car':        return <Car className="h-4 w-4" />;
    default:           return <Truck className="h-4 w-4" />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const FleetDashboard = () => {
  // ⚠️ All hooks MUST be called unconditionally before any early return
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { data, loading, error, refresh } = useFleetData();

  // Permission guard — called after hooks so hook order is stable
  useEffect(() => {
    if (user && user.role !== 'fleet_manager' && user.role !== 'admin') {
      toast.error('You do not have permission to access the fleet dashboard');
    }
  }, [user]);

  if (user && user.role !== 'fleet_manager' && user.role !== 'admin') {
    return null;
  }

  const vehicles = data?.vehicles ?? [];
  const metrics  = data?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Monitor and manage your vehicle fleet in real time</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}{' '}
          <button className="underline ml-1" onClick={refresh}>Retry</button>
        </div>
      )}

      {/* Fleet KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Vehicles',   value: metrics?.totalVehicles,          icon: Truck,     sub: null },
          { label: 'Active',           value: metrics?.activeVehicles,          icon: MapPin,    sub: metrics ? `${metrics.utilizationRate}% utilization` : null },
          { label: 'Maintenance Due',  value: metrics?.vehiclesDueMaintenance,  icon: Wrench,    sub: 'Requires attention' },
          { label: 'Avg Fuel Level',   value: metrics ? `${metrics.avgFuelConsumption}%` : null, icon: Fuel, sub: 'Fleet average' },
          { label: 'Idle Vehicles',    value: metrics ? (metrics.totalVehicles - metrics.activeVehicles) : null, icon: Clock, sub: 'Not in use' },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading
                ? <Skeleton className="h-8 w-16" />
                : <div className="text-2xl font-bold">{value ?? '—'}</div>}
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>
            {data ? `Last synced ${new Date(data.lastUpdated).toLocaleTimeString()}` : 'Real-time status of all vehicles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No vehicles found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Location</TableHead>
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
                        <span className="capitalize">{v.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(v.status)}>
                        {v.status === 'inTransit' ? 'In Transit' : v.status}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/fleet/${v.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dashboard/fleet/schedule-maintenance')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              New Maintenance
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workshop Calendar</CardTitle>
            <CardDescription>View and manage the maintenance schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dashboard/fleet/calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Open Calendar
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Route Optimisation</CardTitle>
            <CardDescription>Compute shortest-path routes for your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetDashboard;
