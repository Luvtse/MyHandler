// @/dashboard/operations/OperationsDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
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
import { useAuth } from '@/features/auth/hooks';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/client';

// Define types (keep these)
interface ShipmentFlowItem {
  id: string;
  origin: string;
  destination: string;
  status: 'in_transit' | 'delayed' | 'customs_hold' | 'misrouted' | 'delivered';
  estimatedArrival: string;
  vehicleId: string;
  routeLoadPct: number;
}

interface SLAData {
  onTimeRate: number;
  totalDeliveries: number;
  atRiskCount: number;
}

interface Incident {
  id: string;
  type: 'weather' | 'accident' | 'customs' | 'mechanical';
  location: string;
  severity: 'low' | 'medium' | 'high';
  affectedRoutes: string[];
}

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

// API service functions — replace with your actual API client
const fetchShipmentFlow = (): Promise<ShipmentFlowItem[]> =>
  fetch('/api/operations/shipment-flow').then(res => res.json());

const fetchSLAData = (): Promise<SLAData> =>
  fetch('/api/operations/sla').then(res => res.json());

const fetchIncidents = (): Promise<Incident[]> =>
  fetch('/api/operations/incidents').then(res => res.json());

const OperationsDashboard = () => {
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shipmentFlow, setShipmentFlow] = useState<ShipmentFlowItem[]>([]);
  const [sla, setSLA] = useState<SLAData | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [flow, slaData, incidentData] = await Promise.all([
        fetchShipmentFlow(),
        fetchSLAData(),
        fetchIncidents(),
      ]);

      setShipmentFlow(flow);
      setSLA(slaData);
      setIncidents(incidentData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load operations data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to fetch operations data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
  if (user?.role === 'operations') {
    // Fire-and-forget audit log
    apiService.request({
      method: 'POST',
      url: '/audit/logs',
      data: {
        action: 'VIEW_OPERATIONS_DASHBOARD',
        resourceId: null,
        metadata: { userAgent: navigator.userAgent },
      },
    }).catch(() => {
      // Non-blocking — don’t disrupt UX if audit fails
    });
  }
}, [user?.role]);

  if (loading && !sla) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading operations data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            {error}
            <Button variant="outline" onClick={loadData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated: {lastUpdated}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

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
            <div className="text-2xl font-bold">24</div> {/* Replace with real data when available */}
            <p className="text-xs text-muted-foreground">+2 vs yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div> {/* Replace with real data */}
            <p className="text-xs text-muted-foreground">Avg. load per vehicle</p>
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