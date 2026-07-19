// jsPDF unavailable in this environment — stub implementation
import { format } from 'date-fns';

export interface InvoiceItem {
  itemNo: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  currency: string;
}

export interface PaymentInfo {
  method: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  vatNumber?: string;
}

export interface AWBReference {
  awbNumber: string;
  description: string;
  amount: number;
  issueDate: string;
  originCity: string;
  destinationCity: string;
  goodsDescription: string;
  valueETB: number;
}

export interface CustomerInfo {
  name: string;
  contactPerson?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  accountNumber?: string;
  email: string;
  phone?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  shipToInfo?: CustomerInfo;
  paymentInfo?: PaymentInfo;
  items: InvoiceItem[];
  awbReferences: AWBReference[];
  subtotal: number;
  vatPercentage: number;
  vatAmount: number;
  total: number;
  termsAndConditions: string[];
}

/** @deprecated PDF generation is handled server-side. This stub is kept for type compatibility. */
export const generateInvoicePDF = async (_data: InvoiceData): Promise<Blob> => {
  console.warn('[generateInvoicePDF] Client-side PDF generation is not available. Use the server /reports endpoint.');
  // Return a minimal valid empty blob so callers that trigger a download don't crash
  return new Blob(['PDF generation not available in this environment.'], { type: 'application/pdf' });
};
