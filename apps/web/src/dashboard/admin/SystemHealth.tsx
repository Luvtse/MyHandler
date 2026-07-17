import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, RefreshCw, Server, Cpu, HardDrive } from 'lucide-react';

const SystemHealth = () => {
  // Mock data for system metrics
  const systemMetrics = {
    cpu: 45,
    memory: 68,
    disk: 72,
    uptime: '15d 7h 23m',
    activeUsers: 127,
    responseTime: '245ms',
  };

  // Mock data for performance chart
  const performanceData = [
    { time: '00:00', cpu: 30, memory: 45 },
    { time: '04:00', cpu: 35, memory: 50 },
    { time: '08:00', cpu: 45, memory: 65 },
    { time: '12:00', cpu: 40, memory: 60 },
    { time: '16:00', cpu: 50, memory: 70 },
    { time: '20:00', cpu: 45, memory: 65 },
    { time: '23:59', cpu: 35, memory: 55 },
  ];

  // Mock data for system alerts
  const systemAlerts = [
    {
      id: 'alert1',
      type: 'warning',
      message: 'High memory usage detected',
      timestamp: '10 minutes ago',
    },
    {
      id: 'alert2',
      type: 'success',  
      message: 'Database backup completed successfully',
      timestamp: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Monitor system performance and status</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCw size={16} />
          Refresh Metrics
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu}%</div>
            <Progress value={systemMetrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memory}%</div>
            <Progress value={systemMetrics.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.disk}%</div>
            <Progress value={systemMetrics.disk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.uptime}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active Users: {systemMetrics.activeUsers}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>System resource usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8884d8"
                  name="CPU Usage"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#82ca9d"
                  name="Memory Usage"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.type === 'warning' ? 'destructive' : 'default'}
              >
                {alert.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertTitle className="ml-2">
                  {alert.type === 'warning' ? 'Warning' : 'Success'}
                </AlertTitle>
                <AlertDescription className="ml-2">
                  {alert.message}
                  <span className="block text-xs text-muted-foreground mt-1">
                    {alert.timestamp}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;