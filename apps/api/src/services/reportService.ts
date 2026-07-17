import { PrismaClient, ShipmentStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  serviceType?: string;
  format: 'excel' | 'csv' | 'pdf';
}

export interface ShipmentReportData {
  id: string;
  reference: string;
  serviceType: string;
  status: string;
  origin: string;
  destination: string;
  weight: number;
  value: number;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  deliveryDays?: number;
}

export interface FinancialReportData {
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
}

export interface PerformanceReportData {
  month: string;
  totalShipments: number;
  deliveredShipments: number;
  onTimeDeliveries: number;
  delayedShipments: number;
  averageDeliveryDays: number;
  revenue: number;
  onTimeRate: number;
  deliveryRate: number;
}

export interface CustomerReportData {
  customerId: string;
  customerName: string;
  totalShipments: number;
  totalRevenue: number;
  averageShipmentValue: number;
  lastShipmentDate: string;
  status: string;
}

export interface LeaveReportData {
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
}

class ReportService {
  /**
   * Generate shipment report with filters
   */
  async generateShipmentReport(filters: ReportFilters): Promise<Buffer> {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.createdAt = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.status) {
      const key = String(filters.status).trim().toUpperCase().replace(/-/g, '_');
      if ((ShipmentStatus as any)[key]) {
        where.status = (ShipmentStatus as any)[key];
      }
    }
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const reportData: ShipmentReportData[] = shipments.map(shipment => {
      const isDelivered =
        shipment.status === ShipmentStatus.DELIVERED_SUCCESSFULLY ||
        shipment.status === ShipmentStatus.DELIVERY_CONFIRMED ||
        shipment.status === ShipmentStatus.SIGNATURE_OBTAINED;
      const deliveredAt = isDelivered ? shipment.updatedAt : undefined;
      const createdAt = new Date(shipment.createdAt);
      const deliveryDate = deliveredAt ? new Date(deliveredAt) : null;
      const deliveryDays = deliveryDate ? Math.ceil((deliveryDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : undefined;

      return {
        id: shipment.id,
        reference: shipment.reference || 'N/A',
        serviceType: shipment.serviceLevel || 'Standard',
        status: shipment.status,
        origin: shipment.originAddress || 'N/A',
        destination: shipment.destinationAddress || 'N/A',
        weight: Number(shipment.weightKg) || 0,
        value: 0, // No value field in current schema
        customerName: shipment.user?.name || 'N/A',
        createdAt: format(createdAt, 'yyyy-MM-dd HH:mm'),
        updatedAt: format(new Date(shipment.updatedAt), 'yyyy-MM-dd HH:mm'),
        deliveredAt: deliveredAt ? format(deliveryDate!, 'yyyy-MM-dd HH:mm') : undefined,
        deliveryDays,
      };
    });

    if (filters.format === 'excel') {
      return await this.generateExcelReport('Shipment Report', reportData);
    } else if (filters.format === 'csv') {
      return this.generateCsvReport(reportData);
    } else {
      throw new Error('PDF format not implemented yet');
    }
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(filters: ReportFilters): Promise<Buffer> {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.createdAt = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
    }
    if (filters.customerId) {
      where.userId = filters.customerId; // Invoices are linked to users, not customers
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoiceItems: true,
        payments: {
          where: { status: 'COMPLETED' },
          select: {
            amount: true,
            paymentDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const reportData: FinancialReportData[] = invoices.map(invoice => {
      const paidAmount = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const balance = Number(invoice.totalAmount) - paidAmount;
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      const daysOverdue = dueDate < today ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.user?.name || 'N/A',
        issueDate: format(new Date(invoice.createdAt), 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        status: invoice.status,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount),
        paidAmount,
        balance,
        daysOverdue,
      };
    });

    if (filters.format === 'excel') {
      return await this.generateExcelReport('Financial Report', reportData);
    } else if (filters.format === 'csv') {
      return this.generateCsvReport(reportData);
    } else {
      throw new Error('PDF format not implemented yet');
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(filters: ReportFilters): Promise<Buffer> {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.createdAt = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
    }

    // Get monthly data
    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        user: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, any[]>();
    shipments.forEach(shipment => {
      const month = format(new Date(shipment.createdAt), 'yyyy-MM');
      if (!monthlyData.has(month)) {
        monthlyData.set(month, []);
      }
      monthlyData.get(month)!.push(shipment);
    });

    const reportData: PerformanceReportData[] = Array.from(monthlyData.entries()).map(([month, monthShipments]) => {
      const totalShipments = monthShipments.length;
      const deliveredShipments = monthShipments.filter(s =>
        [ShipmentStatus.DELIVERED_SUCCESSFULLY, ShipmentStatus.DELIVERY_CONFIRMED, ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status as any)
      ).length;
      const onTimeDeliveries = monthShipments.filter(s => {
        if (![ShipmentStatus.DELIVERED_SUCCESSFULLY, ShipmentStatus.DELIVERY_CONFIRMED, ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status as any)) return false;
        const createdAt = new Date(s.createdAt);
        const updatedAt = new Date(s.updatedAt);
        const deliveryDays = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return deliveryDays <= 7; // Assuming 7 days is on-time
      }).length;
      const delayedShipments = monthShipments.filter(s => {
        if (![ShipmentStatus.DELIVERED_SUCCESSFULLY, ShipmentStatus.DELIVERY_CONFIRMED, ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status as any)) return false;
        const createdAt = new Date(s.createdAt);
        const updatedAt = new Date(s.updatedAt);
        const deliveryDays = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return deliveryDays > 7;
      }).length;

      const averageDeliveryDays = deliveredShipments > 0 
        ? monthShipments.filter(s =>
            [ShipmentStatus.DELIVERED_SUCCESSFULLY, ShipmentStatus.DELIVERY_CONFIRMED, ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status as any)
          )
            .reduce((sum, s) => {
              const createdAt = new Date(s.createdAt);
              const updatedAt = new Date(s.updatedAt);
              const days = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / deliveredShipments
        : 0;

      const revenue = monthShipments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);

      return {
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        totalShipments,
        deliveredShipments,
        onTimeDeliveries,
        delayedShipments,
        averageDeliveryDays: Math.round(averageDeliveryDays * 100) / 100,
        revenue: Math.round(revenue * 100) / 100,
        onTimeRate: totalShipments > 0 ? Math.round((onTimeDeliveries / totalShipments) * 100) : 0,
        deliveryRate: totalShipments > 0 ? Math.round((deliveredShipments / totalShipments) * 100) : 0,
      };
    }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    if (filters.format === 'excel') {
      return await this.generateExcelReport('Performance Report', reportData);
    } else if (filters.format === 'csv') {
      return this.generateCsvReport(reportData);
    } else {
      throw new Error('PDF format not implemented yet');
    }
  }

  /**
   * Generate customer report
   */
  async generateCustomerReport(filters: ReportFilters): Promise<Buffer> {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.createdAt = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
    }

    // Get users who have shipments (acting as customers)
    const users = await prisma.user.findMany({
      include: {
        shipments: {
          where,
          select: {
            id: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    const reportData: CustomerReportData[] = users
      .filter(user => user.shipments.length > 0)
      .map(user => {
        const totalShipments = user.shipments.length;
        const totalRevenue = 0; // No value field in current schema
        const lastShipmentDate = user.shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt;
        const activeShipments = user.shipments.filter(s =>
          ![ShipmentStatus.DELIVERED_SUCCESSFULLY, ShipmentStatus.DELIVERY_CONFIRMED, ShipmentStatus.SIGNATURE_OBTAINED, ShipmentStatus.CANCELLED].includes(s.status as any)
        ).length;

        return {
          customerId: user.id,
          customerName: user.name,
          totalShipments,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageShipmentValue: totalShipments > 0 ? Math.round((totalRevenue / totalShipments) * 100) / 100 : 0,
          lastShipmentDate: format(new Date(lastShipmentDate), 'yyyy-MM-dd'),
          status: activeShipments > 0 ? 'Active' : 'Inactive',
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    if (filters.format === 'excel') {
      return await this.generateExcelReport('Customer Report', reportData);
    } else if (filters.format === 'csv') {
      return this.generateCsvReport(reportData);
    } else {
      throw new Error('PDF format not implemented yet');
    }
  }

  /**
   * Generate leave report
   */
  async generateLeaveReport(filters: ReportFilters): Promise<Buffer> {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.startDate = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.endDate = { ...where.endDate, lte: new Date(filters.dateTo) };
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        manager: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    const reportData: LeaveReportData[] = leaves.map(leave => ({
      employeeName: leave.employee.user?.name || 'N/A',
      department: 'N/A', // No department field in current schema
      leaveType: leave.leaveType,
      startDate: format(new Date(leave.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
      totalDays: leave.totalDays,
      status: leave.status,
      approvedBy: leave.manager?.user?.name,
      approvedAt: leave.managerApprovedAt ? format(new Date(leave.managerApprovedAt), 'yyyy-MM-dd') : undefined,
    }));

    if (filters.format === 'excel') {
      return await this.generateExcelReport('Leave Report', reportData);
    } else if (filters.format === 'csv') {
      return this.generateCsvReport(reportData);
    } else {
      throw new Error('PDF format not implemented yet');
    }
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(sheetName: string, data: any[]): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) {
      worksheet.addRow(['No data available']);
    } else {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers.map(header => this.camelCaseToTitleCase(header)));

      // Add data rows
      data.forEach(item => {
        worksheet.addRow(Object.values(item));
      });

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: false }, (cell) => {
          const cellLength = cell.value ? String(cell.value).length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Generate CSV report
   */
  private generateCsvReport(data: any[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('No data available');
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Convert camelCase to Title Case
   */
  private camelCaseToTitleCase(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  /**
   * Get report metadata
   */
  async getReportMetadata(reportType: string, filters: ReportFilters) {
    const where: any = {};
    
    if (filters.dateFrom) {
      where.createdAt = { gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
    }

    let totalRecords = 0;
    let dateRange = { min: null as Date | null, max: null as Date | null };

    switch (reportType) {
      case 'shipments':
        totalRecords = await prisma.shipment.count({ where });
        const shipmentDates = await prisma.shipment.aggregate({
          where,
          _min: { createdAt: true },
          _max: { createdAt: true },
        });
        dateRange = { min: shipmentDates._min.createdAt, max: shipmentDates._max.createdAt };
        break;
      
      case 'financial':
        totalRecords = await prisma.invoice.count({ where });
        const invoiceDates = await prisma.invoice.aggregate({
          where,
          _min: { createdAt: true },
          _max: { createdAt: true },
        });
        dateRange = { min: invoiceDates._min.createdAt, max: invoiceDates._max.createdAt };
        break;
      
      case 'customers':
        totalRecords = await prisma.user.count({
          where: {
            shipments: {
              some: where,
            },
          },
        });
        break;
      
      case 'leaves':
        totalRecords = await prisma.leave.count({ where });
        const leaveDates = await prisma.leave.aggregate({
          where,
          _min: { startDate: true },
          _max: { endDate: true },
        });
        dateRange = { min: leaveDates._min.startDate, max: leaveDates._max.endDate };
        break;
      
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    return {
      totalRecords,
      dateRange: {
        min: dateRange.min ? format(dateRange.min, 'yyyy-MM-dd') : null,
        max: dateRange.max ? format(dateRange.max, 'yyyy-MM-dd') : null,
      },
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };
  }
}

export const reportService = new ReportService();
