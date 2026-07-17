import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Delivery {
  id: string;
  awb: string;
  address: string;
  recipient: string;
  phone: string;
  timeWindow: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  eta: string;
}

const DriverSchedule = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toast } = useToast();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<Delivery['status']>('Pending');
  const [updateNotes, setUpdateNotes] = useState('');
  const [issueType, setIssueType] = useState('Delivery Attempt Failed');
  const [issueNotes, setIssueNotes] = useState('');

  // Mock data for scheduled deliveries
  const scheduledDeliveries: Delivery[] = [
    {
      id: 'del1',
      awb: 'AWB123456',
      address: '123 Main St, New York',
      recipient: 'John Smith',
      phone: '+1 234-567-8900',
      timeWindow: '10:00 - 12:00',
      status: 'Pending',
      eta: '30 mins',
    },
    {
      id: 'del2',
      awb: 'AWB123457',
      address: '456 Park Ave, New York',
      recipient: 'Jane Doe',
      phone: '+1 234-567-8901',
      timeWindow: '13:00 - 15:00',
      status: 'In Progress',
      eta: '2 hours',
    },
  ];

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Schedule</h1>
          <p className="text-muted-foreground">Manage your delivery schedule and routes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        <div className="md:col-span-8">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>AWB</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Time Window</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell>{delivery.awb}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {delivery.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{delivery.recipient}</p>
                              <p className="text-sm text-muted-foreground">{delivery.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {delivery.timeWindow}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setUpdateStatus(delivery.status);
                                  setUpdateNotes('');
                                  setUpdateOpen(true);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Update
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-500"
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setIssueType('Delivery Attempt Failed');
                                  setIssueNotes('');
                                  setIssueOpen(true);
                                }}
                              >
                                <AlertCircle className="h-4 w-4" />
                                Issue
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              {/* Similar table structure for completed deliveries */}
            </TabsContent>

            <TabsContent value="cancelled">
              {/* Similar table structure for cancelled deliveries */}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">AWB</p>
                <p className="font-medium">{selectedDelivery?.awb}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p className="font-medium">{selectedDelivery?.recipient}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{selectedDelivery?.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Window</p>
                <p className="font-medium">{selectedDelivery?.timeWindow}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Status</label>
              <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as Delivery['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Notes</label>
              <Input value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setUpdateOpen(false);
                toast({ title: 'Delivery Updated', description: `AWB ${selectedDelivery?.awb} set to ${updateStatus}.` });
              }}
            >
              Save update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">AWB</p>
                <p className="font-medium">{selectedDelivery?.awb}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p className="font-medium">{selectedDelivery?.recipient}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Issue type</label>
              <Select value={issueType} onValueChange={(v) => setIssueType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delivery Attempt Failed">Delivery Attempt Failed</SelectItem>
                  <SelectItem value="Address Problem">Address Problem</SelectItem>
                  <SelectItem value="Vehicle Issue">Vehicle Issue</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Notes</label>
              <Input value={issueNotes} onChange={(e) => setIssueNotes(e.target.value)} placeholder="Describe the issue" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setIssueOpen(false);
                toast({ title: 'Issue Reported', description: `AWB ${selectedDelivery?.awb}: ${issueType}.` });
              }}
            >
              Submit issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverSchedule;