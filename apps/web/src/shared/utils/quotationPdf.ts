// @/utils/pdf/quotationPdf.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { QuotationWithClient } from '@/types/account';

export const generateQuotationPDF = (quotation: QuotationWithClient) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(24);
  doc.text('DeliverEase Logistics', 14, 20);
  doc.setFontSize(12);
  doc.text('Bole Road, Addis Ababa, Ethiopia', 14, 28);
  doc.text('www.deliverease.et • +251 911 234567', 14, 34);

  // Title
  doc.setFontSize(18);
  doc.text('QUOTATION', pageWidth - 14, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`#${quotation.quotationNumber}`, pageWidth - 14, 26, { align: 'right' });

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 40, pageWidth - 14, 40);

  // Client Info
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 50);
  doc.setFontSize(10);
  doc.text(quotation.client.name, 14, 56);
  doc.text(quotation.client.address, 14, 62);
  doc.text(`${quotation.client.contactName} • ${quotation.client.contactEmail}`, 14, 68);

  // Quotation Details
  doc.setFontSize(12);
  doc.text('Quotation Details:', pageWidth - 90, 50);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, pageWidth - 90, 56);
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, pageWidth - 90, 62);
  doc.text(`Prepared By: ${quotation.preparedBy}`, pageWidth - 90, 68);

  // Line Items Table
  const tableData = quotation.lineItems.map(item => [
    item.serviceType.replace('_', ' '),
    item.description,
    item.quantity.toString(),
    `ETB ${item.unitPrice.toLocaleString()}`,
    `ETB ${item.total.toLocaleString()}`,
  ]);

  (doc as any).autoTable({
    startY: 78,
    head: [['Service', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'head') {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ETB ${quotation.subtotal.toLocaleString()}`, pageWidth - 70, finalY);
  doc.text(`VAT (15%): ETB ${quotation.tax.toLocaleString()}`, pageWidth - 70, finalY + 6);
  doc.setFontSize(14);
  doc.text(`TOTAL: ETB ${quotation.total.toLocaleString()}`, pageWidth - 70, finalY + 16);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Confidential – DeliverEase Quotation', 14, doc.internal.pageSize.height - 10);
  }

  return doc;
};