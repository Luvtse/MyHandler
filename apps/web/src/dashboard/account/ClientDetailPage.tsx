// @/dashboard/account/ClientDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Edit,
  FileSignature,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock data (replace with API)
const mockClient = {
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
  contactName: 'Alemayehu Bekele',
  contactEmail: 'alemayehu@safaricom.et',
  contactPhone: '+251 911 234567',
  address: 'Bole Road, Addis Ababa',
  notes: 'Key strategic partner. Requires SLA < 2h for capital city deliveries.',
  lastInteraction: '2026-01-02',
  totalSpendYTD: 4850000,
  shipmentsThisMonth: 1420,
};

const mockShipments = [
  { id: 'S1001', tracking: 'DE123456789ET', origin: 'Addis Ababa', dest: 'Dire Dawa', status: 'delivered', date: '2026-01-05' },
  { id: 'S1002', tracking: 'DE123456790ET', origin: 'Hawassa', dest: 'Jimma', status: 'in_transit', date: '2026-01-06' },
];

const mockInvoices = [
  { id: 'INV-2026-001', amount: 420000, due: '2026-01-15', status: 'paid' },
  { id: 'INV-2025-120', amount: 398500, due: '2025-12-15', status: 'paid' },
];

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const client = mockClient; // Replace with API call

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!client) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Client Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/dashboard/account')}>
          Back to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{client.industry} • {client.address}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/account/${clientId}/quotation`)}>
            <FileText className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Account
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{client.contactName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{client.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{client.contactPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{client.address}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract & Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Service Level</span>
              <Badge className="bg-purple-100 text-purple-800">{client.serviceLevel}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Contract Expiry</span>
              <span className={new Date(client.contractExpiry) < new Date() ? 'text-destructive' : ''}>
                {new Date(client.contractExpiry).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Assigned Fleet</span>
              <span>{client.assignedFleet} vehicles</span>
            </div>
            <div className="flex justify-between">
              <span>Last Interaction</span>
              <span>{client.lastInteraction}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Monthly Spend</span>
              <span className="font-medium">ETB {client.monthlySpend.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>YTD Spend</span>
              <span className="font-medium">ETB {client.totalSpendYTD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipments (MTD)</span>
              <span className="font-medium">{client.shipmentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>CSAT Score</span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{client.satisfactionScore}%</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shipments">
        <TabsList>
          <TabsTrigger value="shipments">Recent Shipments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notes">Notes & History</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockShipments.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.tracking}</TableCell>
                      <TableCell>{s.origin} → {s.dest}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'delivered' ? 'secondary' : 'default'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>ETB {inv.amount.toLocaleString()}</TableCell>
                      <TableCell>{inv.due}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'paid' ? 'secondary' : 'destructive'}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{client.notes}</p>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="font-medium">Interaction History</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2026-01-02: Contract renewal discussion initiated</li>
                  <li>• 2025-12-15: Q4 business review meeting</li>
                  <li>• 2025-11-10: Onboarding completed for new routes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailPage;