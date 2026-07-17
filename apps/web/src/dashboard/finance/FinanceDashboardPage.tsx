import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CreditCard, DollarSign, Download, Eye, FileText, Send, TrendingUp } from 'lucide-react';

import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { financeService, type Invoice } from '@/services/finance';
import { useAuth } from '@/features/auth/hooks';

type InvoiceStatus = Invoice['status'] | 'all';

const statusBadgeVariant: Record<Invoice['status'], string> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

const FinanceDashboardPage = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'invoices';
  const [tabValue, setTabValue] = React.useState(initialTab);

  const queryClient = useQueryClient();
  const analyticsEnabled = !!import.meta.env.VITE_ENABLE_FINANCE_ANALYTICS;

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['financeMetrics'],
    queryFn: () => financeService.getFinanceMetrics(),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 30000,
  });

  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');

  const { data: revenueData = [], isLoading: loadingRevenue } = useQuery({
    queryKey: ['revenueAnalytics', { dateFrom, dateTo }],
    queryFn: () =>
      financeService.getRevenueAnalytics({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 30000,
  });

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [status, setStatus] = React.useState<InvoiceStatus>('all');
  const [customerId, setCustomerId] = React.useState<string>('');
  const [invDateFrom, setInvDateFrom] = React.useState<string>('');
  const [invDateTo, setInvDateTo] = React.useState<string>('');
  const [search, setSearch] = React.useState('');

  const { data: invoicesResp, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }],
    queryFn: () =>
      financeService.getInvoices({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        customerId: customerId || undefined,
        dateFrom: invDateFrom || undefined,
        dateTo: invDateTo || undefined,
      }),
    staleTime: 30000,
    retry: 1,
  });

  const invoices: Invoice[] = (invoicesResp as any)?.data || [];
  const total: number = (invoicesResp as any)?.total || 0;
  const totalPages: number = (invoicesResp as any)?.totalPages || 1;

  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => financeService.sendInvoice(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      const previous = queryClient.getQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }]);
      queryClient.setQueryData(
        ['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }],
        (old: any) => {
          const updated = (old?.data || []).map((i: Invoice) => (i.id === id ? { ...i, status: 'sent' } : i));
          return { ...old, data: updated };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }], context.previous);
      }
      toast({ title: 'Failed to send invoice', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Invoice sent' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const { data: agingData, isLoading: loadingAging } = useQuery({
    queryKey: ['agingReport'],
    queryFn: () => financeService.getAgingReport(),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 30000,
  });

  const { data: paymentMethodsData, isLoading: loadingPaymentMethods } = useQuery({
    queryKey: ['paymentMethodStats', { dateFrom, dateTo }],
    queryFn: () =>
      financeService.getPaymentMethodStats({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 30000,
  });

  const exportInvoices = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await financeService.exportInvoices(format, {
        dateFrom: invDateFrom || undefined,
        dateTo: invDateTo || undefined,
        status: status === 'all' ? undefined : status,
        customerId: customerId || undefined,
      });
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">Monitor invoices, revenue, and payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/finance/invoice-maker">
              <FileText className="h-4 w-4 mr-2" />
              Invoice Maker
            </Link>
          </Button>
          <Button variant="outline" onClick={() => exportInvoices('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {analyticsEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{metrics?.totalRevenue ?? 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{metrics?.monthlyRevenue ?? 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{metrics?.overdueInvoices ?? 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{metrics?.pendingPayouts ?? 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{metrics?.totalCustomers ?? 0}</div>}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Manage and track invoice status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <Input placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="max-w-[180px]" />
                <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={invDateFrom} onChange={(e) => setInvDateFrom(e.target.value)} />
                <Input type="date" value={invDateTo} onChange={(e) => setInvDateTo(e.target.value)} />
                <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-[200px]" />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingInvoices ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="p-6">
                            <Skeleton className="h-6 w-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="p-6 text-center text-sm text-muted-foreground">No invoices found for the selected filters.</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{inv.customerName}</span>
                              <span className="text-xs text-muted-foreground">{inv.customerEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {inv.totalAmount} {inv.currency}
                          </TableCell>
                          <TableCell>{inv.issueDate}</TableCell>
                          <TableCell>{inv.dueDate}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant[inv.status] as any}>{inv.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Drawer>
                              <DrawerTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DrawerTrigger>
                              <DrawerContent>
                                <DrawerHeader>
                                  <DrawerTitle>Invoice {inv.invoiceNumber}</DrawerTitle>
                                </DrawerHeader>
                                <div className="px-4 pb-6 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer</span>
                                    <span>{inv.customerName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span>
                                      {inv.totalAmount} {inv.currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span>{inv.status}</span>
                                  </div>
                                </div>
                                <DrawerFooter>
                                  <Button variant="outline" asChild>
                                    <Link to={`/dashboard/finance/invoice-maker?invoiceId=${encodeURIComponent(inv.id)}`}>
                                      Edit in Invoice Maker
                                    </Link>
                                  </Button>
                                </DrawerFooter>
                              </DrawerContent>
                            </Drawer>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!hasPermission?.('finance:invoice:send') || inv.status !== 'draft' || sendInvoiceMutation.isPending}
                              onClick={() => sendInvoiceMutation.mutate(inv.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Total: {total}</div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Prev
                  </Button>
                  <div className="text-sm">
                    Page {page} / {totalPages}
                  </div>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="h-[300px]">
                {loadingRevenue ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData as any}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                      <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {!loadingRevenue && (!Array.isArray(revenueData) || revenueData.length === 0) && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No revenue data for the selected range.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <CardTitle>Aging Summary</CardTitle>
              <CardDescription>Outstanding balances by aging buckets</CardDescription>
            </CardHeader>
            <CardContent>
              {!analyticsEnabled ? (
                <div className="text-sm text-muted-foreground">Analytics disabled.</div>
              ) : loadingAging ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">30 Days</TableHead>
                        <TableHead className="text-right">60 Days</TableHead>
                        <TableHead className="text-right">90+ Days</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(agingData as any[] | undefined)?.length ? (
                        (agingData as any[]).map((r) => (
                          <TableRow key={r.customerId}>
                            <TableCell className="font-medium">{r.customerName}</TableCell>
                            <TableCell className="text-right">{r.current}</TableCell>
                            <TableCell className="text-right">{r.thirtyDays}</TableCell>
                            <TableCell className="text-right">{r.sixtyDays}</TableCell>
                            <TableCell className="text-right">{r.ninetyDays}</TableCell>
                            <TableCell className="text-right">{r.total}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="p-6 text-center text-sm text-muted-foreground">No aging data available.</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              {!analyticsEnabled ? (
                <div className="text-sm text-muted-foreground">Analytics disabled.</div>
              ) : loadingPaymentMethods ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(paymentMethodsData as any[] | undefined)?.length ? (
                        (paymentMethodsData as any[]).map((r) => (
                          <TableRow key={r.method}>
                            <TableCell className="font-medium">{r.method}</TableCell>
                            <TableCell className="text-right">{r.count}</TableCell>
                            <TableCell className="text-right">{r.totalAmount}</TableCell>
                            <TableCell className="text-right">{r.percentage}%</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <div className="p-6 text-center text-sm text-muted-foreground">No payment method data available.</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Recent finance-related activity</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationCenter />
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboardPage;

