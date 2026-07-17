
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks';
import { 
  Package, 
  Users, 
  MessageCircle, 
  PhoneCall, 
  Search, 
  ArrowRight,
  TruckIcon,
  FileText,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerServiceDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("support");
  const isMultiRole = user?.secondaryRoles && user.secondaryRoles.length > 0;
  
  // Mock data
  const supportTickets = [
    { id: 'tick1', customer: 'John Smith', issue: 'Missing package', status: 'Open', priority: 'High', time: '10 mins ago' },
    { id: 'tick2', customer: 'Sarah Johnson', issue: 'Delivery delay', status: 'In Progress', priority: 'Medium', time: '1 hour ago' },
    { id: 'tick3', customer: 'Michael Brown', issue: 'Wrong address', status: 'Open', priority: 'High', time: '3 hours ago' },
  ];

  const deliveries = [
    { id: 'del1', trackingNumber: 'GE123456789', address: '123 Main St, Boston, MA', time: '10:30 AM', status: 'Pending' },
    { id: 'del2', trackingNumber: 'GE987654321', address: '456 Park Ave, Boston, MA', time: '1:15 PM', status: 'Completed' },
  ];

  const shipmentUpdates = [
    { id: 'ship1', trackingNumber: 'GE123456789', status: 'Out for Delivery', location: 'Boston Distribution Center', timestamp: '09:15 AM' },
    { id: 'ship2', trackingNumber: 'GE987654321', status: 'Delivered', location: 'Customer Address', timestamp: '11:30 AM' },
    { id: 'ship3', trackingNumber: 'GE456789123', status: 'In Transit', location: 'Regional Sorting Facility', timestamp: '08:45 AM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMultiRole ? 'Express Centre Dashboard' : 'Customer Service Dashboard'}
          </h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          {isMultiRole && (
            <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
              Multi-role access
            </Badge>
          )}
        </div>
      </div>

      {isMultiRole ? (
        <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="support">Customer Support</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Operations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="support">
            <CustomerSupportContent tickets={supportTickets} shipmentUpdates={shipmentUpdates} />
          </TabsContent>
          
          <TabsContent value="delivery">
            <DeliveryContent deliveries={deliveries} />
          </TabsContent>
        </Tabs>
      ) : (
        <CustomerSupportContent tickets={supportTickets} shipmentUpdates={shipmentUpdates} />
      )}
    </div>
  );
};

const CustomerSupportContent = ({ tickets, shipmentUpdates }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">6 high priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 in queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipment Inquiries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">4 require escalation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Recent customer inquiries</CardDescription>
              </div>
              <Button asChild>
                <Link to="/dashboard/support/tickets">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-brand mt-0.5" />
                      <div>
                        <div className="font-medium">{ticket.customer}</div>
                        <div className="text-sm text-muted-foreground">{ticket.issue}</div>
                        <div className="text-xs text-muted-foreground">{ticket.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={
                          ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          ticket.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                          ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common customer service tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/support/create-ticket">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Create Support Ticket
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/tracking">
                    <Search className="mr-2 h-4 w-4" />
                    Track Shipment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/create-shipment">
                    <Package className="mr-2 h-4 w-4" />
                    Create New Shipment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/support/customers">
                    <Users className="mr-2 h-4 w-4" />
                    Customer Management
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipment Updates</CardTitle>
              <CardDescription>Recent status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipmentUpdates.map((shipment) => (
                  <div key={shipment.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{shipment.trackingNumber}</div>
                      <Badge 
                        variant="outline" 
                        className={
                          shipment.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                          shipment.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      >
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{shipment.location}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{shipment.timestamp}</div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/dashboard/shipments">
                    View All Updates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DeliveryContent = ({ deliveries }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 completed, 5 pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package Issues</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Pending signatures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">46%</div>
            <p className="text-xs text-muted-foreground">Of daily route</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Schedule</CardTitle>
          <CardDescription>Your delivery assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-start gap-3">
                  <TruckIcon className="h-5 w-5 text-brand mt-0.5" />
                  <div>
                    <div className="font-medium">{delivery.trackingNumber}</div>
                    <div className="text-sm text-muted-foreground">{delivery.address}</div>
                    <div className="text-xs text-muted-foreground">Scheduled: {delivery.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={delivery.status === 'Completed' ? 'secondary' : 'outline'}>
                    {delivery.status}
                  </Badge>
                  {delivery.status === 'Pending' && (
                    <Button size="sm" className="bg-brand hover:bg-brand/90">Update</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Tools</CardTitle>
            <CardDescription>Access driver tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/delivery/route">
                  <TruckIcon className="h-5 w-5 mb-1" />
                  View Route
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/delivery/scan">
                  <Package className="h-5 w-5 mb-1" />
                  Scan Packages
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/delivery/proof">
                  <FileText className="h-5 w-5 mb-1" />
                  Proof of Delivery
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/delivery/schedule">
                  <Bell className="h-5 w-5 mb-1" />
                  Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Service Tools</CardTitle>
            <CardDescription>Support customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/tracking">
                  <Search className="h-5 w-5 mb-1" />
                  Track Packages
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/support/tickets">
                  <MessageCircle className="h-5 w-5 mb-1" />
                  Support Tickets
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/customers">
                  <Users className="h-5 w-5 mb-1" />
                  Customer Info
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/shipments">
                  <Package className="h-5 w-5 mb-1" />
                  Update Status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;
