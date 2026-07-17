import React, { useState, useEffect } from 'react';
import { useAvailableReports, useReportMetadata, useGenerateReport } from '@/hooks/useReports';
import { useShipmentQuery } from '@/hooks/useShipmentQuery';
import { useDashboardSummary } from '@/hooks/useDashboardQuery';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/Card";
import { Button } from '@/shared/ui/Button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  Clock, 
  AlertTriangle,
  Printer,
  ArrowRight,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';

// Mock data for charts
const monthlyData = [
  { name: 'Jan', shipments: 65, revenue: 4000, cost: 2400 },
  { name: 'Feb', shipments: 59, revenue: 3500, cost: 2210 },
  { name: 'Mar', shipments: 80, revenue: 5000, cost: 2900 },
  { name: 'Apr', shipments: 81, revenue: 5100, cost: 3100 },
  { name: 'May', shipments: 76, revenue: 4800, cost: 2800 },
  { name: 'Jun', shipments: 85, revenue: 5700, cost: 3300 },
  { name: 'Jul', shipments: 91, revenue: 6000, cost: 3500 },
  { name: 'Aug', shipments: 87, revenue: 5800, cost: 3400 },
  { name: 'Sep', shipments: 94, revenue: 6300, cost: 3700 },
  { name: 'Oct', shipments: 78, revenue: 5200, cost: 3000 },
  { name: 'Nov', shipments: 85, revenue: 5600, cost: 3200 },
  { name: 'Dec', shipments: 99, revenue: 6800, cost: 3900 },
];

const statusData = [
  { name: 'Delivered', value: 540, color: '#4ade80' },
  { name: 'In Transit', value: 210, color: '#60a5fa' },
  { name: 'Processing', value: 170, color: '#c084fc' },
  { name: 'Delayed', value: 45, color: '#facc15' },
  { name: 'Issues', value: 35, color: '#f87171' },
];

const serviceTypeData = [
  { name: 'Express: Domestic', value: 280 },
  { name: 'Express: Worldwide', value: 200 },
  { name: 'Priority', value: 250 },
  { name: 'Standard', value: 180 },
  { name: 'Economy', value: 90 },
];

// Report type mapping utility
const mapToBackendReportType = (frontendType: string): string => {
  const mapping: { [key: string]: string } = {
    'shipment': 'shipments',
    'shipment-volume': 'shipments',
    'revenue': 'financial',
    'financial': 'financial',
    'performance': 'performance',
    'customer': 'customers',
    'customers': 'customers',
    'inventory': 'shipments', // Map inventory to shipments for now
    'leaves': 'leaves'
  };
  
  return mapping[frontendType] || frontendType;
};

const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('year');
  const [reportType, setReportType] = useState('shipments');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv'>('excel');

  // React Query hooks
  const { isLoading: isLoadingReports } = useAvailableReports();
  const { data: dashboardData } = useDashboardSummary();
  const { data: reportMetadata } = useReportMetadata(mapToBackendReportType(reportType), {
    dateFrom,
    dateTo,
  });
  const generateReportMutation = useGenerateReport();

  // Set default date range (last 30 days)
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setDateFrom(format(thirtyDaysAgo, 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const handleGenerateReport = async (frontendReportType: string) => {
    const backendReportType = mapToBackendReportType(frontendReportType);
    
    try {
      await generateReportMutation.mutateAsync({
        reportType: backendReportType as any,
        format: selectedFormat,
        dateFrom,
        dateTo,
      });
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    }
  };

  const handleExportReport = async (frontendReportType: string) => {
    const backendReportType = mapToBackendReportType(frontendReportType);
    
    try {
      await generateReportMutation.mutateAsync({
        reportType: backendReportType as any,
        format: selectedFormat,
        dateFrom,
        dateTo,
      });
      toast.success(`Report exported as ${selectedFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Report export error:', error);
    }
  };

  const handleQuickReport = (type: string, days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setDateFrom(format(startDate, 'yyyy-MM-dd'));
    setDateTo(format(endDate, 'yyyy-MM-dd'));
    
    handleGenerateReport(type);
  };

  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and analyze business performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Shipment Analytics</CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>Overview of shipment volume and trends</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="shipments" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Revenue & Cost</CardTitle>
            <CardDescription>Financial overview of operations</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                  <Bar dataKey="cost" fill="#94a3b8" name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Status</CardTitle>
            <CardDescription>Distribution of shipments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-green-400"></span>
                <span className="text-xs">Delivered</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-400"></span>
                <span className="text-xs">In Transit</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-purple-400"></span>
                <span className="text-xs">Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                <span className="text-xs">Delayed</span>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>Shipment volume by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={serviceTypeData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Shipments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate and export detailed reports</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Range and Export Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={selectedFormat} onValueChange={(value: 'excel' | 'csv') => setSelectedFormat(value)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => handleGenerateReport(reportType)}
                disabled={generateReportMutation.isPending}
                className="w-full"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickReport('shipments', 7)}
              disabled={generateReportMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickReport('shipments', 30)}
              disabled={generateReportMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickReport('financial', 90)}
              disabled={generateReportMutation.isPending}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Quarterly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickReport('customers', 365)}
              disabled={generateReportMutation.isPending}
            >
              <Users className="h-4 w-4 mr-2" />
              Annual
            </Button>
          </div>

          <Tabs value={reportType} onValueChange={setReportType}>
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipments">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PackageCheck className="h-5 w-5 text-primary" />
                      Shipment Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {reportMetadata?.totalRecords || dashboardData?.totalShipments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Shipments in selected period</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('shipments')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Service Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {serviceTypeData.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Different service types</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('shipments')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Status Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {dashboardData?.deliveredShipments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Delivered shipments</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('shipments')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="financial">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${dashboardData?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Revenue in selected period</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('financial')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Average Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${dashboardData?.averageOrderValue?.toFixed(2) || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Average order value</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('financial')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Profit Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {dashboardData?.profitMargin?.toFixed(1) || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average profit margin</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('financial')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      On-Time Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {dashboardData?.onTimeDeliveryRate?.toFixed(1) || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Delivered on time</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('performance')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Delayed Shipments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {dashboardData?.delayedShipments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Currently delayed</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleExportReport('performance')}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="customers">
              <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Users className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                  <h3 className="text-xl font-medium mb-2">Customer Analytics</h3>
                  <p className="text-muted-foreground mb-6">View top customers, shipping patterns, and account performance</p>
                  <Button 
                    onClick={() => handleExportReport('customers')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Customer Report
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leaves">
              <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                  <h3 className="text-xl font-medium mb-2">Leave Management Report</h3>
                  <p className="text-muted-foreground mb-6">Track employee leave requests, approvals, and balances</p>
                  <Button 
                    onClick={() => handleExportReport('leaves')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Leave Report
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory">
              <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Package className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                  <h3 className="text-xl font-medium mb-2">Inventory Report</h3>
                  <p className="text-muted-foreground mb-6">Track packaging materials and supplies inventory</p>
                  <Button 
                    onClick={() => handleExportReport('inventory')}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Inventory Report
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;