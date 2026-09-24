"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const authService_1 = require("../../services/authService");
const zod_1 = require("zod");
const reportService_1 = require("../../services/reportService");
// Validation schema for report generation
const generateReportSchema = zod_1.z.object({
    reportType: zod_1.z.enum(['shipments', 'financial', 'performance', 'customers', 'leaves']),
    format: zod_1.z.enum(['excel', 'csv', 'pdf']),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    serviceType: zod_1.z.string().optional(),
});
// Validation schema for report metadata
const getMetadataSchema = zod_1.z.object({
    reportType: zod_1.z.enum(['shipments', 'financial', 'performance', 'customers', 'leaves']),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    serviceType: zod_1.z.string().optional(),
});
exports.reportController = {
    /**
     * Generate and download report
     */
    async generateReport(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const validatedData = generateReportSchema.parse(req.body);
            const filters = {
                ...validatedData,
                userId: await (0, authService_1.hasAnyRole)(req, ['admin', 'finance'])
                    ? validatedData.userId
                    : String(req.user.sub),
            };
            let buffer;
            let filename;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            switch (validatedData.reportType) {
                case 'shipments':
                    buffer = await reportService_1.reportService.generateShipmentReport(filters);
                    filename = `shipment-report-${timestamp}.${validatedData.format}`;
                    break;
                case 'financial':
                    buffer = await reportService_1.reportService.generateFinancialReport(filters);
                    filename = `financial-report-${timestamp}.${validatedData.format}`;
                    break;
                case 'performance':
                    buffer = await reportService_1.reportService.generatePerformanceReport(filters);
                    filename = `performance-report-${timestamp}.${validatedData.format}`;
                    break;
                case 'customers':
                    buffer = await reportService_1.reportService.generateCustomerReport(filters);
                    filename = `customer-report-${timestamp}.${validatedData.format}`;
                    break;
                case 'leaves':
                    buffer = await reportService_1.reportService.generateLeaveReport(filters);
                    filename = `leave-report-${timestamp}.${validatedData.format}`;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid report type',
                    });
            }
            // Set appropriate content type and headers
            let contentType;
            if (validatedData.format === 'excel') {
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            else if (validatedData.format === 'pdf') {
                contentType = 'application/pdf';
            }
            else {
                contentType = 'text/csv';
            }
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            return res.send(buffer);
        }
        catch (error) {
            console.error('Error generating report:', error);
            return res.status(400).json({
                success: false,
                message: error instanceof zod_1.z.ZodError
                    ? error.errors.map(e => e.message).join(', ')
                    : 'Failed to generate report',
            });
        }
    },
    /**
     * Get report metadata (counts, date ranges, etc.)
     */
    async getReportMetadata(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { reportType, ...filters } = getMetadataSchema.parse(req.query);
            const metadata = await reportService_1.reportService.getReportMetadata(reportType, {
                ...filters,
                format: 'excel', // Format doesn't matter for metadata
                userId: await (0, authService_1.hasAnyRole)(req, ['admin', 'finance'])
                    ? filters.userId
                    : String(req.user.sub),
            });
            return res.json({
                success: true,
                data: metadata,
            });
        }
        catch (error) {
            console.error('Error getting report metadata:', error);
            return res.status(400).json({
                success: false,
                message: error instanceof zod_1.z.ZodError
                    ? error.errors.map(e => e.message).join(', ')
                    : 'Failed to get report metadata',
            });
        }
    },
    /**
     * Get available report types
     */
    async getAvailableReports(req, res) {
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
                (0, authService_1.hasAnyRole)(req, ['admin', 'hr', 'hr_manager', 'hr_staff']),
                (0, authService_1.hasAnyRole)(req, ['admin', 'finance']),
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
        }
        catch (error) {
            console.error('Error getting available reports:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get available reports',
            });
        }
    },
};
