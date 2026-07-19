/**
 * AWB (Air Waybill) PDF generator — rebuilt with pdfmake (replaces jsPDF).
 * Generates a landscape A4 PDF with three copies:
 *   Page 1 — Client copy (left) + Customs copy (right)
 *   Page 2 — Company copy
 */
import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { Shipment } from '@/types/shipment';
import type { AWBData, CopyType } from '@/types/awb';

// Wire up the bundled font VFS so pdfmake can render without a server
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = (vfsFonts as any).vfs;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateBarcodeDataUrl(value: string): string {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value || 'UNKNOWN', {
      format: 'CODE128',
      displayValue: false,
      width: 2,
      height: 40,
      margin: 4,
      background: '#ffffff',
    });
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

async function generateQrDataUrl(value: string): Promise<string> {
  try {
    return await QRCode.toDataURL(value || 'UNKNOWN', { width: 80, margin: 1 });
  } catch {
    return '';
  }
}

function shipmentToAWBData(s: Shipment): AWBData {
  const date = new Date(s.createdAt || Date.now());
  const totalPieces = (s.packageDetails?.quantity ?? 1).toString();
  const totalWeight = `${s.totalWeight ?? 0} kg`;
  const price = s.chargesInformation
    ? `${s.chargesInformation.currency} ${s.chargesInformation.amount.toFixed(2)}`
    : '—';

  return {
    awbNumber: s.awbNumber || s.id,
    date: date.toLocaleDateString('en-GB'),
    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    serviceType: (s.serviceType ?? 'standard').replace(/-/g, ' ').toUpperCase(),
    weight: totalWeight,
    pieces: totalPieces,
    price,
    certificationInfo:
      'I hereby certify that the particulars on the face hereof are correct and that insofar as any part of this consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.',
    sender: {
      name: s.sender?.name ?? '',
      company: s.sender?.company ?? '',
      addressLine1: s.sender?.address1 ?? '',
      addressLine2: s.sender?.address2 ?? '',
      city: s.sender?.city ?? '',
      postalCode: s.sender?.postalCode ?? '',
      country: s.sender?.country ?? '',
      telephone: s.sender?.phone ?? '',
    },
    recipient: {
      name: s.recipient?.name ?? '',
      company: s.recipient?.company ?? '',
      addressLine1: s.recipient?.address1 ?? '',
      addressLine2: s.recipient?.address2 ?? '',
      city: s.recipient?.city ?? '',
      postalCode: s.recipient?.postalCode ?? '',
      country: s.recipient?.country ?? '',
      telephone: s.recipient?.phone ?? '',
    },
    commodities: (s.commodities ?? []).map((c) => ({
      description: c.description,
      hsCode: c.hsCode ?? '',
      quantity: String(c.quantity),
      weightKg: `${c.weight} kg`,
      unitPrice: `${c.currency ?? 'USD'} ${c.value.toFixed(2)}`,
      totalValue: `${c.currency ?? 'USD'} ${(c.quantity * c.value).toFixed(2)}`,
    })),
  };
}

// ─── pdfmake copy builder ─────────────────────────────────────────────────────

const BRAND_DARK = '#1A3C8F';
const BRAND_ACCENT = '#FFC107';
const GRAY = '#64748B';
const LIGHT_GRAY = '#F1F5F9';
const BORDER = '#CBD5E1';

function addressBlock(label: string, party: AWBData['sender']): object {
  return {
    stack: [
      { text: label, style: 'sectionLabel' },
      { text: [{ text: party.company || party.name, bold: true }], style: 'bodyText' },
      ...(party.company ? [{ text: party.name, style: 'bodyText' }] : []),
      { text: party.addressLine1, style: 'bodyText' },
      ...(party.addressLine2 ? [{ text: party.addressLine2, style: 'bodyText' }] : []),
      { text: `${party.city}${party.postalCode ? ', ' + party.postalCode : ''}`, style: 'bodyText' },
      { text: party.country, style: 'bodyText' },
      ...(party.telephone ? [{ text: `Tel: ${party.telephone}`, style: 'bodySmall', color: GRAY }] : []),
    ],
    margin: [0, 0, 0, 4],
  };
}

function buildCopy(
  awbData: AWBData,
  copyType: CopyType,
  barcodeDataUrl: string,
  qrDataUrl: string,
): object {
  const copyColor: Record<CopyType, string> = {
    Client: '#22C55E',
    Customs: '#F59E0B',
    Company: BRAND_DARK,
  };

  const commodityRows = awbData.commodities.length
    ? awbData.commodities.map((c) => [
        { text: c.description, style: 'tableCell' },
        { text: c.hsCode, style: 'tableCell' },
        { text: c.quantity, style: 'tableCell', alignment: 'center' },
        { text: c.weightKg, style: 'tableCell', alignment: 'right' },
        { text: c.unitPrice, style: 'tableCell', alignment: 'right' },
        { text: c.totalValue, style: 'tableCell', alignment: 'right', bold: true },
      ])
    : [[
        { text: 'General Cargo', style: 'tableCell', colSpan: 6 },
        {}, {}, {}, {}, {},
      ]];

  return {
    stack: [
      // ── Header ──────────────────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              { text: 'GoodsHandler', style: 'companyName' },
              { text: 'Express Logistics', style: 'companyTagline' },
            ],
          },
          {
            stack: [
              {
                text: `${copyType.toUpperCase()} COPY`,
                style: 'copyBadge',
                color: '#ffffff',
                background: copyColor[copyType],
              },
              { text: 'AIR WAYBILL', style: 'docTitle' },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 4],
      },
      // Divider
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515 / 2 - 10, y2: 0, lineWidth: 2, lineColor: BRAND_DARK }], margin: [0, 2, 0, 4] },

      // ── AWB Number + Barcode ─────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              { text: 'AWB NUMBER', style: 'fieldLabel' },
              { text: awbData.awbNumber, style: 'awbNumber' },
              { text: `Date: ${awbData.date}  Time: ${awbData.time}`, style: 'bodySmall', color: GRAY },
            ],
          },
          barcodeDataUrl
            ? { image: barcodeDataUrl, width: 120, height: 30, alignment: 'right', margin: [0, 2, 0, 0] }
            : { text: awbData.awbNumber, style: 'bodySmall', alignment: 'right' },
        ],
        margin: [0, 0, 0, 4],
      },

      // ── Sender / Recipient ───────────────────────────────────────────────────
      {
        columns: [
          { ...addressBlock('SHIPPER', awbData.sender), width: '*' },
          { width: 8, text: '' },
          { ...addressBlock('CONSIGNEE', awbData.recipient), width: '*' },
        ],
        margin: [0, 0, 0, 4],
      },

      // ── Service details strip ────────────────────────────────────────────────
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'SERVICE TYPE', style: 'fieldLabel' },
              { text: 'WEIGHT', style: 'fieldLabel' },
              { text: 'PIECES', style: 'fieldLabel' },
              { text: 'CHARGES', style: 'fieldLabel' },
            ],
            [
              { text: awbData.serviceType, style: 'detailValue' },
              { text: awbData.weight, style: 'detailValue' },
              { text: awbData.pieces, style: 'detailValue' },
              { text: awbData.price, style: 'detailValue' },
            ],
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? LIGHT_GRAY : null),
          hLineColor: () => BORDER,
          vLineColor: () => BORDER,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 4,
          paddingRight: () => 4,
        },
        margin: [0, 0, 0, 4],
      },

      // ── Commodities table ────────────────────────────────────────────────────
      { text: 'GOODS DESCRIPTION', style: 'sectionLabel', margin: [0, 0, 0, 2] },
      {
        table: {
          widths: ['*', 40, 28, 36, 50, 50],
          headerRows: 1,
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'HS Code', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader', alignment: 'center' },
              { text: 'Weight', style: 'tableHeader', alignment: 'right' },
              { text: 'Unit Value', style: 'tableHeader', alignment: 'right' },
              { text: 'Total Value', style: 'tableHeader', alignment: 'right' },
            ],
            ...commodityRows,
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? BRAND_DARK : rowIndex % 2 === 0 ? LIGHT_GRAY : null),
          hLineColor: () => BORDER,
          vLineColor: () => BORDER,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 3,
          paddingRight: () => 3,
        },
        margin: [0, 0, 0, 4],
      },

      // ── Certification + QR ───────────────────────────────────────────────────
      {
        columns: [
          {
            text: awbData.certificationInfo,
            style: 'certText',
            width: '*',
          },
          qrDataUrl
            ? { image: qrDataUrl, width: 48, height: 48, margin: [6, 0, 0, 0] }
            : { text: '', width: 48 },
        ],
        margin: [0, 0, 0, 4],
      },

      // ── Signature strip ──────────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.5, lineColor: BORDER }] },
              { text: 'Shipper Signature & Date', style: 'fieldLabel', margin: [0, 2, 0, 0] },
            ],
          },
          { width: 16, text: '' },
          {
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.5, lineColor: BORDER }] },
              { text: 'Carrier Signature & Date', style: 'fieldLabel', margin: [0, 2, 0, 0] },
            ],
          },
        ],
      },
    ],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GenerateAwbPdfOptions {
  shipment: Shipment;
  awbNumber: string;
  logo?: string;
}

export async function generateAwbPdf(options: GenerateAwbPdfOptions): Promise<Blob> {
  const { shipment } = options;
  const awbData = shipmentToAWBData(shipment);

  const [barcodeDataUrl, qrDataUrl] = await Promise.all([
    Promise.resolve(generateBarcodeDataUrl(awbData.awbNumber)),
    generateQrDataUrl(awbData.awbNumber),
  ]);

  const clientCopy = buildCopy(awbData, 'Client', barcodeDataUrl, qrDataUrl);
  const customsCopy = buildCopy(awbData, 'Customs', barcodeDataUrl, qrDataUrl);
  const companyCopy = buildCopy(awbData, 'Company', barcodeDataUrl, qrDataUrl);

  const docDefinition = {
    pageOrientation: 'landscape' as const,
    pageSize: 'A4' as const,
    pageMargins: [15, 15, 15, 15] as [number, number, number, number],
    content: [
      // Page 1: two copies side by side
      {
        columns: [
          { ...clientCopy, width: '*' },
          {
            canvas: [{ type: 'line' as const, x1: 0, y1: 0, x2: 0, y2: 540, lineWidth: 1, lineColor: '#CBD5E1', dash: { length: 4 } }],
            width: 16,
          },
          { ...customsCopy, width: '*' },
        ],
      },
      { text: '', pageBreak: 'after' as const },
      // Page 2: company copy centred
      { ...companyCopy, width: '*' },
    ],
    styles: {
      companyName: { fontSize: 11, bold: true, color: BRAND_DARK },
      companyTagline: { fontSize: 7, color: GRAY, margin: [0, 1, 0, 0] },
      copyBadge: { fontSize: 7, bold: true, margin: [0, 0, 0, 2] },
      docTitle: { fontSize: 9, bold: true, color: BRAND_DARK },
      awbNumber: { fontSize: 12, bold: true, color: BRAND_DARK },
      sectionLabel: { fontSize: 6.5, bold: true, color: GRAY, characterSpacing: 0.5, margin: [0, 0, 0, 2] },
      fieldLabel: { fontSize: 6, color: GRAY, bold: true, characterSpacing: 0.3 },
      detailValue: { fontSize: 8, bold: true, color: BRAND_DARK },
      bodyText: { fontSize: 7.5, color: '#1E293B', lineHeight: 1.3 },
      bodySmall: { fontSize: 6.5, lineHeight: 1.3 },
      tableHeader: { fontSize: 6.5, bold: true, color: '#FFFFFF', fillColor: BRAND_DARK },
      tableCell: { fontSize: 7, color: '#1E293B', lineHeight: 1.2 },
      certText: { fontSize: 6, color: GRAY, lineHeight: 1.4, italics: true },
    },
    defaultStyle: { font: 'Roboto' },
  };

  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfMake as any).createPdf(docDefinition).getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/** Default export: generate and auto-download an AWB PDF for a given Shipment. */
const generateAWBPDF = async (shipment: Shipment): Promise<void> => {
  const blob = await generateAwbPdf({
    shipment,
    awbNumber: shipment.awbNumber,
    logo: '/logo.png',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AWB-${shipment.awbNumber || shipment.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default generateAWBPDF;
