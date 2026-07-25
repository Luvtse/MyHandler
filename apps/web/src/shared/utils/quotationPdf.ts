// jsPDF unavailable in this environment — stub implementation.
// Returns a save-able object so callers don't need to be rewritten.
import { QuotationWithClient } from '@/types/account';

export interface SaveablePDF {
  save: (filename: string) => void;
}

export const generateQuotationPDF = (quotation: QuotationWithClient): SaveablePDF => {
  console.warn('[generateQuotationPDF] PDF generation is not available in this environment.');
  return {
    save: (filename: string) => {
      alert(`PDF export is not available yet.\nFile: ${filename}`);
    },
  };
};
