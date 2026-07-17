import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Truck, Camera, Coffee, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';



const DriverDashboard = () => {
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);
  const { toast } = useToast();

  // Mock data for deliveries
  const deliveries = [
    {
      id: 'del1',
      awb: 'AWB123456',
      address: '123 Main St, New York',
      recipient: 'John Smith',
      phone: '+1 234-567-8900',
      timeWindow: '10:00 - 12:00',
      status: 'In Progress',
      eta: '30 mins',
    },
    {
      id: 'del2',
      awb: 'AWB123457',
      address: '456 Park Ave, New York',
      recipient: 'Jane Doe',
      phone: '+1 234-567-8901',
      timeWindow: '13:00 - 15:00',
      status: 'Pending',
      eta: '2 hours',
    },
  ];

  // Mock data for route statistics
  const routeStats = {
    totalDeliveries: 8,
    completed: 3,
    remaining: 5,
    totalDistance: '45 km',
    avgTimePerDelivery: '25 mins',
  };

  const toggleBreak = () => {
    setIsOnBreak(!isOnBreak);
    if (!isOnBreak) {
      // Start break timer
      const interval = setInterval(() => {
        setBreakTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setBreakTimer(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
    toast({ title: 'Opening Maps', description: `Navigating to ${address}` });
  };

  const captureProof = (awb: string) => {
    toast({ title: 'Capture Proof', description: `Proof capture for ${awb} is coming soon.` });
  };

  const markCompleted = (awb: string) => {
    toast({ title: 'Marked Complete', description: `Delivery ${awb} marked as completed (mock).` });
  };

  const syncNow = () => {
    toast({ title: 'Sync Started', description: 'Offline data sync in progress...' });
    setTimeout(() => {
      toast({ title: 'Sync Complete', description: 'Your offline data is up to date.' });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and routes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isOnBreak ? 'destructive' : 'default'}
            className="flex items-center gap-2"
            onClick={toggleBreak}
          >
            <Coffee size={16} />
            {isOnBreak ? 'End Break' : 'Start Break'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/schedule-pickup">View Full Schedule</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/payout-request">Request Payout</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/leave">My Leave</Link>
          </Button>
        </div>
      </div>

      {isOnBreak && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-600">Break Time</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {formatTime(breakTimer)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.totalDeliveries}</div>
            <Progress
              value={(routeStats.completed / routeStats.totalDeliveries) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {routeStats.completed} completed, {routeStats.remaining} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.totalDistance}</div>
            <p className="text-xs text-muted-foreground mt-2">Optimized route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time/Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStats.avgTimePerDelivery}</div>
            <p className="text-xs text-muted-foreground mt-2">Today's average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Delivery</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30 mins</div>
            <p className="text-xs text-muted-foreground mt-2">ETA to next stop</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Deliveries</CardTitle>
          <CardDescription>Manage your delivery schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Time Window</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.awb}</TableCell>
                    <TableCell>{delivery.address}</TableCell>
                    <TableCell>
                      {delivery.recipient}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {delivery.phone}
                      </span>
                    </TableCell>
                    <TableCell>{delivery.timeWindow}</TableCell>
                    <TableCell>{delivery.eta}</TableCell>
                    <TableCell>
                      <Badge
                        variant={delivery.status === 'In Progress' ? 'default' : 'secondary'}
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openMap(delivery.address)}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => captureProof(delivery.awb)}>
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-500"
                        onClick={() => markCompleted(delivery.awb)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Mode</CardTitle>
          <CardDescription>Access your delivery information without internet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p>Last synced: 5 minutes ago</p>
              <p className="text-sm text-muted-foreground">
                All delivery data is available offline
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={syncNow}>
              <AlertCircle className="h-4 w-4" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
