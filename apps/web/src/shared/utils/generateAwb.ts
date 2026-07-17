
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AWBData, CopyType } from '@/types/awb';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { Shipment } from "@/types/shipment";

// Add the autoTable interface to jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Black and white color scheme
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F2F2F2';
const MID_GRAY = '#CCCCCC';

// Utility to add delay between API requests to avoid rate limiting
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const generateQRCodeDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 100,
      color: {
        dark: BLACK,
        light: WHITE
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    // Create a fallback QR code placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, 100, 100);
      ctx.strokeStyle = BLACK;
      ctx.strokeRect(0, 0, 100, 100);
      ctx.font = '10px Arial';
      ctx.fillStyle = BLACK;
      ctx.fillText('QR Error', 25, 50);
    }
    return canvas.toDataURL('image/png');
  }
};

const generateBarcodeDataUrl = (text: string): string => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 10,
      margin: 2,
      height: 30,
      width: 1,
      lineColor: BLACK,
      background: WHITE
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error generating barcode:", error);
    // Create a fallback barcode placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, 200, 40);
      ctx.strokeStyle = BLACK;
      ctx.strokeRect(0, 0, 200, 40);
      ctx.font = '10px Arial';
      ctx.fillStyle = BLACK;
      ctx.fillText(text, 10, 25);
    }
    return canvas.toDataURL('image/png');
  }
};

// Logo generation with black color
const generateLogoPlaceholder = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 40;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, 150, 40);
    
    ctx.fillStyle = BLACK;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('AHUNUNU', 15, 28);
    ctx.font = '12px Arial';
    ctx.fillText('EXPRESS', 95, 28);
  }
  return canvas.toDataURL('image/png');
};

const formatAddress = (addressObj: AWBData['sender'] | AWBData['recipient']): string => {
  const parts = [
    `Name: ${addressObj.name}`,
    addressObj.company ? `Company: ${addressObj.company}` : null,
    `Address: ${addressObj.addressLine1}`,
    addressObj.addressLine2 ? `Address 2: ${addressObj.addressLine2}` : null,
    `City: ${addressObj.city}, ${addressObj.postalCode}`,
    `Country: ${addressObj.country}`,
    `Tel: ${addressObj.telephone}`
  ];

  return parts.filter(Boolean).join('\n');
};

const generateLogo = async (): Promise<string> => {
  try {
    // Create an image element to load the logo
    const img = new Image();
    img.src = '/logo.png';

    // Convert the loaded image to a data URL
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 150;
          canvas.height = 40;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = WHITE;
            ctx.fillRect(0, 0, 150, 40);
            ctx.drawImage(img, 0, 0, 150, 40);
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          console.error('Error processing logo:', error);
          resolve(generateLogoPlaceholder());
        }
      };

      img.onerror = () => {
        console.error('Error loading logo, falling back to placeholder');
        resolve(generateLogoPlaceholder());
      };
    });
  } catch (error) {
    console.error("Error generating logo:", error);
    return generateLogoPlaceholder();
  }
};

const generateAWBCopy = async (
  doc: jsPDF,
  data: AWBData,
  copyType: CopyType,
  startX: number,
  startY: number,
  width: number,
  logoUrlOverride?: string
): Promise<void> => {
  try {
    await delay(100);
    
    const qrCodeUrl = await generateQRCodeDataUrl(JSON.stringify({
      awbNumber: data.awbNumber,
      sender: data.sender.name,
      recipient: data.recipient.name,
      service: data.serviceType,
      date: data.date
    }));
    
    await delay(50);
    const barcodeUrl = generateBarcodeDataUrl(data.awbNumber);
    await delay(50);
    const logoUrl = logoUrlOverride ?? await generateLogo();

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(startX, startY, width, 180, 'F');
    
    // Black border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(startX, startY, width, 190);

    // Add logo
    doc.addImage(logoUrl, 'PNG', startX + 2, startY + 2, 45, 15);
    
    // Copy Type under logo
    
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.text(copyType.toUpperCase(), startX + 4, startY + 23);

    // AWB Title and Number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('AIR WAYBILL', startX + 50, startY + 6);
    doc.setFontSize(12);
    doc.text(data.awbNumber, startX + 50, startY + 12);

    // QR Code at top right
    doc.addImage(qrCodeUrl, 'PNG', startX + width - 35, startY + 2, 30, 30);

    // Shipment Information Section - light gray background
    doc.setFillColor(242, 242, 242); // Light gray
    doc.rect(startX + 2, startY + 33, width - 4, 25, 'F');
    doc.setDrawColor(0, 0, 0); // Black border
    doc.rect(startX + 2, startY + 33, width - 4, 25);
    
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Shipment details
    const detailsY = startY + 39;
    doc.setFont('helvetica', 'bold');
    doc.text("Date:", startX + 4, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date, startX + 20, detailsY);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Service:", startX + 4, detailsY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(data.serviceType, startX + 30, detailsY + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Weight:", startX + width/2, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.weight || "N/A", startX + width/2 + 25, detailsY);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Pieces:", startX + width/2, detailsY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(data.pieces || "N/A", startX + width/2 + 25, detailsY + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Value:", startX + 4, detailsY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(data.price, startX + 25, detailsY + 12);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Time:", startX + width/2, detailsY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(data.time, startX + width/2 + 20, detailsY + 12);
    
    // From/To Addresses section
const addressY = startY + 59;

// Helper function to draw bold labels
const drawAddressWithBoldLabels = (doc: jsPDF, addressObj: any, x: number, y: number, maxWidth: number) => {
  let currentY = y;
  const lineHeight = 5;
  
  const drawField = (label: string, value: string) => {
    // Draw label (bold)
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, currentY);
    
    // Draw value (normal)
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getTextWidth(label);
    doc.text(value, x + labelWidth, currentY);
    
    currentY += lineHeight;
  };

  // Draw each field with bold labels
  drawField('Name: ', addressObj.name);
  if (addressObj.company) {
    drawField('Company: ', addressObj.company);
  }
  drawField('Address: ', addressObj.addressLine1);
  if (addressObj.addressLine2) {
    drawField('Address 2: ', addressObj.addressLine2);
  }
  drawField('City: ', `${addressObj.city}, ${addressObj.postalCode}`);
  drawField('Country: ', addressObj.country);
  drawField('Tel: ', addressObj.telephone);
  
  return currentY;
};

// Sender box
doc.setFillColor(255, 255, 255); // White
doc.rect(startX + 2, addressY, (width - 6)/2, 50, 'F');
doc.setDrawColor(0, 0, 0); // Black border
doc.rect(startX + 2, addressY, (width - 6)/2, 40);

doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0); // Black
doc.text('FROM:', startX + 4, addressY + 6);

// Draw sender address with bold labels
drawAddressWithBoldLabels(doc, data.sender, startX + 4, addressY + 12, (width - 10)/2 - 2);

// Recipient box
doc.setFillColor(255, 255, 255); // White
doc.rect(startX + width/2, addressY, (width - 6)/2, 50, 'F');
doc.setDrawColor(0, 0, 0); // Black border
doc.rect(startX + width/2, addressY, (width - 4)/2, 40);

doc.setFont('helvetica', 'bold');
doc.text('TO:', startX + width/2 + 2, addressY + 6);

// Draw recipient address with bold labels
drawAddressWithBoldLabels(doc, data.recipient, startX + width/2 + 2, addressY + 12, (width - 10)/2 - 2);

    // Commodity Information Table - Fixed Header Visibility
const commodityY = addressY + 41;
doc.setFillColor(255, 255, 255); // White
doc.rect(startX + 2, commodityY, width - 4, 65, 'F');
doc.setDrawColor(0, 0, 0); // Black border
doc.rect(startX + 2, commodityY, width - 4, 65);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('Commodity Information', startX + 4, commodityY + 6);

try {
  // Headers for the table
  const headers = ['Item No.', 'Description of Goods', 'HS code', 'Quantity', 'Weight (kg)', 'Unit Price', 'Total Value'];
  const cellWidths = [15, 40, 25, 20, 20, 20, 25];
  const totalWidth = cellWidths.reduce((a, b) => a + b, 0);
  const scaleFactor = (width - 8) / totalWidth;
  const scaledWidths = cellWidths.map(w => w * scaleFactor);
  const rowHeight = 8;
  const tableStartX = startX + 4;
  let currentY = commodityY + 15;

  // FIXED HEADER APPROACH: Draw background first, then borders, then text
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  
  // Step 1: Draw the entire header background
  let currentX = tableStartX;
  doc.rect(tableStartX, currentY, scaledWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
  
  // Step 2: Draw header borders
  currentX = tableStartX;
  headers.forEach((header, i) => {
    doc.rect(currentX, currentY, scaledWidths[i], rowHeight);
    currentX += scaledWidths[i];
  });
  
  // Step 3: Draw header text ON TOP of everything
  currentX = tableStartX;
  headers.forEach((header, i) => {
    const headerText = doc.splitTextToSize(header, scaledWidths[i] - 4);
    doc.text(headerText, currentX + 2, currentY + rowHeight/2 + 1);
    currentX += scaledWidths[i];
  });

  // Draw data rows
  currentY += rowHeight;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  data.commodities.forEach((commodity, index) => {
    currentX = tableStartX;
    const rowData = [
      (index + 1).toString(),
      commodity.description,
      commodity.hsCode,
      commodity.quantity.toString(),
      commodity.weightKg,
      commodity.unitPrice,
      commodity.totalValue
    ];

    // Optional: Alternate row background for data rows
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(250, 250, 250);
    }
    doc.rect(currentX, currentY, scaledWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

    rowData.forEach((cell, i) => {
      doc.setDrawColor(0, 0, 0);
      doc.rect(currentX, currentY, scaledWidths[i], rowHeight);
      doc.text(cell || '', currentX + 2, currentY + rowHeight/2 + 2);
      currentX += scaledWidths[i];
    });
    currentY += rowHeight;
  });

  // Total row
  doc.setFillColor(220, 220, 220); // Gray background for total
  doc.rect(tableStartX, currentY, scaledWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
  
  currentX = tableStartX;
  const totalRow = [
    'Total',
    '',
    '',
    data.commodities.reduce((sum, item) => sum + Number(item.quantity), 0).toString(),
    data.commodities.reduce((sum, item) => sum + Number(item.weightKg), 0).toString(),
    '',
    data.commodities.reduce((sum, item) => sum + Number(item.totalValue.split(' ')[0]), 0).toFixed(2) + ' ' + data.commodities[0].totalValue.split(' ')[1]
  ];

  totalRow.forEach((cell, i) => {
    doc.setDrawColor(0, 0, 0);
    doc.rect(currentX, currentY, scaledWidths[i], rowHeight);
    doc.text(cell || '', currentX + 2, currentY + rowHeight/2 + 2);
    currentX += scaledWidths[i];
  });

} catch (error) {
  console.error("Error creating table:", error);
  doc.text("Error displaying commodity information", startX + 4, commodityY + 15);
}

    // Add barcode at the bottom
    doc.addImage(barcodeUrl, 'PNG', startX + 2, startY + 170, width - 85, 15);

    // Add certification info at the bottom
    const certY = startY + 188;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("CERTIFICATION:", startX + 4, certY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.certificationInfo, startX + 30, certY);

  } catch (error) {
    console.error(`Error generating ${copyType} copy:`, error);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Error generating ${copyType} copy`, startX + 10, startY + 50);
  }
};

// Convert Shipment data to AWB data format - improved to better use actual data
const validateShipmentForAWB = (shipment: Shipment): string | null => {
  if (!shipment.awbNumber) {
    return 'Missing AWB number';
  }
  if (!shipment.sender || !shipment.recipient) {
    return 'Missing sender or recipient information';
  }
  if (!shipment.commodities || shipment.commodities.length === 0) {
    return 'No commodities specified';
  }
  return null;
};

const shipmentToAWBData = (shipment: Shipment): AWBData => {
  const validationError = validateShipmentForAWB(shipment);
  if (validationError) {
    throw new Error(`Invalid shipment data for AWB: ${validationError}`);
  }
  const now = new Date();
  
  // Map all commodities
  const commodities = shipment.commodities.map(commodity => ({
    description: commodity.description || 'General Merchandise',
    hsCode: commodity.hsCode || 'N/A',
    quantity: commodity.quantity.toString(),
    weightKg: commodity.weight.toString(),
    unitPrice: commodity.quantity > 0 
      ? (commodity.value / commodity.quantity).toFixed(2) + ' ' + commodity.currency
      : '0.00 ' + commodity.currency,
    totalValue: commodity.value + ' ' + commodity.currency
  }));

  try {
    return {
    awbNumber: shipment.awbNumber,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    serviceType: shipment.serviceType.replace(/-/g, ' ').toUpperCase(),
    weight: `${shipment.totalWeight} kg`,
    pieces: shipment.packageDetails?.quantity.toString() || '1',
    price: `${shipment.chargesInformation?.amount ?? 0} ${shipment.chargesInformation?.currency ?? 'USD'}`,
    certificationInfo: 'Certified in accordance with int. shipping guidance.',
    sender: {
      name: shipment.sender.name || '',
      company: shipment.sender.company || '',
      addressLine1: shipment.sender.address1 || '',
      addressLine2: shipment.sender.address2 || '',
      city: shipment.sender.city || '',
      postalCode: shipment.sender.postalCode || '',
      country: shipment.sender.country || '',
      telephone: shipment.sender.phone || 'N/A'
    },
    recipient: {
      name: shipment.recipient.name || '',
      company: shipment.recipient.company || '',
      addressLine1: shipment.recipient.address1 || '',
      addressLine2: shipment.recipient.address2 || '',
      city: shipment.recipient.city || '',
      postalCode: shipment.recipient.postalCode || '',
      country: shipment.recipient.country || '',
      telephone: shipment.recipient.phone || 'N/A'
    },
    commodities
  };
  } catch (error) {
    console.error('Error converting shipment to AWB data:', error);
    throw new Error('Failed to process shipment data for AWB generation');
  }
};

// Main function to generate and download the AWB PDF
const generateAWBPDF = async (shipment: Shipment): Promise<void> => {
  try {
    // Convert shipment data to AWB format
    const awbData = shipmentToAWBData(shipment);
    
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const copyWidth = pageWidth / 2 - 10;
    
    // Generate the Client copy
    const logoUrl = await generateLogo();
    await generateAWBCopy(doc, awbData, 'Client', 5, 5, copyWidth, logoUrl);
    await delay(200); // Add delay between copies
    
    // Generate the Customs copy on the same page
    await generateAWBCopy(doc, awbData, 'Customs', copyWidth + 15, 5, copyWidth, logoUrl);
    
    // Add page footer
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // Black
    const footerMargin = 5; // Margin from bottom of page
    doc.text('Page 1/2 - Client & Customs Copies', 5, doc.internal.pageSize.height - footerMargin);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, doc.internal.pageSize.height - footerMargin);

    // Add a second page for the Company copy
    doc.addPage();

    await delay(200); // Add delay before generating next page
    await generateAWBCopy(doc, awbData, 'Company', 5, 5, copyWidth, logoUrl);

    // Add second page footer
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Page 2/2 - Company Copy', 5, doc.internal.pageSize.height - 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, doc.internal.pageSize.height - 10);
    
    // Save the PDF with a dynamic filename
    const filename = `AHUNUNU_AWB_${awbData.awbNumber}_${awbData.date.replace(/\//g, '-')}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export default generateAWBPDF;

interface GenerateAwbPdfOptions {
  shipment: Shipment;
  awbNumber: string;
  logo: string;
}

const resolveLogoFromPath = async (src?: string): Promise<string | undefined> => {
  if (!src) return undefined;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
  });
};

export async function generateAwbPdf(options: GenerateAwbPdfOptions): Promise<Blob> {
  try {
    // Convert shipment data to AWB format
    const awbData = shipmentToAWBData(options.shipment);
    
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const copyWidth = pageWidth / 2 - 10;
    
    // Generate the Client copy
    const logoUrlOverride = (await resolveLogoFromPath(options.logo)) ?? await generateLogo();
    await generateAWBCopy(doc, awbData, 'Client', 5, 5, copyWidth, logoUrlOverride);
    await delay(200); // Add delay between copies
    
    // Generate the Customs copy on the same page
    await generateAWBCopy(doc, awbData, 'Customs', copyWidth + 15, 5, copyWidth, logoUrlOverride);
    
    // Add page footer
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Page 1/2 - Client & Customs Copies', 5, 190);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, 190);

    // Add a second page for the Company copy
    doc.addPage();
    
    await delay(200); // Add delay before generating next page
    await generateAWBCopy(doc, awbData, 'Company', 5, 5, copyWidth, logoUrlOverride);
    
    // Add second page footer
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Page 2/2 - Company Copy', 5, 190);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, 190);
    
    // Return the PDF as a blob
    return doc.output('blob');

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
