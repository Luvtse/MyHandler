import { PaymentMethod } from '@prisma/client';

// Payment processor interface
export interface PaymentProcessor {
  processPayment(paymentData: PaymentData): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<VerificationResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
}

// Common data structures
export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerId?: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  processorReference?: string;
  redirectUrl?: string;
  error?: string;
}

export interface VerificationResult {
  verified: boolean;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

// Import specific payment processors
import { StripeProcessor } from './stripe';
import { PayPalProcessor } from './paypal';
import { ChapaPay } from './chapa';
import { TelebirrProcessor } from './telebirr';
import { CBEProcessor } from './cbe';

// Payment processor factory
export class PaymentProcessorFactory {
  static getProcessor(method: PaymentMethod): PaymentProcessor {
    switch (method) {
      case 'CREDIT_CARD':
        return new StripeProcessor();
      case 'PAYPAL':
        return new PayPalProcessor();
      case 'CHAPA':
        return new ChapaPay();
      case 'TELEBIRR':
        return new TelebirrProcessor();
      case 'BANK_TRANSFER':
        return new CBEProcessor();
      default:
        throw new Error(`Payment method ${method} not supported`);
    }
  }
}