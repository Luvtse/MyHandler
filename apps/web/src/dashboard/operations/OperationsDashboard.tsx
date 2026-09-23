// @/dashboard/operations/OperationsDashboard.tsx
import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Truck,
  Zap,
  CloudRain,
  ShieldCheck,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useOperationsData } from './useOperationsData';
import type { ShipmentFlowItem, Incident } from '@/types/operations';

// Utility functions (keep these)
const getStatusColor = (status: ShipmentFlowItem['status']) => {
  switch (status) {
    case 'delayed': return 'bg-yellow-100 text-yellow-800';
    case 'customs_hold': return 'bg-orange-100 text-orange-800';
    case 'misrouted': return 'bg-red-100 text-red-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

const getIncidentIcon = (type: Incident['type']) => {
  switch (type) {
    case 'weather': return <CloudRain className="h-4 w-4" />;
    case 'accident': return <AlertTriangle className="h-4 w-4" />;
    case 'customs': return <ShieldCheck className="h-4 w-4" />;
    case 'mechanical': return <HardDrive className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const OperationsDashboard = () => {
  // Single source of truth: /ops/shipments/live, /ops/sla, /ops/incidents/active
  // (30s auto-refresh + manual refresh handled inside the hook).
  const { data, loading, error, refresh } = useOperationsData();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading operations data...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            {error}
            <Button variant="outline" onClick={refresh} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shipmentFlow = data?.shipments ?? [];
  const incidents = data?.incidents ?? [];
  const sla = data?.sla ?? null;

  // Derived real metrics (previously hardcoded placeholders)
  const activeRoutes = new Set(
    shipmentFlow.filter(s => s.status !== 'delivered').map(s => `${s.origin}→${s.destination}`),
  ).size;
  const inTransitVehicles = shipmentFlow.filter(s => s.vehicleId !== 'unassigned').length;
  const avgLoadPct =
    shipmentFlow.length === 0
      ? 0
      : Math.round(shipmentFlow.reduce((sum, s) => sum + s.routeLoadPct, 0) / shipmentFlow.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
          <p className="text-muted-foreground">
            Real-time shipment flow and exception monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
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
      </div>

      {/* Partial-failure banner: snapshot exists but last refresh failed */}
      {error && data && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="py-3 text-sm text-yellow-800">
            Showing data from {new Date(data.lastUpdated).toLocaleTimeString()} — latest
            refresh failed ({error}).
          </CardContent>
        </Card>
      )}

      {/* SLA & Capacity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sla?.onTimeRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">
              {sla?.atRiskCount ?? 0} at risk • {sla?.totalDeliveries ?? 0} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <p className="text-xs text-muted-foreground">Origin → destination pairs in flight</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLoadPct}%</div>
            <p className="text-xs text-muted-foreground">
              Avg. load across {inTransitVehicles} tracked shipments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
            <p className="text-xs text-muted-foreground">
              {incidents.filter(i => i.severity === 'high').length} high severity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Shipment Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Flow</CardTitle>
            <CardDescription>Live status across all hubs</CardDescription>
          </CardHeader>
          <CardContent>
            {shipmentFlow.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No shipments in transit</p>
            ) : (
              <div className="space-y-4">
                {shipmentFlow.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{item.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.origin} → {item.destination}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-mono">{item.estimatedArrival}</span>
                      <span className="text-xs text-muted-foreground">Load: {item.routeLoadPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Incidents & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
            <CardDescription>Weather, accidents, and disruptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active incidents</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="flex items-start gap-3 p-3 bg-background border rounded-md">
                  <div className="mt-0.5">
                    {getIncidentIcon(incident.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{incident.location}</span>
                      <Badge variant={incident.severity === 'high' ? 'destructive' : incident.severity === 'medium' ? 'default' : 'secondary'}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Affecting routes: {incident.affectedRoutes.join(', ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Exception Alerts</CardTitle>
          <CardDescription>System-generated warnings requiring action</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationCenter />
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsDashboard;
