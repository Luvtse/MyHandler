import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, TrendingUp, CreditCard, Download, Eye, Send } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Link, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, Invoice } from '@/services/finance';
import { useAuth } from '@/features/auth/hooks';

const FinanceDashboard = () => {
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
    queryFn: () => financeService.getRevenueAnalytics({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    enabled: analyticsEnabled,
    retry: 1,
    staleTime: 30000,
  });

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [status, setStatus] = React.useState<string>('all');
  const [customerId, setCustomerId] = React.useState<string>('');
  const [invDateFrom, setInvDateFrom] = React.useState<string>('');
  const [invDateTo, setInvDateTo] = React.useState<string>('');
  const [search, setSearch] = React.useState('');
  const [accountOnly, setAccountOnly] = React.useState<boolean>(false);

  const { data: invoicesResp, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }],
    queryFn: () => financeService.getInvoices({ page, limit, status: status === 'all' ? undefined : status, customerId: customerId || undefined, dateFrom: invDateFrom || undefined, dateTo: invDateTo || undefined }),
    staleTime: 30000,
    retry: 1,
  });

  const invoices = (invoicesResp as any)?.data || [];
  const total = (invoicesResp as any)?.total || 0;
  const totalPages = (invoicesResp as any)?.totalPages || 1;

  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => financeService.sendInvoice(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      const previous = queryClient.getQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }]);
      queryClient.setQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }], (old: any) => {
        const updated = (old?.data || []).map((i: Invoice) => i.id === id ? { ...i, status: 'sent' } : i);
        return { ...old, data: updated };
      });
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) queryClient.setQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice sent' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice['status'] }) => financeService.updateInvoice(id, { status: (String(status).toUpperCase() as any) }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      const previous = queryClient.getQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }]);
      queryClient.setQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }], (old: any) => {
        const updated = (old?.data || []).map((i: Invoice) => i.id === vars.id ? { ...i, status: vars.status } : i);
        return { ...old, data: updated };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(['invoices', { page, limit, status, customerId, invDateFrom, invDateTo, search }], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => financeService.updateInvoice(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentInvoice, setPaymentInvoice] = React.useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [paymentReference, setPaymentReference] = React.useState<string>('');
  const [paymentDate, setPaymentDate] = React.useState<string>('');

  const recordPaymentMutation = useMutation({
    mutationFn: () => financeService.recordPayment({ invoiceId: paymentInvoice?.id || '', amount: paymentAmount, paymentMethod, reference: paymentReference, paidAt: paymentDate || new Date().toISOString() }),
    onSuccess: () => {
      toast({ title: 'Payment recorded' });
      setPaymentOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  const baseInvoices = (Array.isArray(invoices) ? invoices : []);
  const filteredInvoices = accountOnly 
    ? baseInvoices.filter((i: any) => {
        const noteHas = String(i.notes || '').toLowerCase().includes('account');
        const methodHas = String((i.paymentMethod || '')).toUpperCase() === 'ACCOUNT';
        return noteHas || methodHas;
      }) 
    : baseInvoices;
  const paidCount = filteredInvoices.filter((i: any) => String(i.status).toUpperCase() === 'PAID').length;
  const generatedCount = filteredInvoices.length;
  const unpaidCount = filteredInvoices.filter((i: any) => ['DRAFT','SENT','OVERDUE'].includes(String(i.status).toUpperCase())).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">Manage invoices and track payments</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('finance:create_invoice') && (
            <Button className="flex items-center gap-2" asChild>
              <Link to="/dashboard/finance/invoice">Create New Invoice</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/dashboard/finance/payout-requests">Payout Requests</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/reports">View Reports</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(Number((metrics as any)?.totalRevenue || 0))}</div>
            )}
            <p className="text-xs text-muted-foreground">Updated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{Number((metrics as any)?.overdueInvoices || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">Overdue invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(Number((metrics as any)?.averageInvoiceValue || 0))}</div>
            )}
            <p className="text-xs text-muted-foreground">Average per invoice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{(metrics as any)?.pendingPayouts || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedCount}</div>
            <p className="text-xs text-muted-foreground">Created for account billing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount}</div>
            <p className="text-xs text-muted-foreground">Invoices marked as PAID</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidCount}</div>
            <p className="text-xs text-muted-foreground">Draft, sent, or overdue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Finance alerts and payout approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationCenter />
          </CardContent>
        </Card>
      </div>

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
              <div className="flex gap-2 mb-4 items-center">
                <Input placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="max-w-[180px]" />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
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
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={accountOnly} onChange={(e) => setAccountOnly(e.target.checked)} />
                  Account only
                </label>
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
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingInvoices ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      filteredInvoices
                        .filter((inv: any) => !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.customerName?.toLowerCase().includes(search.toLowerCase()))
                        .map((invoice: any) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.customerName}</TableCell>
                            <TableCell>{formatCurrency(Number(invoice.totalAmount || 0))}</TableCell>
                            <TableCell>{invoice.issueDate}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Input defaultValue={invoice.notes || ''} onBlur={(e) => updateNotesMutation.mutate({ id: invoice.id, notes: e.target.value })} />
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {hasPermission('finance:view_invoice') && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast({ title: 'View Invoice' })}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast({ title: 'Download Invoice' })}>
                                <Download className="h-4 w-4" />
                              </Button>
                              {hasPermission('finance:view_invoice') && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => sendInvoiceMutation.mutate(invoice.id)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission('finance:update_payment') && (
                                <Drawer open={paymentOpen && paymentInvoice?.id === invoice.id} onOpenChange={setPaymentOpen}>
                                  <DrawerTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => { setPaymentInvoice(invoice); setPaymentOpen(true); setPaymentAmount(Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0)); }}>
                                      Record Payment
                                    </Button>
                                  </DrawerTrigger>
                                  <DrawerContent>
                                    <DrawerHeader>
                                      <DrawerTitle>Record Payment</DrawerTitle>
                                    </DrawerHeader>
                                    <div className="grid gap-3 p-4">
                                      <Input placeholder="Amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value || '0'))} />
                                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Method" /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                          <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                          <SelectItem value="CASH">Cash</SelectItem>
                                          <SelectItem value="CHECK">Check</SelectItem>
                                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                                          <SelectItem value="CHAPA">Chapa</SelectItem>
                                          <SelectItem value="TELEBIRR">Telebirr</SelectItem>
                                          <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input placeholder="Reference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                                      <Input placeholder="Paid At" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                                    </div>
                                    <DrawerFooter>
                                      <Button onClick={() => recordPaymentMutation.mutate()} disabled={recordPaymentMutation.isPending}>Save</Button>
                                    </DrawerFooter>
                                  </DrawerContent>
                                </Drawer>
                              )}
                              {hasPermission('finance:view_invoice') && (
                                <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'PAID' as any })}>Mark Paid</Button>
                              )}
                              {hasPermission('finance:view_invoice') && (
                                <Button variant="destructive" size="sm" onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'CANCELLED' as any })}>Cancel</Button>
                              )}
                          </TableCell>
                        </TableRow>
                        ))
                      )

                    }
                    {(!loadingInvoices && filteredInvoices.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="p-6 text-center text-sm text-muted-foreground">No invoices found for the selected filters.</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Total: {total}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <div className="text-sm">Page {page} / {totalPages}</div>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
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
              <AgingWidget />
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
              <PaymentMethodsWidget />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;

const AgingWidget: React.FC = () => {
  const { data = [] } = useQuery({ queryKey: ['agingReport'], queryFn: () => financeService.getAgingReport() });
  const top = (data as any[]).slice().sort((a, b) => (b.total || 0) - (a.total || 0)).slice(0, 5);
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>30</TableHead>
            <TableHead>60</TableHead>
            <TableHead>90+</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top.map((row: any) => (
            <TableRow key={row.customerId}>
              <TableCell className="font-medium">{row.customerName}</TableCell>
              <TableCell>${Number(row.current || 0).toFixed(2)}</TableCell>
              <TableCell>${Number(row.thirtyDays || 0).toFixed(2)}</TableCell>
              <TableCell>${Number(row.sixtyDays || 0).toFixed(2)}</TableCell>
              <TableCell>${Number(row.ninetyDays || 0).toFixed(2)}</TableCell>
              <TableCell>${Number(row.total || 0).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const PaymentMethodsWidget: React.FC = () => {
  const { data = [] } = useQuery({ queryKey: ['paymentMethodStats'], queryFn: () => financeService.getPaymentMethodStats(), staleTime: 30000, retry: 1 });
  return (
    <div className="space-y-4">
      {(data as any[]).map((method: any) => (
        <div key={method.method} className="flex items-center">
          <div className="flex-1">
            <div className="text-sm font-medium">{method.method}</div>
            <div className="text-sm text-muted-foreground">{Math.round(method.percentage || 0)}% of payments</div>
          </div>
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${method.percentage || 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
