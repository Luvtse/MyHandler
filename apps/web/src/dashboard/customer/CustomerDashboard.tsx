import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Clock, TrendingUp, Truck, MapPin, User, DollarSign, Bell, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddressBook from '@/dashboard/customer/AddressBook';
import ShipmentTemplates from '@/dashboard/customer/ShipmentTemplates';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const CustomerDashboard = () => {
  const navigate = useNavigate();




  // Mock data for spending analytics
  const spendingData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1400 },
    { month: 'Mar', amount: 1100 },
    { month: 'Apr', amount: 1600 },
    { month: 'May', amount: 1300 },
    { month: 'Jun', amount: 1500 },
  ];

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'templates';
  const [tabValue, setTabValue] = useState(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-muted-foreground">Manage your shipments and addresses</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => navigate('/create-shipment')}>
          <Plus size={16} />
          New Shipment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">256</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 arriving today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,500</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common customer tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/create-shipment">
                  <Package className="h-5 w-5 mb-1" />
                  Create Shipment
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/schedule-pickup">
                  <Truck className="h-5 w-5 mb-1" />
                  Schedule Pickup
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/customer?tab=addresses">
                  <MapPin className="h-5 w-5 mb-1" />
                  Address Book
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/payout-request">
                  <DollarSign className="h-5 w-5 mb-1" />
                  Request Payout
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/leave">
                  <Calendar className="h-5 w-5 mb-1" />
                  Request Leave
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/dashboard/profile">
                  <User className="h-5 w-5 mb-1" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <TabsList>
          <TabsTrigger value="templates">Shipment Templates</TabsTrigger>
          <TabsTrigger value="addresses">Address Book</TabsTrigger>
          <TabsTrigger value="analytics">Spending Analytics</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <ShipmentTemplates />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <AddressBook />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Analytics</CardTitle>
              <CardDescription>Track your shipping expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      name="Spending ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Your recent notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationCenter />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
