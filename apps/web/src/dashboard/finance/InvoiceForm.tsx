import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Select } from '@/shared/ui/Select';

const InvoiceForm = ({ onSubmit, initialData = {} }: { onSubmit: any, initialData?: any }) => {
  // Currency options
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  // Form state
  const [invoice, setInvoice] = useState({
    customerName: initialData.customerName || '',
    customerEmail: initialData.customerEmail || '',
    invoiceDate: initialData.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialData.dueDate || '',
    currency: initialData.currency || 'USD',
    items: initialData.items || [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: initialData.notes || '',
    ...initialData
  });

  // Calculate totals
  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    // Default VAT rate of 15% (Ethiopian standard)
    return calculateSubtotal() * 0.15;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === invoice.currency);
    return currency ? currency.symbol : '$';
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = value;
    setInvoice({ ...invoice, items: updatedItems });
  };

  // Add new item
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  // Remove item
  const removeItem = (index) => {
    const updatedItems = [...invoice.items];
    updatedItems.splice(index, 1);
    setInvoice({ ...invoice, items: updatedItems });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...invoice,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={invoice.customerName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={invoice.customerEmail}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              name="invoiceDate"
              type="date"
              value={invoice.invoiceDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={invoice.dueDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              value={invoice.currency}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
        
        <div className="space-y-4 mb-4">
          {invoice.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label htmlFor={`item-desc-${index}`}>Description</Label>
                <Input
                  id={`item-desc-${index}`}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="col-span-3">
                <Label htmlFor={`item-price-${index}`}>Unit Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2">{getCurrencySymbol()}</span>
                  <Input
                    id={`item-price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-6"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div className="col-span-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => removeItem(index)}
                  disabled={invoice.items.length <= 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button type="button" variant="outline" onClick={addItem} className="mb-6">
          Add Item
        </Button>
        
        <div className="mb-4">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={invoice.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded h-24"
          />
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{getCurrencySymbol()}{calculateSubtotal().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span>Tax (15%):</span>
            <span>{getCurrencySymbol()}{calculateTax().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Invoice</Button>
      </div>
    </form>
  );
};

export default InvoiceForm;