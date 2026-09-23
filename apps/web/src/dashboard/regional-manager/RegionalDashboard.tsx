// @/dashboard/regional-manager/RegionalDashboard.tsx
import React from 'react';
import {
  MapPin,
  Package,
  DollarSign,
  Users,
  Truck,
  AlertCircle,
  TrendingUp,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import RegionSelector from '@/dashboard/regional-manager/RegionSelector';
import { getRegionalData } from '@/services/regional';
import type { RegionalMetrics, RegionalInsight } from '@/services/regional';

const RegionalDashboard = () => {
  const { region: regionParam } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Use URL param as source of truth for the selected region
  const currentRegion = regionParam || 'addis_ababa';

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['regional-dashboard', currentRegion],
    queryFn: () => getRegionalData(currentRegion),
    staleTime: 2 * 60_000, // 2 min
    retry: 1,
    refetchInterval: 5 * 60_000, // auto-refresh every 5 mins
  });

  const metrics: RegionalMetrics | undefined = data?.metrics;
  const insights: RegionalInsight[] = data?.insights ?? [];
  const benchmarks = data?.benchmarks;

  // Handle region change from selector — keep URL in sync
  const handleRegionChange = (newRegion: string) => {
    navigate(`/dashboard/regional/${newRegion}`);
  };

  const refreshData = () => {
    qc.invalidateQueries({ queryKey: ['regional-dashboard', currentRegion] });
  };

  const getSeverityColor = (severity: RegionalInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive';
      case 'medium': return 'bg-amber-50 border-amber-400';
      default: return 'bg-blue-50 border-blue-400';
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MapPin className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading regional data...</p>
        </div>
      </div>
    );
  }

  if (isError && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load regional data.
          <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to refresh regional data. <button className="underline ml-1" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Regional Dashboard: {metrics?.region ?? currentRegion}
          </h1>
          <p className="text-muted-foreground">
            Localized performance and operational health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RegionSelector
            currentRegion={currentRegion}
            onRegionChange={handleRegionChange}
            className="w-48"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map(insight => (
            <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {insight.title}
                      <Badge variant="secondary">Confidence: {Math.round(insight.confidence * 100)}%</Badge>
                    </h3>
                    <p className="mt-1 text-sm">{insight.message}</p>
                    <p className="mt-2 text-sm font-medium text-primary">{insight.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-semibold">All Systems Operational</h3>
                  <p className="mt-1 text-sm">No critical issues detected in {metrics.region} region.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Core Regional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipments (Today)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.shipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">32% of national total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeClients}</div>
            <p className="text-xs text-muted-foreground">+1 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.fleetUtilization}%</div>
            <p className="text-xs text-muted-foreground">Target: ≤90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>On-Time Delivery</CardTitle>
            <CardDescription>Percentage of shipments delivered on time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.onTimeDelivery}%</div>
            <div className="mt-2 w-full bg-secondary h-2 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  metrics.onTimeDelivery >= 95 ? 'bg-green-500' :
                  metrics.onTimeDelivery >= 90 ? 'bg-yellow-500' : 'bg-destructive'
                }`} 
                style={{ width: `${metrics.onTimeDelivery}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">National avg: {benchmarks?.nationalOnTimeDelivery ?? 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Fulfillment Time</CardTitle>
            <CardDescription>Hours from order to delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.avgFulfillmentTime}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.avgFulfillmentTime < 8 ? 'Excellent' : 'Needs optimization'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost per Shipment</CardTitle>
            <CardDescription>Average operational cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">ETB {metrics.costPerShipment}</div>
            <p className="text-xs text-muted-foreground mt-1">National avg: ETB {(benchmarks?.nationalCostPerShipment ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Health */}
      <Card>
        <CardHeader>
          <CardTitle>Client Retention</CardTitle>
          <CardDescription>90-day active client retention rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{metrics.clientRetention}%</div>
              <p className="text-sm text-muted-foreground">Target: ≥85%</p>
            </div>
            <div className="text-right">
              <Button variant="outline" asChild>
                <a href={`/dashboard/account?region=${currentRegion}`}>
                  View Client Details
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Comparison (if data available) */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Benchmark</CardTitle>
          <CardDescription>Performance vs other regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-lg font-bold">{metrics.onTimeDelivery}%</p>
              <p className="text-xs">
                {metrics.onTimeDelivery > (benchmarks?.nationalOnTimeDelivery ?? 0) ? (
                  <span className="text-green-500">↑ Above national avg</span>
                ) : (
                  <span className="text-destructive">↓ Below national avg</span>
                )}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Cost per Shipment</p>
              <p className="text-lg font-bold">ETB {metrics.costPerShipment}</p>
              <p className="text-xs">
                {metrics.costPerShipment < (benchmarks?.nationalCostPerShipment ?? Infinity) ? (
                  <span className="text-green-500">↓ Better than avg</span>
                ) : (
                  <span className="text-destructive">↑ Higher than avg</span>
                )}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Fleet Utilization</p>
              <p className="text-lg font-bold">{metrics.fleetUtilization}%</p>
              <p className="text-xs">
                {metrics.fleetUtilization > 85 ? (
                  <span className="text-yellow-500">⚠️ High utilization</span>
                ) : (
                  <span className="text-green-500">✅ Optimal</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalDashboard;