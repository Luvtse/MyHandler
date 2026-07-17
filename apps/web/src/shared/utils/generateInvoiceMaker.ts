import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export interface InvoiceItem {
  itemNo: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  currency: string
}

export interface PaymentInfo {
  method: string
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode: string
}

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  vatNumber?: string
}

export interface AWBReference {
  awbNumber: string
  description: string
  amount: number
  issueDate: string
  originCity: string
  destinationCity: string
  goodsDescription: string
  valueETB: number
  currency?: string
}

export interface CustomerInfo {
  name: string
  contactPerson?: string
  address: string
  city: string
  postalCode: string
  country: string
  accountNumber?: string
  email: string
  phone?: string
}

export interface InvoiceData {
  invoiceNumber: string
  date: Date
  dueDate: Date
  companyInfo: CompanyInfo
  customerInfo: CustomerInfo
  shipToInfo?: CustomerInfo
  paymentInfo?: PaymentInfo
  items: InvoiceItem[]
  awbReferences: AWBReference[]
  subtotal: number
  vatPercentage: number
  vatAmount: number
  total: number
  termsAndConditions: string[]
  brandingLogoUrl?: string
  showWatermark?: boolean
  watermarkText?: string
  conversionSource?: string
}

const loadLogoDataUrl = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }
      
      const targetWidth = 70
      const targetHeight = 30
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      
      resolve(canvas.toDataURL('image/png', 0.9))
    }
    
    img.onerror = () => {
      console.warn('Logo image could not be loaded, proceeding without logo')
      resolve('')
    }
  })
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const addWatermark = (doc: jsPDF, pageWidth: number, pageHeight: number, text: string): void => {
  doc.setFontSize(60)
  doc.setTextColor(240, 240, 240)
  doc.setFont('helvetica', 'bold')
  doc.text(text, pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  })
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
}

const addPageHeader = (
  doc: jsPDF,
  data: InvoiceData,
  logoUrl: string,
  startY: number,
  pageWidth: number
): number => {
  const margin = 10
  let currentY = startY
  
  if (logoUrl) {
    doc.addImage(logoUrl, 'PNG', margin, currentY, 70, 30)
  }
  
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('TAX INVOICE', pageWidth - margin, currentY + 8, { align: 'right' })
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  const invoiceDetailsX = pageWidth - margin
  
  doc.text(`INVOICE NO: ${data.invoiceNumber}`, invoiceDetailsX, currentY + 18, { align: 'right' })
  doc.text(`DATE: ${format(data.date, 'dd/MM/yyyy')}`, invoiceDetailsX, currentY + 23, { align: 'right' })
  doc.text(`DUE DATE: ${format(data.dueDate, 'dd/MM/yyyy')}`, invoiceDetailsX, currentY + 28, { align: 'right' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(80, 80, 80)
  
  const companyLines = [
    data.companyInfo.name,
    data.companyInfo.address,
    `Tel: ${data.companyInfo.phone} | Email: ${data.companyInfo.email}`,
    ...(data.companyInfo.website ? [`Web: ${data.companyInfo.website}`] : []),
    ...(data.companyInfo.vatNumber ? [`VAT: ${data.companyInfo.vatNumber}`] : [])
  ]
  
  companyLines.forEach((line, index) => {
    doc.text(line, invoiceDetailsX, currentY + 38 + (index * 3.5), { align: 'right' })
  })
  
  return currentY + (logoUrl ? 40 : 30) + (companyLines.length * 3.5)
}

const addAddressSections = (
  doc: jsPDF,
  data: InvoiceData,
  startY: number,
  pageWidth: number
): number => {
  const margin = 10
  const sectionWidth = (pageWidth - (3 * margin)) / 2
  let currentY = startY + 5
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  doc.text('BILL TO:', margin, currentY)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  
  const billToLines = [
    data.customerInfo.name,
    ...(data.customerInfo.contactPerson ? [`Attn: ${data.customerInfo.contactPerson}`] : []),
    data.customerInfo.address,
    `${data.customerInfo.city}, ${data.customerInfo.postalCode}`,
    data.customerInfo.country,
    `Email: ${data.customerInfo.email}`,
    ...(data.customerInfo.phone ? [`Tel: ${data.customerInfo.phone}`] : []),
    ...(data.customerInfo.accountNumber ? [`Account: ${data.customerInfo.accountNumber}`] : [])
  ]
  
  billToLines.forEach((line, index) => {
    doc.text(line, margin, currentY + 5 + (index * 3.5))
  })
  
  if (data.shipToInfo) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(41, 128, 185)
    doc.text('SHIP TO:', margin + sectionWidth + 10, currentY)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    
    const shipToLines = [
      data.shipToInfo.name,
      ...(data.shipToInfo.contactPerson ? [`Attn: ${data.shipToInfo.contactPerson}`] : []),
      data.shipToInfo.address,
      `${data.shipToInfo.city}, ${data.shipToInfo.postalCode}`,
      data.shipToInfo.country,
      ...(data.shipToInfo.email ? [`Email: ${data.shipToInfo.email}`] : []),
      ...(data.shipToInfo.phone ? [`Tel: ${data.shipToInfo.phone}`] : [])
    ]
    
    shipToLines.forEach((line, index) => {
      doc.text(line, margin + sectionWidth + 10, currentY + 5 + (index * 3.5))
    })
  }
  
  const maxLines = Math.max(
    billToLines.length,
    data.shipToInfo
      ? [
          data.shipToInfo.name,
          ...(data.shipToInfo.contactPerson ? [`Attn: ${data.shipToInfo.contactPerson}`] : []),
          data.shipToInfo.address,
          `${data.shipToInfo.city}, ${data.shipToInfo.postalCode}`,
          data.shipToInfo.country,
          ...(data.shipToInfo.email ? [`Email: ${data.shipToInfo.email}`] : []),
          ...(data.shipToInfo.phone ? [`Tel: ${data.shipToInfo.phone}`] : [])
        ].length
      : 0
  )
  return currentY + (maxLines * 3.5) + 10
}

const addAWBReferences = (
  doc: jsPDF,
  data: InvoiceData,
  startY: number,
  pageWidth: number
): number => {
  if (!data.awbReferences || data.awbReferences.length === 0) {
    return startY
  }
  
  const margin = 10
  let currentY = startY + 3
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('SHIPPING REFERENCES:', margin, currentY)
  
  // Prepare AWB table data with shipment details column
  const awbRows = data.awbReferences.map(ref => [
    ref.awbNumber,
    format(new Date(ref.issueDate), 'dd/MM/yy'),
    ref.originCity,
    ref.destinationCity,
    ref.description.length > 25 ? ref.description.substring(0, 25) + '...' : ref.description,
    ref.goodsDescription.length > 25 ? ref.goodsDescription.substring(0, 25) + '...' : ref.goodsDescription,
    `ETB ${formatCurrency(ref.valueETB)}`
  ])
  
  // Create main AWB table with shipment details column
  autoTable(doc, {
    head: [['AWB No.', 'Date', 'From', 'To', 'Description', 'Shipment Details', 'Value']],
    body: awbRows,
    startY: currentY + 4,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineWidth: 0.2,
      minCellHeight: 5.5,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontSize: 7.5,
      cellPadding: 2.2,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      lineWidth: 0.2,
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 35, halign: 'left' },
      5: { cellWidth: 35, halign: 'left' },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - (2 * margin)
  })
  
  let finalY = (doc as any).lastAutoTable.finalY + 8
  
  // Add financial summary (removed shipment detail from here)
  const summaryData = [
    ['Subtotal:', `ETB ${formatCurrency(data.subtotal)}`],
    [`VAT (${data.vatPercentage}%):`, `ETB ${formatCurrency(data.vatAmount)}`],
    ['TOTAL AMOUNT:', `ETB ${formatCurrency(data.total)}`]
  ]
  
  autoTable(doc, {
    body: summaryData,
    startY: finalY,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineWidth: 0,
      minCellHeight: 6
    },
    columnStyles: {
      0: { 
        cellWidth: 40,
        fontStyle: 'bold',
        halign: 'right'
      },
      1: { 
        cellWidth: 60,
        halign: 'right',
        fontStyle: 'bold'
      }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        const rowIndex = hookData.row.index
        
        // Style the total row
        if (rowIndex === summaryData.length - 1) {
          hookData.cell.styles.fontSize = 9
          hookData.cell.styles.textColor = [231, 76, 60]
          hookData.cell.styles.fontStyle = 'bold'
        }
      }
    },
    margin: { left: pageWidth - 140, right: margin },
    tableWidth: 100
  })
  
  return (doc as any).lastAutoTable.finalY + 12
}

const addItemsTable = (
  doc: jsPDF,
  data: InvoiceData,
  startY: number,
  pageWidth: number
): number => {
  if (!data.items || data.items.length === 0) {
    return startY
  }
  
  const margin = 10
  let currentY = startY + 3
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('INVOICE ITEMS:', margin, currentY)
  
  const itemsRows = data.items.map(item => [
    item.itemNo.toString(),
    item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description,
    item.quantity.toString(),
    item.unit,
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
    item.currency
  ])
  
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0)
  
  autoTable(doc, {
    head: [['#', 'Description', 'Qty', 'Unit', 'Unit Price', 'Amount', 'Currency']],
    body: itemsRows,
    startY: currentY + 4,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineWidth: 0.2,
      minCellHeight: 5.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 7.5,
      cellPadding: 2.2,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      lineWidth: 0.2,
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 60, halign: 'left' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 18, halign: 'center' }
    },
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - (2 * margin),
    foot: [
      [
        '',
        `Total Items: ${data.items.length}`,
        `Total Qty: ${totalQuantity}`,
        '',
        '',
        `ETB ${formatCurrency(totalAmount)}`,
        ''
      ]
    ],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2
    },
    didDrawPage: (tableData) => {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${tableData.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 8,
        { align: 'center' }
      )
    }
  })
  
  return (doc as any).lastAutoTable.finalY + 10
}

const addPaymentInfo = (
  doc: jsPDF,
  data: InvoiceData,
  startY: number,
  pageWidth: number
): number => {
  if (!data.paymentInfo) {
    return startY
  }
  
  const margin = 10
  const columnWidth = (pageWidth - (3 * margin)) / 2
  let currentY = startY + 3
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('PAYMENT INFORMATION:', margin, currentY)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  
  const paymentLines = [
    `Method: ${data.paymentInfo.method}`,
    `Bank: ${data.paymentInfo.bankName}`,
    `Account Name: ${data.paymentInfo.accountName}`,
    `Account No: ${data.paymentInfo.accountNumber}`,
    `SWIFT/BIC: ${data.paymentInfo.swiftCode}`
  ]
  
  const midPoint = Math.ceil(paymentLines.length / 2)
  const leftColumn = paymentLines.slice(0, midPoint)
  const rightColumn = paymentLines.slice(midPoint)
  
  leftColumn.forEach((line, index) => {
    doc.text(line, margin, currentY + 5 + (index * 3.5))
  })
  
  rightColumn.forEach((line, index) => {
    doc.text(line, margin + columnWidth + 10, currentY + 5 + (index * 3.5))
  })
  
  const maxLines = Math.max(leftColumn.length, rightColumn.length)
  return currentY + (maxLines * 3.5) + 10
}

const addTermsAndConditions = (
  doc: jsPDF,
  data: InvoiceData,
  startY: number,
  pageWidth: number
): number => {
  if (!data.termsAndConditions || data.termsAndConditions.length === 0) {
    return startY
  }
  
  const margin = 10
  let currentY = startY + 3
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('TERMS & CONDITIONS:', margin, currentY)
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(70, 70, 70)
  
  const termsLines: string[] = []
  const maxWidth = pageWidth - (2 * margin)
  const lineHeight = 3.2
  
  data.termsAndConditions.forEach(term => {
    const lines = doc.splitTextToSize(`• ${term}`, maxWidth)
    termsLines.push(...lines)
  })
  
  const remainingSpace = doc.internal.pageSize.height - currentY - 15
  const neededSpace = termsLines.length * lineHeight
  
  if (neededSpace > remainingSpace) {
    doc.addPage()
    if (data.showWatermark !== false) {
      addWatermark(doc, pageWidth, doc.internal.pageSize.height, data.watermarkText || 'ORIGINAL')
    }
    currentY = margin + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS & CONDITIONS (continued):', margin, currentY)
    doc.setFontSize(7)
    currentY += 5
  } else {
    currentY += 5
  }
  
  termsLines.forEach((line, index) => {
    if (currentY + lineHeight > doc.internal.pageSize.height - margin) {
      doc.addPage()
      if (data.showWatermark !== false) {
        addWatermark(doc, pageWidth, doc.internal.pageSize.height, data.watermarkText || 'ORIGINAL')
      }
      currentY = margin + 10
    }
    
    doc.text(line, margin + 2, currentY + (index * lineHeight))
  })
  
  return currentY + (termsLines.length * lineHeight) + 10
}

const addFooter = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  data: InvoiceData
): void => {
  const margin = 10
  
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(231, 76, 60)
  
  const totalsX = pageWidth - margin - 100
  doc.text('FINAL TOTALS:', totalsX, pageHeight - 20)
  doc.text(`Subtotal: ETB ${formatCurrency(data.subtotal)}`, totalsX, pageHeight - 15)
  doc.text(`VAT (${data.vatPercentage}%): ETB ${formatCurrency(data.vatAmount)}`, totalsX, pageHeight - 10)
  doc.text(`GRAND TOTAL: ETB ${formatCurrency(data.total)}`, totalsX, pageHeight - 5)

  const perCurrencyTotals = data.items.reduce((acc: Record<string, number>, item) => {
    const cur = item.currency || 'ETB'
    acc[cur] = (acc[cur] || 0) + Number(item.amount || 0)
    return acc
  }, {} as Record<string, number>)

  const totalsListYStart = pageHeight - 45
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'normal')
  doc.text('Per-Currency Totals:', margin, totalsListYStart)
  let y = totalsListYStart + 4
  Object.entries(perCurrencyTotals).forEach(([cur, amt]) => {
    doc.text(`${cur}: ${formatCurrency(Number(amt))}`, margin, y)
    y += 3.5
  })
  if (data.conversionSource) {
    doc.setFont('helvetica', 'italic')
    doc.text(`Grand total conversion source: ${data.conversionSource}`, margin, y)
  }
  
  doc.setFontSize(8)
  doc.setTextColor(41, 128, 185)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your business!', margin, pageHeight - 15)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(`For inquiries, contact: ${data.companyInfo.phone} | ${data.companyInfo.email}`, 
    margin, pageHeight - 8)
}

export const generateInvoiceMakerPDF = async (data: InvoiceData): Promise<Blob> => {
  const doc = new jsPDF({ 
    orientation: 'portrait', 
    unit: 'mm', 
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  })
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  
  const logoSrc = data.brandingLogoUrl || '/logo.png'
  const logoUrl = await loadLogoDataUrl(logoSrc)
  
  if (data.showWatermark !== false) {
    addWatermark(doc, pageWidth, pageHeight, data.watermarkText || 'ORIGINAL')
  }
  
  let currentY = 10
  
  currentY = addPageHeader(doc, data, logoUrl, currentY, pageWidth)
  currentY = addAddressSections(doc, data, currentY, pageWidth)
  currentY = addAWBReferences(doc, data, currentY, pageWidth)
  currentY = addItemsTable(doc, data, currentY, pageWidth)
  currentY = addPaymentInfo(doc, data, currentY, pageWidth)
  currentY = addTermsAndConditions(doc, data, currentY, pageWidth)
  
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    if (data.showWatermark !== false) {
      addWatermark(doc, pageWidth, pageHeight, data.watermarkText || 'ORIGINAL')
    }
    
    if (i === totalPages) {
      addFooter(doc, pageWidth, pageHeight, data)
    }
    
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )
  }
  
  doc.setProperties({
    title: `Invoice ${data.invoiceNumber}`,
    subject: 'Tax Invoice',
    author: data.companyInfo.name,
    keywords: 'invoice, tax, billing, payment',
    creator: 'Invoice Generator'
  })
  
  return doc.output('blob')
}
