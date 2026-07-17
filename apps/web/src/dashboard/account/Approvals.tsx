// @/dashboard/account/ApprovalsDashboard.tsx
import React from 'react';
import { FileText, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockApprovals = [
  {
    id: 'APV-001',
    quotationNumber: 'QT-2026-005',
    clientName: 'Dashen Brewery',
    total: 520000,
    level: 'manager',
    requester: 'Abebe K.',
    requestedAt: '2026-01-07T10:00:00Z',
    status: 'pending',
  },
];

const ApprovalsDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Approval Queue</h1>
      
      <div className="grid gap-4">
        {mockApprovals.map(approval => (
          <Card key={approval.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {approval.quotationNumber}
                </CardTitle>
                <p className="text-muted-foreground">{approval.clientName} • ETB {approval.total.toLocaleString()}</p>
              </div>
              <Badge variant={approval.status === 'pending' ? 'outline' : approval.status === 'approved' ? 'success' : 'destructive'}>
                {approval.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Requested by {approval.requester}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(approval.requestedAt).toLocaleString()}</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary">Level: {approval.level}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovalsDashboard;