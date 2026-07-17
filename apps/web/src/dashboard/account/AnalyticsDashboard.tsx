// @/dashboard/account/AnalyticsDashboard.tsx
import React from 'react';
import { TrendingUp, DollarSign, Package, Star, AlertCircle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockMonthlyData = [
  { month: 'Aug', spend: 380000, shipments: 1100 },
  { month: 'Sep', spend: 410000, shipments: 1250 },
  { month: 'Oct', spend: 450000, shipments: 1400 },
  { month: 'Nov', spend: 420000, shipments: 1300 },
  { month: 'Dec', spend: 485000, shipments: 1420 },
  { month: 'Jan', spend: 420000, shipments: 1420 },
];

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTD Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB 420,000</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 at risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CSAT</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">↑ 2% from Q3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">of contracts renewed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly spend over last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`ETB ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="spend" stroke="#2563eb" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At-Risk Clients</CardTitle>
            <CardDescription>Accounts needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded">
                <div>
                  <p className="font-medium">Dashen Brewery</p>
                  <p className="text-sm text-muted-foreground">CSAT: 68% • 12 tickets</p>
                </div>
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                <div>
                  <p className="font-medium">Nile Pharma</p>
                  <p className="text-sm text-muted-foreground">Contract expires in 22 days</p>
                </div>
                <AlertCircle className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;