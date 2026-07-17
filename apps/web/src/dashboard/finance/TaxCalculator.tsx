import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Label } from '@/shared/ui/Label';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';

const VAT_RATE = 0.15; // 15% VAT in Ethiopia
const TOT_RATE = 0.02; // 2% Turnover Tax in Ethiopia
const WITHHOLDING_RATE = 0.02; // 2% Withholding Tax

const TaxCalculator = () => {
  const [amount, setAmount] = useState('');
  const [taxType, setTaxType] = useState('vat');
  const [includeVAT, setIncludeVAT] = useState(false);
  const [result, setResult] = useState(null);

  const calculateTax = () => {
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    let taxAmount = 0;
    let totalAmount = 0;
    let netAmount = 0;

    switch (taxType) {
      case 'vat':
        if (includeVAT) {
          // If amount includes VAT, calculate backward
          netAmount = amountValue / (1 + VAT_RATE);
          taxAmount = amountValue - netAmount;
          totalAmount = amountValue;
        } else {
          // If amount excludes VAT, calculate forward
          taxAmount = amountValue * VAT_RATE;
          netAmount = amountValue;
          totalAmount = amountValue + taxAmount;
        }
        break;
      
      case 'tot':
        taxAmount = amountValue * TOT_RATE;
        netAmount = amountValue;
        totalAmount = amountValue + taxAmount;
        break;
      
      case 'withholding':
        taxAmount = amountValue * WITHHOLDING_RATE;
        netAmount = amountValue - taxAmount;
        totalAmount = amountValue;
        break;
      
      case 'combined':
        // Combined VAT and Withholding
        const vatAmount = amountValue * VAT_RATE;
        const withholdingAmount = amountValue * WITHHOLDING_RATE;
        taxAmount = vatAmount + withholdingAmount;
        netAmount = amountValue;
        totalAmount = amountValue + vatAmount;
        break;
    }

    setResult({
      netAmount: netAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      taxType
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ethiopian Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-type">Tax Type</Label>
              <Select value={taxType} onValueChange={setTaxType}>
                <SelectTrigger id="tax-type">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">Value Added Tax (15%)</SelectItem>
                  <SelectItem value="tot">Turnover Tax (2%)</SelectItem>
                  <SelectItem value="withholding">Withholding Tax (2%)</SelectItem>
                  <SelectItem value="combined">Combined VAT & Withholding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {taxType === 'vat' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-vat"
                  checked={includeVAT}
                  onChange={() => setIncludeVAT(!includeVAT)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="include-vat">Amount includes VAT</Label>
              </div>
            )}

            <Button onClick={calculateTax} className="w-full">Calculate Tax</Button>
          </div>

          {result && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-lg mb-2">Results</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Net Amount:</span>
                  <span className="font-medium">{result.netAmount} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {result.taxType === 'vat' ? 'VAT (15%)' : 
                     result.taxType === 'tot' ? 'TOT (2%)' : 
                     result.taxType === 'withholding' ? 'Withholding Tax (2%)' : 
                     'Combined Taxes'}:
                  </span>
                  <span className="font-medium">{result.taxAmount} ETB</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>{result.totalAmount} ETB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;