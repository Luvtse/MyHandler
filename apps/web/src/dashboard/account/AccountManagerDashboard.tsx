// @/dashboard/account/AccountManagerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Building,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/hooks';
import { toast } from 'sonner';

// Types
export interface ClientAccount {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'inactive' | 'at_risk';
  monthlySpend: number; // ETB
  contractExpiry: string; // ISO date
  serviceLevel: 'standard' | 'express' | 'premium';
  assignedFleet: number; // # of vehicles dedicated
  activeShipments: number;
  supportTickets: number;
  satisfactionScore: number; // 0–100
}

export interface AccountMetrics {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  totalMonthlyRevenue: number;
  avgSatisfaction: number;
}

// Mock data (replace with API)
const mockAccounts: ClientAccount[] = [
  {
    id: 'CLT-001',
    name: 'Safaricom Ethiopia',
    industry: 'Telecom',
    status: 'active',
    monthlySpend: 420000,
    contractExpiry: '2026-09-30',
    serviceLevel: 'premium',
    assignedFleet: 8,
    activeShipments: 142,
    supportTickets: 3,
    satisfactionScore: 94,
  },
  {
    id: 'CLT-002',
    name: 'Dashen Brewery',
    industry: 'FMCG',
    status: 'at_risk',
    monthlySpend: 280000,
    contractExpiry: '2026-03-15',
    serviceLevel: 'express',
    assignedFleet: 5,
    activeShipments: 98,
    supportTickets: 12,
    satisfactionScore: 68,
  },
  {
    id: 'CLT-003',
    name: 'Ethiopian Airlines Cargo',
    industry: 'Aviation',
    status: 'active',
    monthlySpend: 650000,
    contractExpiry: '2027-01-20',
    serviceLevel: 'premium',
    assignedFleet: 12,
    activeShipments: 210,
    supportTickets: 1,
    satisfactionScore: 97,
  },
];

const mockMetrics: AccountMetrics = {
  totalClients: 24,
  activeClients: 21,
  atRiskClients: 3,
  totalMonthlyRevenue: 8450000,
  avgSatisfaction: 88.4,
};

const getStatusColor = (status: ClientAccount['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'at_risk': return 'bg-red-100 text-red-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-muted';
  }
};

const getServiceLevelColor = (level: ClientAccount['serviceLevel']) => {
  switch (level) {
    case 'premium': return 'bg-purple-100 text-purple-800';
    case 'express': return 'bg-blue-100 text-blue-800';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const AccountManagerDashboard = () => {
  const { user } = useAuth();
  if (user?.role !== 'account_manager') {
    return <div>Access Denied</div>;
  }
  const [accounts] = useState<ClientAccount[]>(mockAccounts);
  const [metrics] = useState<AccountMetrics>(mockMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Account data refreshed');
    }, 600);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
          <p className="text-muted-foreground">
            Oversee client relationships, contracts, and service performance
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeClients}</div>
            <p className="text-xs text-muted-foreground">{metrics.atRiskClients} at risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {metrics.totalMonthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgSatisfaction}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.reduce((sum, a) => sum + a.activeShipments, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Portfolio</CardTitle>
          <CardDescription>Manage accounts and service performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service Level</TableHead>
                <TableHead>Monthly Spend</TableHead>
                <TableHead>Contract Expiry</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(account.status)}>
                      {account.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getServiceLevelColor(account.serviceLevel)}>
                      {account.serviceLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>ETB {account.monthlySpend.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className={new Date(account.contractExpiry) < new Date() ? 'text-destructive' : ''}>
                      {new Date(account.contractExpiry).toLocaleDateString()}
                    </div>
                    {new Date(account.contractExpiry) < new Date(new Date().setDate(new Date().getDate() + 30)) && (
                      <Badge variant="default" className="mt-1 bg-yellow-100 text-yellow-800">Renewal soon</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{account.satisfactionScore}%</span>
                      {account.satisfactionScore < 80 && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
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
            <CardTitle>New Client Onboarding</CardTitle>
            <CardDescription>Set up contracts and service levels</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              + Add Client
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contract Renewals</CardTitle>
            <CardDescription>Manage upcoming expirations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Pipeline
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing & Invoices</CardTitle>
            <CardDescription>Coordinate with finance team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountManagerDashboard;