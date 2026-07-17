import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  subtotal: number;            // ← Shipment charge
  vatPercentage: number;
  vatAmount: number;           // ← 15% of subtotal
  total: number;               // ← subtotal + vatAmount
  termsAndConditions: string[];
}

const loadLogoDataUrl = async (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
  });
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  const copyWidth = pageWidth / 2 - 10;

  try {
    // Logo
    const logoUrl = await loadLogoDataUrl('/logo.png');
    if (logoUrl) {
      doc.addImage(logoUrl, 'PNG', margin, margin, 50, 15);
    }

    // Header
    let currentY = margin;

    // Company info (right-aligned)
    doc.setFontSize(7);
    doc.setTextColor(100);
    const companyInfoX = margin + copyWidth - 5;
    doc.text(data.companyInfo.name, companyInfoX, currentY + 5, { align: 'right' });
    doc.text(data.companyInfo.address, companyInfoX, currentY + 10, { align: 'right' });
    doc.text(`Tel: ${data.companyInfo.phone}`, companyInfoX, currentY + 15, { align: 'right' });
    doc.text(`Email: ${data.companyInfo.email}`, companyInfoX, currentY + 20, { align: 'right' });
    if (data.companyInfo.website) {
      doc.text(`Web: ${data.companyInfo.website}`, companyInfoX, currentY + 25, { align: 'right' });
    }
    if (data.companyInfo.vatNumber) {
      doc.text(`VAT: ${data.companyInfo.vatNumber}`, companyInfoX, currentY + 30, { align: 'right' });
    }

    // Invoice title
    currentY = 35;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('INVOICE', margin, currentY);

    doc.setFontSize(8);
    doc.text(`Invoice No: ${data.invoiceNumber}`, margin, currentY + 7);
    doc.text(`Date: ${format(data.date, 'dd/MM/yyyy')}`, margin, currentY + 12);
    doc.text(`Due Date: ${format(data.dueDate, 'dd/MM/yyyy')}`, margin, currentY + 17);

    // Addresses
    currentY += 28;
    const columnWidth = (copyWidth - 10) / 2;

    // Bill To
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', margin, currentY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const billToLines = [
      data.customerInfo.name,
      data.customerInfo.address,
      `${data.customerInfo.city}, ${data.customerInfo.postalCode}`,
      data.customerInfo.country,
      `Email: ${data.customerInfo.email}`,
      ...(data.customerInfo.phone ? [`Tel: ${data.customerInfo.phone}`] : []),
      ...(data.customerInfo.contactPerson ? [`Attn: ${data.customerInfo.contactPerson}`] : []),
      ...(data.customerInfo.accountNumber ? [`Acc: ${data.customerInfo.accountNumber}`] : [])
    ];
    doc.text(billToLines, margin, currentY + 5);

    // Ship To
    if (data.shipToInfo) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SHIP TO:', margin + columnWidth + 5, currentY);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const shipToLines = [
        data.shipToInfo.name,
        ...(data.shipToInfo.contactPerson ? [`Attn: ${data.shipToInfo.contactPerson}`] : []),
        data.shipToInfo.address,
        `${data.shipToInfo.city}, ${data.shipToInfo.postalCode}`,
        data.shipToInfo.country,
        ...(data.shipToInfo.email ? [`Email: ${data.shipToInfo.email}`] : []),
        ...(data.shipToInfo.phone ? [`Tel: ${data.shipToInfo.phone}`] : [])
      ];
      doc.text(shipToLines, margin + columnWidth + 5, currentY + 5);
    }

    // AWB References + Summary inside same table (without lines for summary)
currentY += 32;
if (data.awbReferences && data.awbReferences.length > 0) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIPPING REFERENCES:', margin, currentY - 2);
  doc.setFont('helvetica', 'normal');

  // Prepare AWB rows
  const awbRows = data.awbReferences.map(ref => [
    ref.awbNumber,
    format(new Date(ref.issueDate), 'dd/MM/yy'),
    ref.originCity,
    ref.destinationCity,
    ref.description.length > 20 ? ref.description.substring(0, 20) + '...' : ref.description,
    ref.valueETB.toFixed(2),
  ]);

  // Summary rows (6 columns each)
  const summaryRows = [
    ['', '', '', '', 'Subtotal:', data.subtotal.toFixed(2)],
    ['', '', '', '', `VAT (${data.vatPercentage}%):`, data.vatAmount.toFixed(2)],
    ['', '', '', '', 'Total:', data.total.toFixed(2)]
  ];

  const fullBody = [...awbRows, ...summaryRows];
  const summaryStartIndex = awbRows.length; // first summary row index

  autoTable(doc, {
    head: [['AWB No.', 'Date', 'From', 'To', 'Description', 'Value ETB']],
    body: fullBody,
    startY: currentY,
    theme: 'grid', // keeps grid for header and AWB rows
    styles: { 
      fontSize: 6, 
      cellPadding: 1.2, 
      lineWidth: 0.3, 
      minCellHeight: 4 
    },
    headStyles: { 
      fillColor: [51, 122, 183], 
      textColor: 255, 
      fontSize: 6, 
      cellPadding: 1.5 
    },
    bodyStyles: { 
      fontSize: 6, 
      lineWidth: 0.5, 
      cellPadding: 1.2 
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'left' },
      5: { cellWidth: 10, halign: 'right' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        const rowIndex = hookData.row.index;

        // Style the "Total" row
        if (rowIndex === fullBody.length - 1) {
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fontSize = 7;
        }

        // Remove borders for summary rows
        if (rowIndex >= summaryStartIndex) {
          // Remove all borders
          hookData.cell.styles.lineWidth = 0;
          // Optional: reduce padding slightly for tighter look
          // hookData.cell.styles.cellPadding = 0.8;
        }
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: copyWidth
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY + 30;
}

    // Commodity Items Table
    currentY += 6; // small padding before items table
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMODITY DETAILS:', margin, currentY);
    doc.setFont('helvetica', 'normal');

    autoTable(doc, {
      head: [['Item #', 'Description', 'Qty', 'Unit', 'Unit Price', 'Amount']],
      body: data.items.map(item => [
        item.itemNo.toString(),
        item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description,
        item.quantity.toString(),
        item.unit,
        item.unitPrice.toFixed(2),
        item.amount.toFixed(2)
        // Removed 'currency' — not in header
      ]),
      startY: currentY + 4,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1.2, lineWidth: 0.3, minCellHeight: 4 },
      headStyles: { fillColor: [51, 122, 183], textColor: 255, fontSize: 6, cellPadding: 1.5 },
      bodyStyles: { fontSize: 6, lineWidth: 0.3, cellPadding: 1.2 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 20, halign: 'left' },
        2: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 15, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      tableWidth: copyWidth
    });

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 30;

    // Payment Info
    let paymentY = finalY + 10;
    if (data.paymentInfo) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT INFORMATION:', margin, paymentY);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      const paymentLines = [
        `Method: ${data.paymentInfo.method}`,
        `Bank: ${data.paymentInfo.bankName}`,
        `Account: ${data.paymentInfo.accountNumber}`,
        `Name: ${data.paymentInfo.accountName}`,
        `Swift: ${data.paymentInfo.swiftCode}`
      ];
      doc.text(paymentLines, margin, paymentY + 4);
      paymentY += 18;
    } else {
      paymentY += 5;
    }

    // Terms
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', margin, paymentY);
    doc.setFontSize(6);
    doc.setTextColor(100);
    const maxTermsWidth = copyWidth - 5;
    const termsLines: string[] = [];
    data.termsAndConditions.forEach(term => {
      const words = term.split(' ');
      let currentLine = '';
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const testWidth = doc.getTextWidth(testLine);
        if (testWidth > maxTermsWidth) {
          if (currentLine) termsLines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) termsLines.push(currentLine);
    });
    doc.text(termsLines, margin, paymentY + 4);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(0);
    doc.text('Thank you for your trust!', margin + (copyWidth / 2), pageHeight - 6, { align: 'center' });

    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};