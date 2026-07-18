// @/dashboard/executive/ceo/CeoDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Target,
  Bot,
  RefreshCw,
  AlertCircle,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Types
interface StrategicMetrics {
  revenue: number; // ETB
  ytdGrowth: number; // %
  customerRetention: number; // %
  netPromoterScore: number; // -100 to 100
  onTimeDelivery: number; // %
  operatingMargin: number; // %
  totalClients: number;
  activeShipments: number;
}

interface StrategicInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  source: 'finance' | 'operations' | 'marketing' | 'clients';
}

interface StrategicGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'off_track';
}

// Mock data
const mockMetrics: StrategicMetrics = {
  revenue: 8450000,
  ytdGrowth: 24.3,
  customerRetention: 88.2,
  netPromoterScore: 72,
  onTimeDelivery: 92.4,
  operatingMargin: 14.8,
  totalClients: 24,
  activeShipments: 1420,
};

const mockInsights: StrategicInsight[] = [
  {
    id: 'ins-01',
    title: 'Revenue Growth at Risk',
    message: 'Q1 growth slowed to 8% MoM (target: 12%) due to customs delays.',
    confidence: 0.91,
    severity: 'medium',
    recommendation: 'Accelerate Djibouti port partnership to reduce clearance time.',
    source: 'operations',
  },
  {
    id: 'ins-02',
    title: 'Client Retention Opportunity',
    message: '3 enterprise clients show declining shipment volume.',
    confidence: 0.87,
    severity: 'medium',
    recommendation: 'Assign Account Managers for proactive check-ins.',
    source: 'clients',
  },
];

const mockGoals: StrategicGoal[] = [
  {
    id: 'goal-01',
    title: 'Annual Revenue Target',
    target: 120000000,
    current: 8450000,
    unit: 'ETB',
    status: 'on_track',
  },
  {
    id: 'goal-02',
    title: 'Client Retention Rate',
    target: 90,
    current: 88.2,
    unit: '%',
    status: 'at_risk',
  },
  {
    id: 'goal-03',
    title: 'On-Time Delivery',
    target: 95,
    current: 92.4,
    unit: '%',
    status: 'at_risk',
  },
];

const CeoDashboard = () => {
  const { user } = useAuth();
  const [metrics] = useState<StrategicMetrics>(mockMetrics);
  const [insights] = useState<StrategicInsight[]>(mockInsights);
  const [goals] = useState<StrategicGoal[]>(mockGoals);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Strategic data refreshed');
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 300_000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: StrategicInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive';
      case 'medium': return 'bg-amber-50 border-amber-400';
      default: return 'bg-blue-50 border-blue-400';
    }
  };

  const getSourceIcon = (source: StrategicInsight['source']) => {
    switch (source) {
      case 'finance': return <DollarSign className="h-4 w-4" />;
      case 'operations': return <Package className="h-4 w-4" />;
      case 'marketing': return <BarChart3 className="h-4 w-4" />;
      case 'clients': return <Users className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: StrategicGoal['status']) => {
    switch (status) {
      case 'on_track': return 'text-green-500';
      case 'at_risk': return 'text-yellow-500';
      case 'off_track': return 'text-destructive';
      default: return '';
    }
  };

  const getStatusIcon = (status: StrategicGoal['status']) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'at_risk': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'off_track': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  // Business Health Score (0-100)
  const healthScore = Math.round(
    (metrics.ytdGrowth / 30 * 25) +
    (metrics.customerRetention / 100 * 25) +
    (metrics.onTimeDelivery / 100 * 25) +
    (metrics.operatingMargin / 20 * 25)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CEO Dashboard</h1>
          <p className="text-muted-foreground">
            Cross-functional strategic overview and business health
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

      {/* Business Health Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Business Health Score</h2>
              <p className="text-muted-foreground">Composite of growth, retention, ops, and finance</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{healthScore}/100</div>
              <Badge variant={healthScore > 80 ? 'default' : healthScore > 60 ? 'secondary' : 'destructive'}>
                {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Banner */}
      <div className="space-y-3">
        {insights.map(insight => (
          <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getSourceIcon(insight.source)}
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

      {/* Core Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{metrics.ytdGrowth}% YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerRetention}%</div>
            <p className="text-xs text-muted-foreground">Target: ≥90%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onTimeDelivery}%</div>
            <p className="text-xs text-muted-foreground">Target: ≥95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.operatingMargin}%</div>
            <p className="text-xs text-muted-foreground">Target: ≥15%</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Goal Progress</CardTitle>
          <CardDescription>Key company objectives for 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{goal.title}</h3>
                  {getStatusIcon(goal.status)}
                </div>
                <div className="text-2xl font-bold">
                  {goal.current.toFixed(1)}{goal.unit}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Target: {goal.target}{goal.unit}
                </p>
                <div className="mt-2 w-full bg-secondary h-2 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      goal.status === 'on_track' ? 'bg-green-500' : 
                      goal.status === 'at_risk' ? 'bg-yellow-500' : 'bg-destructive'
                    }`} 
                    style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Functional Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Promoter Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.netPromoterScore}</div>
            <p className="text-xs text-muted-foreground">Industry avg: 50</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executive Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links to Department Dashboards */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Drill down into functional areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild>
              <a href="/dashboard/cfo">
                <DollarSign className="h-4 w-4 mr-2" />
                CFO
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/coo">
                <Package className="h-4 w-4 mr-2" />
                COO
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/cmo">
                <BarChart3 className="h-4 w-4 mr-2" />
                CMO
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/account">
                <Users className="h-4 w-4 mr-2" />
                Account Mgmt
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CeoDashboard;