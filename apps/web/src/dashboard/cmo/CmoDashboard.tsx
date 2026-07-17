// @/dashboard/executive/cmo/CmoDashboard.tsx (UPDATED)
import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Mail,
  Smartphone,
  Target,
  Bot,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/features/auth/hooks';
import type {ClientAcquisition, AtRiskClient, MarketingMetrics, CampaignPerformance} from '@/types/executive'
import { toast } from 'sonner';


// Mock data
const mockMetrics: MarketingMetrics = {
  totalLeads: 1240,
  conversionRate: 8.7,
  costPerAcquisition: 1850,
  roi: 12.4,
  emailOpenRate: 42.3,
  socialEngagement: 3.8,
  websiteTraffic: 28500,
  retentionRate: 88.2,
};

const mockCampaigns: CampaignPerformance[] = [
  {
    id: 'camp-01',
    name: 'Q4 Enterprise Email',
    channel: 'email',
    spend: 45000,
    leads: 320,
    conversions: 42,
    roi: 18.5,
    cac: 1071,
  },
  {
    id: 'camp-02',
    name: 'TikTok Awareness',
    channel: 'social',
    spend: 60000,
    leads: 180,
    conversions: 12,
    roi: 4.2,
    cac: 5000,
  },
];

// NEW: Account Manager integration data
const mockClientAcquisitions: ClientAcquisition[] = [
  {
    id: 'CLT-005',
    clientName: 'Nile Pharma',
    sourceChannel: 'email',
    quotationValue: 180000,
    status: 'won',
    accountManager: 'Abebe K.',
    createdAt: '2026-01-05',
  },
  {
    id: 'CLT-006',
    clientName: 'Lion Brewery',
    sourceChannel: 'search',
    quotationValue: 220000,
    status: 'pending',
    accountManager: 'Selamawit G.',
    createdAt: '2026-01-06',
  },
];

const mockAtRiskClients: AtRiskClient[] = [
  {
    id: 'CLT-002',
    name: 'Dashen Brewery',
    reason: 'contract_expiring',
    lastContact: '2026-01-04',
    accountManager: 'Abebe K.',
  },
];

const funnelData = [
  { value: 28500, name: 'Website Visitors' },
  { value: 1240, name: 'Leads' },
  { value: 108, name: 'Quotations' }, // ← From Account Manager
  { value: 42, name: 'Won Clients' },  // ← From Account Manager
];

const CmoDashboard = () => {
  const { user } = useAuth();
  const [metrics] = useState<MarketingMetrics>(mockMetrics);
  const [campaigns] = useState<CampaignPerformance[]>(mockCampaigns);
  const [clientAcquisitions] = useState<ClientAcquisition[]>(mockClientAcquisitions);
  const [atRiskClients] = useState<AtRiskClient[]>(mockAtRiskClients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Marketing & sales data refreshed');
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 300_000);
    return () => clearInterval(interval);
  }, []);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'social': return <Smartphone className="h-4 w-4" />;
      case 'search': return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CMO Dashboard</h1>
          <p className="text-muted-foreground">
            Marketing performance + Account Manager pipeline integration
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

      {/* Core Marketing KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotation Conversion</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">From leads to quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.costPerAcquisition.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cost per won client</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">90-day active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrated Funnel: Marketing → Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Integrated Growth Funnel</CardTitle>
            <CardDescription>From lead to retained client</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Count']}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155' 
                  }} 
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#38bdf8" fillOpacity={0.8 - index * 0.2} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign ROI */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI</CardTitle>
            <CardDescription>Return on investment by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map(camp => (
                <div key={camp.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(camp.channel)}
                      <span className="font-medium">{camp.name}</span>
                    </div>
                    <Badge className={camp.roi > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {camp.roi}% ROI
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Spend</p>
                      <p>ETB {camp.spend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CAC</p>
                      <p>ETB {camp.cac.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Account Manager Integration Panels */}

      {/* Won Deals from Marketing */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Client Acquisitions</CardTitle>
          <CardDescription>Won deals attributed to marketing channels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientAcquisitions.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getChannelIcon(client.sourceChannel)}
                      {client.sourceChannel}
                    </div>
                  </TableCell>
                  <TableCell>ETB {client.quotationValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'won' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.accountManager}</TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* At-Risk Clients Needing Marketing Support */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Clients</CardTitle>
          <CardDescription>Account Manager flagged clients needing retention campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskClients.map(client => (
              <div key={client.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.reason === 'contract_expiring' && 'Contract expires soon'}
                    {client.reason === 'low_satisfaction' && 'Low satisfaction score'}
                    {client.reason === 'high_tickets' && 'High support tickets'}
                  </p>
                  <p className="text-xs mt-1">AM: {client.accountManager} • Last contact: {client.lastContact}</p>
                </div>
                <Button size="sm" variant="outline">
                  Launch Retention Campaign
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing + Sales Collaboration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Marketing-Sourced Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB 1.2M</div>
            <p className="text-sm text-muted-foreground">MTD from marketing channels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Sales Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 days</div>
            <p className="text-sm text-muted-foreground">From lead to won deal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Email Campaigns</span>
            </div>
            <p className="text-sm text-muted-foreground">18.5% ROI</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CmoDashboard;