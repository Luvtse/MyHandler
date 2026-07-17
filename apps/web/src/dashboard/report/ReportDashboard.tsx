import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Calendar } from '@/shared/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, Calendar as CalendarIcon, BarChart3, PieChart, LineChart as LineChartIcon } from 'lucide-react';

const ReportDashboard = () => {
  const [date, setDate] = useState<Date>();

  // Mock data for reports
  const reports = [
    {
      id: 'report1',
      name: 'Monthly Performance',
      type: 'Performance',
      schedule: 'Monthly',
      lastRun: '2024-02-20',
      status: 'Completed',
    },
    {
      id: 'report2',
      name: 'Customer Analysis',
      type: 'Analytics',
      schedule: 'Weekly',
      lastRun: '2024-02-19',
      status: 'Scheduled',
    },
  ];

  // Mock data for analytics
  const performanceData = [
    { month: 'Jan', deliveries: 150, onTime: 145 },
    { month: 'Feb', deliveries: 180, onTime: 172 },
    { month: 'Mar', deliveries: 160, onTime: 155 },
    { month: 'Apr', deliveries: 200, onTime: 190 },
    { month: 'May', deliveries: 190, onTime: 182 },
    { month: 'Jun', deliveries: 220, onTime: 210 },
  ];

  // Mock data for report metrics
  const metrics = [
    { name: 'Total Reports', value: '24', change: '+4', trend: 'up' },
    { name: 'Scheduled Reports', value: '12', change: '+2', trend: 'up' },
    { name: 'Report Usage', value: '85%', change: '+5%', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Dashboard</h1>
          <p className="text-muted-foreground">Create and manage custom reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText size={16} />
          Create Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
            <CardDescription>Create custom reports with selected metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Name</label>
                <Input placeholder="Enter report name" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metrics</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="deliveries" />
                    <label htmlFor="deliveries">Deliveries</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="performance" />
                    <label htmlFor="performance">Performance</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="revenue" />
                    <label htmlFor="revenue">Revenue</label>
                  </div>
                </div>
              </div>

              <Button className="w-full">Generate Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Delivery performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#8884d8"
                    name="Total Deliveries"
                  />
                  <Line
                    type="monotone"
                    dataKey="onTime"
                    stroke="#82ca9d"
                    name="On-Time Deliveries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>View and manage automated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.schedule}</TableCell>
                    <TableCell>{report.lastRun}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          report.status === 'Completed'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                        }`}
                      >
                        {report.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDashboard;