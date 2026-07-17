import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useNavigate } from 'react-router-dom';

type PaymentMethod = 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'PAYPAL';

const PayoutRequestForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !paymentMethod || !description) {
      toast({ title: 'Invalid form', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const payload: any = {
      amount: Number(amount),
      currency,
      paymentMethod,
      bankAccount: paymentMethod === 'BANK_TRANSFER' ? bankAccount : undefined,
      mobileNumber: paymentMethod === 'MOBILE_MONEY' ? mobileNumber : undefined,
      description,
    };
    const { success, error } = await apiService.request<{ id: string }>({
      method: 'POST',
      url: API_ENDPOINTS.finance.PAYOUT_REQUESTS,
      data: payload,
    });
    setSubmitting(false);
    if (!success) {
      toast({ title: 'Request failed', description: error || 'Could not submit payout request', variant: 'destructive' });
      return;
    }
    toast({ title: 'Payout request submitted', description: 'Finance team will review your request' });
    navigate('/dashboard/finance/payout-requests');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Request Payout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payout Details</CardTitle>
          <CardDescription>Submit a payout request for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Amount *</Label>
              <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Currency *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === 'BANK_TRANSFER' && (
              <div>
                <Label>Bank Account Details *</Label>
                <Textarea rows={3} value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Enter your bank account number and bank name..." />
              </div>
            )}
            {paymentMethod === 'MOBILE_MONEY' && (
              <div>
                <Label>Mobile Number *</Label>
                <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter your mobile money number" />
              </div>
            )}
            <div>
              <Label>Description *</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the purpose of this payout request..." />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payout Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutRequestForm;
