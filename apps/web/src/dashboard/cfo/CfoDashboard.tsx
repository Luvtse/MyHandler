// @/dashboard/executive/cfo/CfoDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  PiggyBank,
  AlertCircle,
  BarChart3,
  Zap,
  Bot,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Types
interface FinancialMetrics {
  netProfit: number; // ETB
  cashFlow: number; // ETB
  revenue: number; // ETB
  operatingMargin: number; // %
  burnRate: number; // ETB/day
  runway: number; // days
  roiFleet: number; // %
  roiMarketing: number; // %
  roiTech: number; // %
  ytdGrowth: number; // %
}

interface FinancialInsight {
  id: string;
  title: string;
  message: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

// Mock data
const mockMetrics: FinancialMetrics = {
  netProfit: 1250000,
  cashFlow: 2100000,
  revenue: 8450000,
  operatingMargin: 14.8,
  burnRate: 68000,
  runway: 31,
  roiFleet: 22.4,
  roiMarketing: 8.7,
  roiTech: 35.2,
  ytdGrowth: 24.3,
};

const mockInsights: FinancialInsight[] = [
  {
    id: 'ins-01',
    title: 'Cash Flow Anomaly Detected',
    message: 'Cash inflow dropped 18% vs forecast due to delayed client payments.',
    confidence: 0.96,
    severity: 'high',
    recommendation: 'Follow up with Dashen Brewery and Nile Pharma on overdue invoices.',
  },
  {
    id: 'ins-02',
    title: 'Marketing ROI Alert',
    message: 'TikTok campaign ROI fell to 4.2% (target: ≥10%).',
    confidence: 0.88,
    severity: 'medium',
    recommendation: 'Reallocate budget to email campaigns with 12.5% ROI.',
  },
];

const mockRevenueByMonth = [
  { month: 'Aug', revenue: 3800 },
  { month: 'Sep', revenue: 4100 },
  { month: 'Oct', revenue: 4500 },
  { month: 'Nov', revenue: 4200 },
  { month: 'Dec', revenue: 4850 },
  { month: 'Jan', revenue: 4200 },
];

const CfoDashboard = () => {
  const { user } = useAuth();
  const [metrics] = useState<FinancialMetrics>(mockMetrics);
  const [insights] = useState<FinancialInsight[]>(mockInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Financial data refreshed');
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 300_000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: FinancialInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 border-destructive';
      case 'medium': return 'bg-warning/10 border-warning';
      default: return 'bg-info/10 border-info';
    }
  };

  const getSeverityIcon = (severity: FinancialInsight['severity']) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Zap className="h-4 w-4 text-warning" />;
      default: return <Bot className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CFO Dashboard</h1>
          <p className="text-muted-foreground">
            Financial health, cash flow, and investment performance
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

      {/* Core Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (MTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{metrics.ytdGrowth}% YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.cashFlow.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {metrics.cashFlow > 2000000 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
              )}
              <span>{metrics.cashFlow > 2000000 ? 'Healthy' : 'Monitor'}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Margin</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.operatingMargin}%</div>
            <p className="text-xs text-muted-foreground">Target: ≥12%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.runway} days</div>
            <p className="text-xs text-muted-foreground">Burn: ETB {metrics.burnRate.toLocaleString()}/day</p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Investment Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue (ETB thousands)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value) => [`ETB ${(Number(value) * 1000).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155' 
                  }} 
                />
                <Bar dataKey="revenue">
                  {mockRevenueByMonth.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.month === 'Jan' ? '#38bdf8' : '#64748b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment ROI</CardTitle>
            <CardDescription>Return on key capital expenditures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Fleet Modernization</span>
                  <span className="font-medium">{metrics.roiFleet}%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, metrics.roiFleet)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Marketing Campaigns</span>
                  <span className="font-medium text-destructive">{metrics.roiMarketing}%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-destructive h-2 rounded-full" 
                    style={{ width: `${Math.min(100, metrics.roiMarketing * 2)}%` }} // scale for visibility
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Technology (Driver App)</span>
                  <span className="font-medium">{metrics.roiTech}%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, metrics.roiTech)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Snapshot</CardTitle>
          <CardDescription>Key ratios and benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
              <p className="text-lg font-bold">0.32</p>
              <p className="text-xs text-green-500">Healthy</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Ratio</p>
              <p className="text-lg font-bold">2.1</p>
              <p className="text-xs text-green-500">Strong</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quick Ratio</p>
              <p className="text-lg font-bold">1.8</p>
              <p className="text-xs text-green-500">Good</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROE</p>
              <p className="text-lg font-bold">18.7%</p>
              <p className="text-xs text-green-500">Above target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CfoDashboard;