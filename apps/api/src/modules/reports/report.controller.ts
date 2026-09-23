import { Request, Response } from 'express';
import { hasAnyRole } from '../../services/authService';
import { z } from 'zod';
import { reportService, ReportFilters } from '../../services/reportService';

// Validation schema for report generation
const generateReportSchema = z.object({
  reportType: z.enum(['shipments', 'financial', 'performance', 'customers', 'leaves']),
  format: z.enum(['excel', 'csv', 'pdf']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  serviceType: z.string().optional(),
});

// Validation schema for report metadata
const getMetadataSchema = z.object({
  reportType: z.enum(['shipments', 'financial', 'performance', 'customers', 'leaves']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  serviceType: z.string().optional(),
});

export const reportController = {
  /**
   * Generate and download report
   */
  async generateReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const validatedData = generateReportSchema.parse(req.body);
      const filters: ReportFilters = {
        ...validatedData,
        userId: await hasAnyRole(req, ['admin', 'finance'])
          ? validatedData.userId
          : String(req.user.sub),
      };

      let buffer: Buffer;
      let filename: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      switch (validatedData.reportType) {
        case 'shipments':
          buffer = await reportService.generateShipmentReport(filters);
          filename = `shipment-report-${timestamp}.${validatedData.format}`;
          break;
        
        case 'financial':
          buffer = await reportService.generateFinancialReport(filters);
          filename = `financial-report-${timestamp}.${validatedData.format}`;
          break;
        
        case 'performance':
          buffer = await reportService.generatePerformanceReport(filters);
          filename = `performance-report-${timestamp}.${validatedData.format}`;
          break;
        
        case 'customers':
          buffer = await reportService.generateCustomerReport(filters);
          filename = `customer-report-${timestamp}.${validatedData.format}`;
          break;
        
        case 'leaves':
          buffer = await reportService.generateLeaveReport(filters);
          filename = `leave-report-${timestamp}.${validatedData.format}`;
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type',
          });
      }

      // Set appropriate content type and headers
      let contentType: string;
      if (validatedData.format === 'excel') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (validatedData.format === 'pdf') {
        contentType = 'application/pdf';
      } else {
        contentType = 'text/csv';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.send(buffer);
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ') 
          : 'Failed to generate report',
      });
    }
  },

  /**
   * Get report metadata (counts, date ranges, etc.)
   */
  async getReportMetadata(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { reportType, ...filters } = getMetadataSchema.parse(req.query);
      
      const metadata = await reportService.getReportMetadata(reportType, {
        ...filters,
        format: 'excel', // Format doesn't matter for metadata
        userId: await hasAnyRole(req, ['admin', 'finance'])
          ? filters.userId
          : String(req.user.sub),
      });

      return res.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      console.error('Error getting report metadata:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof z.ZodError 
          ? error.errors.map(e => e.message).join(', ') 
          : 'Failed to get report metadata',
      });
    }
  },

  /**
   * Get available report types
   */
  async getAvailableReports(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const reports = [
        {
          id: 'shipments',
          name: 'Shipment Report',
          description: 'Detailed shipment information with tracking data',
          availableFormats: ['excel', 'csv'],
          filters: ['dateFrom', 'dateTo', 'status', 'serviceType', 'customerId'],
        },
        {
          id: 'financial',
          name: 'Financial Report',
          description: 'Invoice and payment information with aging analysis',
          availableFormats: ['excel', 'csv'],
          filters: ['dateFrom', 'dateTo', 'status', 'customerId'],
        },
        {
          id: 'performance',
          name: 'Performance Report',
          description: 'Monthly performance metrics and KPIs',
          availableFormats: ['excel', 'csv'],
          filters: ['dateFrom', 'dateTo'],
        },
        {
          id: 'customers',
          name: 'Customer Report',
          description: 'Customer activity and revenue analysis',
          availableFormats: ['excel', 'csv'],
          filters: ['dateFrom', 'dateTo'],
        },
        {
          id: 'leaves',
          name: 'Leave Report',
          description: 'Employee leave requests and approvals',
          availableFormats: ['excel', 'csv'],
          filters: ['dateFrom', 'dateTo', 'status'],
        },
      ];

      // Filter reports based on user role (primary JWT role OR DB secondary
      // roles). `Array.prototype.filter` cannot be async, so resolve the two
      // role checks once up front.
      const [canViewLeaves, canViewFinancial] = await Promise.all([
        hasAnyRole(req, ['admin', 'hr', 'hr_manager', 'hr_staff']),
        hasAnyRole(req, ['admin', 'finance']),
      ]);
      const availableReports = reports.filter(report => {
        if (report.id === 'leaves') {
          return canViewLeaves;
        }
        if (report.id === 'financial') {
          return canViewFinancial;
        }
        return true;
      });

      return res.json({
        success: true,
        data: availableReports,
      });
    } catch (error) {
      console.error('Error getting available reports:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get available reports',
      });
    }
  },
};