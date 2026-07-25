// @/dashboard/account/QuotationFormPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Package,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Download,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { generateQuotationPDF } from '@/shared/utils/quotationPdf';

// Define types
interface QuotationLineItem {
  id: string;
  serviceType: 'express' | 'standard' | 'international' | 'warehousing';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotationClient {
  name: string;
  address: string;
  contactName: string;
  contactEmail: string;
}

interface QuotationWithClient {
  id: string;
  quotationNumber: string;
  clientId: string;
  client: QuotationClient;
  validUntil: string;
  lineItems: QuotationLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  preparedBy: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  version: number;
}



const QuotationFormPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: 'Safaricom Ethiopia',
    quotationNumber: 'QT-2026-001',
    validUntil: '',
    notes: 'Thank you for your business!',
  });

  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    {
      id: '1',
      serviceType: 'express',
      description: 'Express Delivery - Addis Ababa to Dire Dawa',
      quantity: 100,
      unitPrice: 120,
      total: 12000,
    },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        serviceType: 'express',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const updateLineItem = (id: string, field: keyof QuotationLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.validUntil) {
      toast.error('Please set a valid until date.');
      return;
    }
    toast.success('Quotation generated successfully!');
    navigate(`/dashboard/account/${clientId}`);
  };

  // ✅ Updated PDF handler
  const handleDownloadPDF = () => {
    if (!formData.validUntil) {
      toast.error('Please set a valid until date before downloading.');
      return;
    }

    const mockQuotation: QuotationWithClient = {
      id: 'QT-001',
      quotationNumber: formData.quotationNumber,
      clientId: clientId!,
      client: {
        name: formData.clientName || 'Safaricom Ethiopia',
        address: 'Bole Road, Addis Ababa',
        contactName: 'Alemayehu Bekele',
        contactEmail: 'alemayehu@safaricom.et',
      },
      validUntil: formData.validUntil,
      lineItems: lineItems.map((item) => ({
        ...item,
        id: item.id,
      })),
      subtotal,
      tax,
      total,
      preparedBy: 'Account Manager',
      createdAt: new Date().toISOString(),
      status: 'draft',
      version: 1,
    };

    try {
      const pdf = generateQuotationPDF({
        ...mockQuotation,
        notes: formData.notes,
        parentId: null,
        createdBy: 'Account Manager',
        updatedAt: new Date().toISOString(),
      } as import('@/types/account').QuotationWithClient);
      pdf.save(`quotation-${formData.quotationNumber}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Quotation</h1>
          <p className="text-muted-foreground">For {formData.clientName}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button type="submit">
            <Send className="h-4 w-4 mr-2" />
            Send Quotation
          </Button>
        </div>
      </div>

      {/* Quotation Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quotationNumber">Quotation Number</Label>
            <Input
              id="quotationNumber"
              value={formData.quotationNumber}
              onChange={(e) =>
                setFormData({ ...formData, quotationNumber: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="validUntil"
                type="date"
                className="pl-10"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Pricing</CardTitle>
          <CardDescription>Add line items for each service</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24 text-right">Qty</TableHead>
                <TableHead className="w-32 text-right">Unit Price</TableHead>
                <TableHead className="w-32 text-right">Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select
                      value={item.serviceType}
                      onValueChange={(v) =>
                        updateLineItem(item.id, 'serviceType', v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express">Express Delivery</SelectItem>
                        <SelectItem value="standard">Standard Shipping</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="warehousing">Warehousing</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, 'description', e.target.value)
                      }
                      placeholder="Service description..."
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, 'quantity', Number(e.target.value))
                      }
                      className="w-20 text-right"
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(item.id, 'unitPrice', Number(e.target.value))
                      }
                      className="w-28 text-right"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ETB {item.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={addLineItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
        </CardContent>
      </Card>

      {/* Summary & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional terms, conditions, or notes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quotation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>ETB {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <span>ETB {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total</span>
              <span className="text-lg">ETB {total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default QuotationFormPage;