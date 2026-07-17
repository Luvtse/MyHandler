// @/dashboard/executive/coo/CooDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Clock,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Zap,
  Bot,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '@/features/auth/hooks';  
import { toast } from 'sonner';

// Types (defined later in types.ts)
interface OperationalMetrics {
  onTimeDeliveryRate: number;
  avgFulfillmentTime: number; // hours
  shipmentsProcessed: number;
  activeVehicles: number;
  fleetUtilization: number;
  inventoryTurnover: number;
  costPerShipment: number;
  customsClearanceTime: number; // hours
}

interface OperationalInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

// Mock data (replace with API)
const mockMetrics: OperationalMetrics = {
  onTimeDeliveryRate: 92.4,
  avgFulfillmentTime: 8.2,
  shipmentsProcessed: 1420,
  activeVehicles: 38,
  fleetUtilization: 85.2,
  inventoryTurnover: 12.4,
  costPerShipment: 295.5,
  customsClearanceTime: 14.3,
};

const mockInsights: OperationalInsight[] = [
  {
    id: 'ins-01',
    title: 'Customs Delay Alert',
    message: 'Customs clearance time at Djibouti port increased by 32% this week.',
    confidence: 0.94,
    severity: 'high',
    recommendation: 'Reroute high-priority shipments via Berbera port or pre-clear documentation.',
  },
  {
    id: 'ins-02',
    title: 'Fleet Imbalance Detected',
    message: 'Addis Ababa hub has 22% idle vehicles while Dire Dawa is at 98% capacity.',
    confidence: 0.89,
    severity: 'medium',
    recommendation: 'Rebalance fleet allocation between hubs.',
  },
];

const mockFulfillmentTrend = [
  { day: 'Mon', time: 8.5 },
  { day: 'Tue', time: 8.3 },
  { day: 'Wed', time: 8.7 },
  { day: 'Thu', time: 9.2 }, // spike
  { day: 'Fri', time: 8.1 },
  { day: 'Sat', time: 7.9 },
  { day: 'Sun', time: 8.0 },
];

const CooDashboard = () => {
  const { user } = useAuth();
  const [metrics] = useState<OperationalMetrics>(mockMetrics);
  const [insights] = useState<OperationalInsight[]>(mockInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Operational data refreshed');
    }, 600);
  };

  // Auto-refresh every 5 mins
  useEffect(() => {
    const interval = setInterval(refreshData, 300_000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: OperationalInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive';
      case 'medium': return 'bg-warning/10 border-warning';
      default: return 'bg-info/10 border-info';
    }
  };

  const getSeverityIcon = (severity: OperationalInsight['severity']) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Zap className="h-4 w-4 text-warning" />;
      default: return <Bot className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">COO Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time operational efficiency and supply chain health
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

      {/* AI Insights Banner */}
      <div className="space-y-3">
        {insights.map(insight => (
          <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getSeverityIcon(insight.severity)}
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
        ))}
      </div>

      {/* Core Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onTimeDeliveryRate}%</div>
            <p className="text-xs text-muted-foreground">Target: ≥95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Fulfillment Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgFulfillmentTime}h</div>
            <p className="text-xs text-muted-foreground">-0.3h vs last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.fleetUtilization}%</div>
            <p className="text-xs text-muted-foreground">38 active vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Shipment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.costPerShipment}</div>
            <p className="text-xs text-muted-foreground">-ETB 12 vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Trend</CardTitle>
            <CardDescription>Avg. time (hours) over last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockFulfillmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customs Performance</CardTitle>
            <CardDescription>Clearance time by port</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Djibouti</span>
                  <span className="font-medium">{metrics.customsClearanceTime}h</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-destructive h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (metrics.customsClearanceTime / 24) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Berbera</span>
                  <span className="font-medium">9.2h</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '38%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Health</CardTitle>
            <CardDescription>Warehouse turnover & stockouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between">
                <span>Turnover Ratio</span>
                <span className="font-medium">{metrics.inventoryTurnover}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Target: ≥10</p>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-md border border-yellow-800/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">3 stockouts this week (Addis Hub)</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Inventory Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Regional Breakdown (if applicable) */}
      {user?.role === 'regional_manager' && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Performance: {user.region}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Regional-specific metrics would appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CooDashboard;