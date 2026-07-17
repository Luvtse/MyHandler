// @/dashboard/account/QuotationHistoryPage.tsx
import React from 'react';
import { FileText, Calendar, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';

const mockVersions = [
  {
    id: 'QT-001-v3',
    version: 3,
    createdAt: '2026-01-07T10:30:00Z',
    createdBy: 'Abebe K.',
    status: 'sent',
    total: 517500,
    changes: ['Increased unit price by 5%', 'Added warehousing service'],
  },
  {
    id: 'QT-001-v2',
    version: 2,
    createdAt: '2026-01-05T14:20:00Z',
    createdBy: 'Abebe K.',
    status: 'draft',
    total: 492000,
    changes: ['Fixed typo in description'],
  },
  {
    id: 'QT-001-v1',
    version: 1,
    createdAt: '2026-01-04T09:15:00Z',
    createdBy: 'Abebe K.',
    status: 'draft',
    total: 492000,
    changes: ['Initial draft'],
  },
];

const QuotationHistoryPage = () => {
  const { clientId, quotationId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation History</h1>
          <p className="text-muted-foreground">Version history for {quotationId}</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockVersions.map((version) => (
          <Card key={version.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Version {version.version}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {version.createdBy}
                    </span>
                  </div>
                </CardDescription>
              </div>
              <Badge variant={version.status === 'sent' ? 'default' : 'secondary'}>
                {version.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <p className="font-medium">Total: ETB {version.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Changes:</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {version.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  /* Load this version */
                }}
              >
                View Version
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuotationHistoryPage;