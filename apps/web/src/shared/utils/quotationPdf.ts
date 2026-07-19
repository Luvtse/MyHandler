// jsPDF unavailable in this environment — stub implementation
import { QuotationWithClient } from '@/types/account';

export const generateQuotationPDF = (quotation: QuotationWithClient): void => {
  console.warn('PDF generation is not available in this environment.');
  alert('PDF generation is not available. Please use the export feature from the server.');
};
