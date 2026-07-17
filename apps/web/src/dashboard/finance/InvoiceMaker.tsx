import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoiceMakerPDF, InvoiceData, AWBReference } from '@/shared/utils/generateInvoiceMaker';
import { ShipmentService } from '@/services';
import { userService } from '@/services/userService';
import { financeService } from '@/services/finance';

interface Shipment {
  awbIssueDate: string;
  awbNumber: string;
  originCity: string;
  destinationCity: string;
  goodsDescription: string;
  valueETB: number;
  currency?: string;
}

interface Customer {
  id: string;
  name: string;
}

const deriveShipmentValueETB = (s: any): number => {
  const tryNum = (v: any) => (typeof v === 'number' ? v : Number(v || 0));
  if (s?.chargesInformation?.amount !== undefined) return tryNum(s.chargesInformation.amount);
  if (s?.chargesAmount !== undefined) return tryNum(s.chargesAmount);
  if (s?.charges?.amount !== undefined) return tryNum(s.charges?.amount);
  if (s?.totalValue !== undefined) return tryNum(s.totalValue);
  if (s?.totalAmount !== undefined) return tryNum(s.totalAmount);
  if (s?.subtotal !== undefined) return tryNum(s.subtotal);
  if (s?.amount !== undefined) return tryNum(s.amount);
  return 0;
};

const deriveShipmentCurrency = (s: any): string => {
  return (
    s?.chargesInformation?.currency ||
    s?.chargesCurrency ||
    s?.totalCurrency ||
    s?.currency ||
    'ETB'
  );
};

interface Props {}

const InvoiceMaker: React.FC<Props> = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | 'prepaid' | 'collect' | 'account'>('all');
  const [fetchedShipments, setFetchedShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string>('');

  useEffect(() => {
    // Fetch customers list
    const fetchCustomers = async () => {
      try {
        const resp = await userService.getUsers({ role: 'customer', status: 'active', page: 1, limit: 200 });
        const list = resp.users.map((u) => ({ id: u.id, name: u.name }));
        setCustomers(list);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch customers list',
          variant: 'destructive'
        });
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;
    setInvoiceData((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        name: customer.name,
      }
    }));
  }, [selectedCustomer, customers]);

  const shipmentsQuery = useQuery({
    queryKey: ['accountShipments', selectedCustomer, dateRange.startDate, dateRange.endDate, paymentTypeFilter],
    queryFn: async () => {
      const shipments = await ShipmentService.getShipments({
        userId: selectedCustomer,
        dateFrom: dateRange.startDate,
        dateTo: dateRange.endDate,
        limit: 200,
        paymentType: paymentTypeFilter === 'all' ? undefined : paymentTypeFilter,
      } as any);
      return Array.isArray(shipments) ? shipments : (shipments as any)?.data || [];
    },
    enabled: false,
    staleTime: 30000,
    retry: 1,
    select: (rows: any[]) => rows
      .map((s: any) => ({
      awbIssueDate: s.createdAt,
      awbNumber: s.reference || s.awb || s.awbNumber,
      originCity: s.originAddress,
      destinationCity: s.destinationAddress,
      goodsDescription: s.notes || s.serviceLevel || 'Shipment Service',
      valueETB: deriveShipmentValueETB(s),
      currency: deriveShipmentCurrency(s),
    }))
  });

  useEffect(() => {
    if (shipmentsQuery.data) setFetchedShipments(shipmentsQuery.data as any);
  }, [shipmentsQuery.data]);

  const fetchShipments = async () => {
    if (!selectedCustomer || !dateRange.startDate || !dateRange.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a customer and date range',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      await shipmentsQuery.refetch();
    } finally {
      setLoading(false);
    }
  };
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`,
    date: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    companyInfo: {
      name: 'Your Company Name',
      address: 'Company Address',
      phone: '+251 11 234 5678',
      email: 'info@company.com',
      website: 'www.company.com',
      vatNumber: 'VAT123456789'
    },
    customerInfo: {
      name: '',
      contactPerson: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      email: '',
      phone: ''
    },
    shipToInfo: {
      name: '',
      contactPerson: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      email: '',
      phone: ''
    },

    paymentInfo: {
      method: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      swiftCode: ''
    },
    items: [],
    awbReferences: [],
    subtotal: 0,
    vatPercentage: 15,
    vatAmount: 0,
    total: 0,
    termsAndConditions: [
      'Payment is due within 30 days of invoice date',
      'Late payments are subject to a 2% monthly interest charge',
      'Bank charges are to be borne by the payer'
    ]
  });

  const [newAwb, setNewAwb] = useState<Partial<AWBReference>>({
    awbNumber: '',
    description: '',
    amount: 0,
    issueDate: '',
    originCity: '',
    destinationCity: '',
    goodsDescription: '',
    valueETB: 0
  });

  const addShipmentAsAwb = useCallback((shipment: Shipment) => {
    if (invoiceData.awbReferences.some(ref => ref.awbNumber === shipment.awbNumber)) {
      toast({ title: 'Duplicate AWB', description: 'This AWB has already been added.', variant: 'destructive' });
      return;
    }
    const newReference: AWBReference = {
      awbNumber: shipment.awbNumber,
      description: shipment.goodsDescription,
      amount: shipment.valueETB,
      issueDate: shipment.awbIssueDate,
      originCity: shipment.originCity,
      destinationCity: shipment.destinationCity,
      goodsDescription: shipment.goodsDescription,
      valueETB: shipment.valueETB,
      currency: shipment.currency
    };

    setInvoiceData((prev) => {
      const newAwbReferences = [...prev.awbReferences, newReference];
      const newItems = newAwbReferences.map((ref, index) => ({
        itemNo: index + 1,
        description: `AWB: ${ref.awbNumber} - ${ref.goodsDescription}`,
        quantity: 1,
        unit: 'Service',
        unitPrice: ref.valueETB,
        amount: ref.valueETB,
        currency: shipment.currency || 'ETB'
      }));
      const newSubtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const newVatAmount = newSubtotal * (prev.vatPercentage / 100);
      const newTotal = newSubtotal + newVatAmount;
      return {
        ...prev,
        awbReferences: newAwbReferences,
        items: newItems,
        subtotal: newSubtotal,
        vatAmount: newVatAmount,
        total: newTotal
      };
    });
  }, []);

  const addAwbReference = useCallback(() => {
    if (!newAwb.awbNumber || !newAwb.description || newAwb.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all AWB reference fields with valid values.',
        variant: 'destructive'
      });
      return;
    }
    if (invoiceData.awbReferences.some(ref => ref.awbNumber === newAwb.awbNumber)) {
      toast({ title: 'Duplicate AWB', description: 'This AWB has already been added.', variant: 'destructive' });
      return;
    }

    const completeAwb: AWBReference = {
      awbNumber: newAwb.awbNumber!,
      description: newAwb.description!,
      amount: newAwb.amount!,
      issueDate: newAwb.issueDate || '',
      originCity: newAwb.originCity || '',
      destinationCity: newAwb.destinationCity || '',
      goodsDescription: newAwb.goodsDescription || newAwb.description!,
      valueETB: newAwb.valueETB || newAwb.amount!,
      currency: 'ETB'
    };

    setInvoiceData((prev) => {
      const newAwbReferences = [...prev.awbReferences, completeAwb];
      const newItems = newAwbReferences.map((ref, index) => ({
        itemNo: index + 1,
        description: `AWB: ${ref.awbNumber} - ${ref.description}`,
        quantity: 1,
        unit: 'Service',
        unitPrice: ref.amount,
        amount: ref.amount,
        currency: 'ETB'
      }));

      return {
        ...prev,
        awbReferences: newAwbReferences,
        items: newItems
      };
    });

    setNewAwb({
      awbNumber: '',
      description: '',
      amount: 0,
    issueDate: '',
    originCity: '',
    destinationCity: '',
    goodsDescription: '',
    valueETB: 0
    });
  }, [newAwb, toast]);

  const removeAwbReference = useCallback((index: number) => {
    setInvoiceData((prev) => {
      const newAwbReferences = prev.awbReferences.filter((_, i) => i !== index);
      const newItems = newAwbReferences.map((ref, i) => ({
        itemNo: i + 1,
        description: `AWB: ${ref.awbNumber} - ${ref.description}`,
        quantity: 1,
        unit: 'Service',
        unitPrice: ref.amount,
        amount: ref.amount,
        currency: 'ETB'
      }));

      return {
        ...prev,
        awbReferences: newAwbReferences,
        items: newItems
      };
    });
  }, []);

  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * (invoiceData.vatPercentage / 100);
    const total = subtotal + vatAmount;
    setInvoiceData((prev) => ({
      ...prev,
      subtotal,
      vatAmount,
      total
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceData.items, invoiceData.vatPercentage]);

  useEffect(() => {
    const fillCustomer = async () => {
      if (!selectedCustomer) return;
      try {
        const user = await userService.getUserById(selectedCustomer);
        setInvoiceData((prev) => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            name: user.businessInfo?.companyName || user.name || prev.customerInfo.name,
            email: user.email || prev.customerInfo.email,
            phone: (user as any).phone || prev.customerInfo.phone
          }
        }));
      } catch (e) {}
    };
    fillCustomer();
  }, [selectedCustomer]);

  const saveDraft = useCallback(async () => {
    if (!selectedCustomer || invoiceData.items.length === 0) {
      toast({ title: 'Validation Error', description: 'Select customer and add items', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const created = await financeService.createInvoice({
        customerId: selectedCustomer,
        issueDate: format(invoiceData.date, 'yyyy-MM-dd'),
        dueDate: format(invoiceData.dueDate, 'yyyy-MM-dd'),
        currency: 'ETB',
        items: invoiceData.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, awbNumber: it.description.split(' ')[1] }))
      });
      setSavedInvoiceId(created.id);
      toast({ title: 'Saved', description: 'Invoice saved as draft' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [selectedCustomer, invoiceData, toast]);

  const sendInvoice = useCallback(async () => {
    if (!savedInvoiceId) {
      await saveDraft();
    }
    if (!savedInvoiceId) return;
    setSending(true);
    try {
      await financeService.sendInvoice(savedInvoiceId);
      toast({ title: 'Sent', description: 'Invoice sent to customer' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send invoice', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  }, [savedInvoiceId, saveDraft, toast]);

  const generatePDF = useCallback(async () => {
    if (invoiceData.items.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one AWB reference before generating PDF',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pdfBlob = await generateInvoiceMakerPDF(invoiceData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Invoice PDF has been generated successfully.'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice PDF';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      console.error('PDF generation error:', error);
    }
  }, [invoiceData, toast]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select Customer & Shipments</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label>Customer</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Payment Type</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="prepaid">Prepaid</option>
              <option value="collect">Collect</option>
              <option value="account">Account</option>
            </select>
          </div>
        </div>
        <Button
          onClick={fetchShipments}
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Fetching...' : 'Fetch Shipments'}
          <Search className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {fetchedShipments.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Shipments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">AWB Number</th>
                  <th className="text-left py-2">Issue Date</th>
                  <th className="text-left py-2">From City</th>
                  <th className="text-left py-2">To City</th>
                  <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Value</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetchedShipments.map((shipment) => (
                  <tr key={shipment.awbNumber} className="border-b">
                    <td className="py-2">{shipment.awbNumber}</td>
                    <td className="py-2">{format(new Date(shipment.awbIssueDate), 'yyyy-MM-dd')}</td>
                    <td className="py-2">{shipment.originCity}</td>
                    <td className="py-2">{shipment.destinationCity}</td>
                    <td className="py-2">{shipment.goodsDescription}</td>
                    <td className="py-2 text-right">{shipment.valueETB.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        onClick={() => addShipmentAsAwb(shipment)}
                      >
                        Add to Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>Save Draft</Button>
          <Button variant="outline" onClick={sendInvoice} disabled={sending}>Send Invoice</Button>
          <Button onClick={generatePDF} className="bg-brand hover:bg-brand-600" disabled={invoiceData.awbReferences.length === 0 || invoiceData.total <= 0}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Invoice Number</Label>
            <Input
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={format(invoiceData.date, 'yyyy-MM-dd')}
              onChange={(e) => setInvoiceData({ ...invoiceData, date: new Date(e.target.value) })}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={format(invoiceData.dueDate, 'yyyy-MM-dd')}
              onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: new Date(e.target.value) })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add AWB Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>AWB Number</Label>
            <Input
              value={newAwb.awbNumber}
              onChange={(e) => setNewAwb({ ...newAwb, awbNumber: e.target.value })}
              placeholder="Enter AWB number"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newAwb.description}
              onChange={(e) => setNewAwb({ ...newAwb, description: e.target.value })}
              placeholder="Enter service description"
            />
          </div>
          <div>
            <Label>Amount (ETB)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newAwb.amount}
              onChange={(e) => setNewAwb({ ...newAwb, amount: parseFloat(e.target.value) || 0 })}
              placeholder="Enter amount"
            />
          </div>
        </div>
        <Button onClick={addAwbReference} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add AWB Reference
        </Button>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">AWB References</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">AWB Number</th>
                <th className="text-left py-2">Issue Date</th>
                <th className="text-left py-2">From City</th>
                <th className="text-left py-2">To City</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Value (ETB)</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.awbReferences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No AWB references added
                  </td>
                </tr>
              ) : (
                invoiceData.awbReferences.map((ref, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{ref.awbNumber}</td>
                    <td className="py-2">{ref.issueDate ? format(new Date(ref.issueDate), 'yyyy-MM-dd') : '-'}</td>
                    <td className="py-2">{ref.originCity || '-'}</td>
                    <td className="py-2">{ref.destinationCity || '-'}</td>
                    <td className="py-2">{ref.goodsDescription || ref.description}</td>
                    <td className="py-2 text-right">{ref.valueETB ? ref.valueETB.toFixed(2) : ref.amount.toFixed(2)} {ref.currency || 'ETB'}</td>
                    <td className="py-2 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAwbReference(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bill To Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={invoiceData.customerInfo.name}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  customerInfo: { ...invoiceData.customerInfo, name: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                value={invoiceData.customerInfo.contactPerson}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  customerInfo: { ...invoiceData.customerInfo, contactPerson: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={invoiceData.customerInfo.address}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  customerInfo: { ...invoiceData.customerInfo, address: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={invoiceData.customerInfo.city}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    customerInfo: { ...invoiceData.customerInfo, city: e.target.value }
                  })}
                />
              </div>

            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={invoiceData.customerInfo.postalCode}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    customerInfo: { ...invoiceData.customerInfo, postalCode: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={invoiceData.customerInfo.country}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    customerInfo: { ...invoiceData.customerInfo, country: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={invoiceData.customerInfo.email}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    customerInfo: { ...invoiceData.customerInfo, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={invoiceData.customerInfo.phone}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    customerInfo: { ...invoiceData.customerInfo, phone: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ship To</h3>
            <div>
              <Label>Recipient Name</Label>
              <Input
                value={invoiceData.shipToInfo.name}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  shipToInfo: { ...invoiceData.shipToInfo, name: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                value={invoiceData.shipToInfo.contactPerson}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  shipToInfo: { ...invoiceData.shipToInfo, contactPerson: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={invoiceData.shipToInfo.address}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  shipToInfo: { ...invoiceData.shipToInfo, address: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={invoiceData.shipToInfo.city}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    shipToInfo: { ...invoiceData.shipToInfo, city: e.target.value }
                  })}
                />
              </div>

            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={invoiceData.shipToInfo.postalCode}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    shipToInfo: { ...invoiceData.shipToInfo, postalCode: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={invoiceData.shipToInfo.country}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    shipToInfo: { ...invoiceData.shipToInfo, country: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={invoiceData.shipToInfo.email}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    shipToInfo: { ...invoiceData.shipToInfo, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={invoiceData.shipToInfo.phone}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    shipToInfo: { ...invoiceData.shipToInfo, phone: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>Payment Method</Label>
            <Input
              value={invoiceData.paymentInfo?.method || ''}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                paymentInfo: { ...invoiceData.paymentInfo, method: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Bank Name</Label>
            <Input
              value={invoiceData.paymentInfo?.bankName || ''}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                paymentInfo: { ...invoiceData.paymentInfo, bankName: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Account Name</Label>
            <Input
              value={invoiceData.paymentInfo?.accountName || ''}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                paymentInfo: { ...invoiceData.paymentInfo, accountName: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input
              value={invoiceData.paymentInfo?.accountNumber || ''}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                paymentInfo: { ...invoiceData.paymentInfo, accountNumber: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>SWIFT Code</Label>
            <Input
              value={invoiceData.paymentInfo?.swiftCode || ''}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                paymentInfo: { ...invoiceData.paymentInfo, swiftCode: e.target.value }
              })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Summary</h2>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">ETB {invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT ({invoiceData.vatPercentage}%):</span>
                <span className="font-medium">ETB {invoiceData.vatAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">ETB {invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="font-semibold mb-2">Per-currency totals</div>
                <div className="space-y-1">
                  {Object.entries(
                    invoiceData.items.reduce((acc: Record<string, number>, item) => {
                      const cur = item.currency || 'ETB';
                      acc[cur] = (acc[cur] || 0) + Number(item.amount || 0);
                      return acc;
                    }, {})
                  ).map(([cur, amt]) => (
                    <div key={cur} className="flex justify-between">
                      <span className="text-gray-600">{cur} subtotal:</span>
                      <span className="font-medium">{Number(amt).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Terms and Conditions</Label>
            <Textarea
              value={invoiceData.termsAndConditions.join('\n')}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                termsAndConditions: e.target.value.split('\n').filter(line => line.trim() !== '')
              })}
              rows={4}
              placeholder="Add any additional terms and conditions here..."
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceMaker;
