// @/dashboard/account/RenewalPipelinePage.tsx
import React from 'react';
import { Calendar, AlertCircle, FileSignature, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const mockRenewals = [
  {
    id: 'CLT-002',
    name: 'Dashen Brewery',
    currentContractValue: 280000,
    proposedValue: 320000,
    renewalDate: '2026-03-15',
    stage: 'negotiation' as 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
    probability: 70,
    owner: 'You',
    lastContact: '2026-01-04',
  },
  {
    id: 'CLT-005',
    name: 'Nile Pharma',
    currentContractValue: 150000,
    proposedValue: 180000,
    renewalDate: '2026-02-28',
    stage: 'proposal',
    probability: 85,
    owner: 'You',
    lastContact: '2026-01-06',
  },
];

const RenewalPipelinePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Renewal Pipeline</h1>
        <p className="text-muted-foreground">Track and manage upcoming contract renewals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB 500,000</div>
            <p className="text-xs text-muted-foreground">+12% vs last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals at Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Dashen Brewery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Probability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Nile Pharma</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Renewal Opportunities</CardTitle>
          <CardDescription>Forecasted renewals for Q1 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockRenewals.map((deal) => (
            <div key={deal.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{deal.name}</h3>
                  <p className="text-sm text-muted-foreground">Renewal: {deal.renewalDate}</p>
                </div>
                <Badge variant="secondary">{deal.stage.replace('_', ' ')}</Badge>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Value</p>
                  <p>ETB {deal.currentContractValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Proposed Value</p>
                  <p className="font-medium text-green-600">ETB {deal.proposedValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Probability: {deal.probability}%</span>
                  <span>Owner: {deal.owner}</span>
                </div>
                <Progress value={deal.probability} className="h-2" />
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Send Proposal</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalPipelinePage;