// jsPDF unavailable in this environment — stub implementation
import type { Shipment } from "@/types/shipment";

interface GenerateAwbPdfOptions {
  shipment: Shipment;
  awbNumber: string;
  logo: string;
}

/** @deprecated Client-side AWB PDF generation is not available. Use the server /reports endpoint. */
const generateAWBPDF = async (_shipment: Shipment): Promise<void> => {
  console.warn('[generateAWBPDF] Client-side PDF generation is not available. Use the server /reports endpoint.');
  alert('PDF generation is not available in this environment. Please use the server export feature.');
};

export default generateAWBPDF;

export async function generateAwbPdf(_options: GenerateAwbPdfOptions): Promise<Blob> {
  console.warn('[generateAwbPdf] Client-side PDF generation is not available. Use the server /reports endpoint.');
  return new Blob(['PDF generation not available in this environment.'], { type: 'application/pdf' });
}
