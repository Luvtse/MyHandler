"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const json2csv_1 = require("json2csv");
const date_fns_1 = require("date-fns");
class ReportService {
    /**
     * Generate shipment report with filters
     */
    async generateShipmentReport(filters) {
        const where = {};
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
            if (client_1.ShipmentStatus[key]) {
                where.status = client_1.ShipmentStatus[key];
            }
        }
        if (filters.serviceType) {
            where.serviceType = filters.serviceType;
        }
        const shipments = await prisma_1.default.shipment.findMany({
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
        const reportData = shipments.map(shipment => {
            const isDelivered = shipment.status === client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY ||
                shipment.status === client_1.ShipmentStatus.DELIVERY_CONFIRMED ||
                shipment.status === client_1.ShipmentStatus.SIGNATURE_OBTAINED;
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
                createdAt: (0, date_fns_1.format)(createdAt, 'yyyy-MM-dd HH:mm'),
                updatedAt: (0, date_fns_1.format)(new Date(shipment.updatedAt), 'yyyy-MM-dd HH:mm'),
                deliveredAt: deliveredAt ? (0, date_fns_1.format)(deliveryDate, 'yyyy-MM-dd HH:mm') : undefined,
                deliveryDays,
            };
        });
        if (filters.format === 'excel') {
            return await this.generateExcelReport('Shipment Report', reportData);
        }
        else if (filters.format === 'csv') {
            return this.generateCsvReport(reportData);
        }
        else {
            return this.generatePdfReport('Shipment Report', reportData);
        }
    }
    /**
     * Generate financial report
     */
    async generateFinancialReport(filters) {
        const where = {};
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
        const invoices = await prisma_1.default.invoice.findMany({
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
        const reportData = invoices.map(invoice => {
            const paidAmount = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const balance = Number(invoice.totalAmount) - paidAmount;
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            const daysOverdue = dueDate < today ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            return {
                invoiceNumber: invoice.invoiceNumber,
                customerName: invoice.user?.name || 'N/A',
                issueDate: (0, date_fns_1.format)(new Date(invoice.createdAt), 'yyyy-MM-dd'),
                dueDate: (0, date_fns_1.format)(dueDate, 'yyyy-MM-dd'),
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
        }
        else if (filters.format === 'csv') {
            return this.generateCsvReport(reportData);
        }
        else {
            return this.generatePdfReport('Financial Report', reportData);
        }
    }
    /**
     * Generate performance report
     */
    async generatePerformanceReport(filters) {
        const where = {};
        if (filters.dateFrom) {
            where.createdAt = { gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
            where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
        }
        // Get monthly data
        const shipments = await prisma_1.default.shipment.findMany({
            where,
            include: {
                user: true,
            },
        });
        // Group by month
        const monthlyData = new Map();
        shipments.forEach(shipment => {
            const month = (0, date_fns_1.format)(new Date(shipment.createdAt), 'yyyy-MM');
            if (!monthlyData.has(month)) {
                monthlyData.set(month, []);
            }
            monthlyData.get(month).push(shipment);
        });
        const reportData = Array.from(monthlyData.entries()).map(([month, monthShipments]) => {
            const totalShipments = monthShipments.length;
            const deliveredShipments = monthShipments.filter(s => [client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY, client_1.ShipmentStatus.DELIVERY_CONFIRMED, client_1.ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status)).length;
            const onTimeDeliveries = monthShipments.filter(s => {
                if (![client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY, client_1.ShipmentStatus.DELIVERY_CONFIRMED, client_1.ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status))
                    return false;
                const createdAt = new Date(s.createdAt);
                const updatedAt = new Date(s.updatedAt);
                const deliveryDays = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                return deliveryDays <= 7; // Assuming 7 days is on-time
            }).length;
            const delayedShipments = monthShipments.filter(s => {
                if (![client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY, client_1.ShipmentStatus.DELIVERY_CONFIRMED, client_1.ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status))
                    return false;
                const createdAt = new Date(s.createdAt);
                const updatedAt = new Date(s.updatedAt);
                const deliveryDays = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                return deliveryDays > 7;
            }).length;
            const averageDeliveryDays = deliveredShipments > 0
                ? monthShipments.filter(s => [client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY, client_1.ShipmentStatus.DELIVERY_CONFIRMED, client_1.ShipmentStatus.SIGNATURE_OBTAINED].includes(s.status))
                    .reduce((sum, s) => {
                    const createdAt = new Date(s.createdAt);
                    const updatedAt = new Date(s.updatedAt);
                    const days = Math.ceil((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                }, 0) / deliveredShipments
                : 0;
            const revenue = monthShipments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
            return {
                month: (0, date_fns_1.format)(new Date(month + '-01'), 'MMM yyyy'),
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
        }
        else if (filters.format === 'csv') {
            return this.generateCsvReport(reportData);
        }
        else {
            return this.generatePdfReport('Performance Report', reportData);
        }
    }
    /**
     * Generate customer report
     */
    async generateCustomerReport(filters) {
        const where = {};
        if (filters.dateFrom) {
            where.createdAt = { gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
            where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
        }
        // Get users who have shipments (acting as customers)
        const users = await prisma_1.default.user.findMany({
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
        const reportData = users
            .filter(user => user.shipments.length > 0)
            .map(user => {
            const totalShipments = user.shipments.length;
            const totalRevenue = 0; // No value field in current schema
            const lastShipmentDate = user.shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt;
            const activeShipments = user.shipments.filter(s => ![client_1.ShipmentStatus.DELIVERED_SUCCESSFULLY, client_1.ShipmentStatus.DELIVERY_CONFIRMED, client_1.ShipmentStatus.SIGNATURE_OBTAINED, client_1.ShipmentStatus.CANCELLED].includes(s.status)).length;
            return {
                customerId: user.id,
                customerName: user.name,
                totalShipments,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                averageShipmentValue: totalShipments > 0 ? Math.round((totalRevenue / totalShipments) * 100) / 100 : 0,
                lastShipmentDate: (0, date_fns_1.format)(new Date(lastShipmentDate), 'yyyy-MM-dd'),
                status: activeShipments > 0 ? 'Active' : 'Inactive',
            };
        })
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
        if (filters.format === 'excel') {
            return await this.generateExcelReport('Customer Report', reportData);
        }
        else if (filters.format === 'csv') {
            return this.generateCsvReport(reportData);
        }
        else {
            return this.generatePdfReport('Customer Report', reportData);
        }
    }
    /**
     * Generate leave report
     */
    async generateLeaveReport(filters) {
        const where = {};
        if (filters.dateFrom) {
            where.startDate = { gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
            where.endDate = { ...where.endDate, lte: new Date(filters.dateTo) };
        }
        if (filters.status) {
            where.status = filters.status;
        }
        const leaves = await prisma_1.default.leave.findMany({
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
        const reportData = leaves.map(leave => ({
            employeeName: leave.employee.user?.name || 'N/A',
            department: 'N/A', // No department field in current schema
            leaveType: leave.leaveType,
            startDate: (0, date_fns_1.format)(new Date(leave.startDate), 'yyyy-MM-dd'),
            endDate: (0, date_fns_1.format)(new Date(leave.endDate), 'yyyy-MM-dd'),
            totalDays: leave.totalDays,
            status: leave.status,
            approvedBy: leave.manager?.user?.name,
            approvedAt: leave.managerApprovedAt ? (0, date_fns_1.format)(new Date(leave.managerApprovedAt), 'yyyy-MM-dd') : undefined,
        }));
        if (filters.format === 'excel') {
            return await this.generateExcelReport('Leave Report', reportData);
        }
        else if (filters.format === 'csv') {
            return this.generateCsvReport(reportData);
        }
        else {
            return this.generatePdfReport('Leave Report', reportData);
        }
    }
    /**
     * Generate Excel report
     */
    /**
     * Generate Excel-compatible CSV (tab-separated .xlsx that Excel opens natively).
     * No external library required.
     */
    async generateExcelReport(sheetName, data) {
        if (data.length === 0) {
            return Buffer.from('No data available', 'utf-8');
        }
        const headers = Object.keys(data[0]).map(h => this.camelCaseToTitleCase(h));
        const escape = (v) => {
            const s = String(v ?? '');
            // Wrap in quotes if the value contains comma, quote, or newline
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        const lines = [headers.map(escape).join(',')];
        for (const row of data) {
            lines.push(Object.values(row).map(escape).join(','));
        }
        return Buffer.from(lines.join('\r\n'), 'utf-8');
    }
    /**
     * Generate CSV report
     */
    generateCsvReport(data) {
        if (data.length === 0) {
            return Buffer.from('No data available');
        }
        const json2csvParser = new json2csv_1.Parser();
        const csv = json2csvParser.parse(data);
        return Buffer.from(csv, 'utf-8');
    }
    /**
     * Generate a valid PDF report without external dependencies.
     * Uses PDF 1.4 syntax with built-in Helvetica/Helvetica-Bold fonts.
     */
    generatePdfReport(title, data) {
        const MARGIN = 40;
        const PAGE_W = 612;
        const PAGE_H = 792;
        const ROW_H = 16;
        const HEADER_H = 18;
        const TOP_Y = PAGE_H - MARGIN - 30; // first content y-position
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        const colW = headers.length > 0 ? Math.floor((PAGE_W - MARGIN * 2) / headers.length) : PAGE_W - MARGIN * 2;
        // Escape PDF string special characters
        const esc = (s) => String(s)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .slice(0, 60); // truncate long cells
        // Build all page content streams
        const pages = [];
        let currentLines = [];
        let y = TOP_Y;
        const newPage = () => {
            if (currentLines.length > 0)
                pages.push(currentLines.join('\n'));
            currentLines = [];
            y = TOP_Y;
            // Title on every page
            currentLines.push('BT', '/FB 14 Tf', `${MARGIN} ${PAGE_H - MARGIN - 14} Td`, `(${esc(title)}) Tj`, 'ET');
            // Column headers
            currentLines.push('BT', '/FB 9 Tf');
            headers.forEach((h, i) => {
                currentLines.push(`${MARGIN + i * colW} ${y} Td`, `(${esc(this.camelCaseToTitleCase(h))}) Tj`);
                if (i < headers.length - 1)
                    currentLines.push(`${-(MARGIN + i * colW)} 0 Td`);
            });
            currentLines.push('ET');
            y -= HEADER_H;
            // Separator line
            currentLines.push(`${MARGIN} ${y + 4} m`, `${PAGE_W - MARGIN} ${y + 4} l`, '0.5 w S');
        };
        newPage();
        // Data rows
        for (const row of data) {
            if (y < MARGIN + ROW_H)
                newPage();
            currentLines.push('BT', '/F1 8 Tf');
            const vals = Object.values(row);
            vals.forEach((v, i) => {
                currentLines.push(`${MARGIN + i * colW} ${y} Td`, `(${esc(String(v ?? ''))}) Tj`);
                if (i < vals.length - 1)
                    currentLines.push(`${-(MARGIN + i * colW)} 0 Td`);
            });
            currentLines.push('ET');
            y -= ROW_H;
        }
        pages.push(currentLines.join('\n'));
        if (data.length === 0) {
            pages[0] = (pages[0] ?? '') + '\nBT\n/F1 10 Tf\n' + `${MARGIN} ${TOP_Y - 30} Td\n(No data available) Tj\nET`;
        }
        // ── Build PDF binary ────────────────────────────────────────────────────────
        const objects = [];
        let nextId = 1;
        const addObj = (content) => {
            const id = nextId++;
            objects.push({ id, content });
            return id;
        };
        // Font objects
        const fontRegId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        const fontBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        // Resources object
        const resId = addObj(`<< /Font << /F1 ${fontRegId} 0 R /FB ${fontBoldId} 0 R >> >>`);
        // Page content streams + page objects
        const pageIds = [];
        for (const stream of pages) {
            const streamBytes = Buffer.from(stream, 'latin1');
            const contentId = addObj(`<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`);
            const pageId = addObj(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources ${resId} 0 R >>`);
            pageIds.push(pageId);
        }
        // Pages dict (we'll replace parent refs)
        const pagesId = addObj(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
        // Fix parent reference in each page object
        objects.forEach(o => {
            if (o.content.includes('/Type /Page ')) {
                o.content = o.content.replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`);
            }
        });
        // Catalog
        const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
        // ── Serialise ───────────────────────────────────────────────────────────────
        const lines = ['%PDF-1.4', '%\u00e2\u00e3\u00cf\u00d3'];
        const offsets = new Array(nextId).fill(0);
        for (const { id, content } of objects) {
            offsets[id] = lines.join('\n').length + 1; // +1 for newline
            lines.push(`${id} 0 obj\n${content}\nendobj`);
        }
        const xrefOffset = lines.join('\n').length + 1;
        lines.push('xref');
        lines.push(`0 ${nextId}`);
        lines.push('0000000000 65535 f ');
        for (let i = 1; i < nextId; i++) {
            lines.push(String(offsets[i]).padStart(10, '0') + ' 00000 n ');
        }
        lines.push(`trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>`);
        lines.push(`startxref\n${xrefOffset}\n%%EOF`);
        return Buffer.from(lines.join('\n'), 'latin1');
    }
    /**
     * Convert camelCase to Title Case
     */
    camelCaseToTitleCase(str) {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    /**
     * Get report metadata
     */
    async getReportMetadata(reportType, filters) {
        const where = {};
        if (filters.dateFrom) {
            where.createdAt = { gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
            where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
        }
        let totalRecords = 0;
        let dateRange = { min: null, max: null };
        switch (reportType) {
            case 'shipments':
                totalRecords = await prisma_1.default.shipment.count({ where });
                const shipmentDates = await prisma_1.default.shipment.aggregate({
                    where,
                    _min: { createdAt: true },
                    _max: { createdAt: true },
                });
                dateRange = { min: shipmentDates._min.createdAt, max: shipmentDates._max.createdAt };
                break;
            case 'financial':
                totalRecords = await prisma_1.default.invoice.count({ where });
                const invoiceDates = await prisma_1.default.invoice.aggregate({
                    where,
                    _min: { createdAt: true },
                    _max: { createdAt: true },
                });
                dateRange = { min: invoiceDates._min.createdAt, max: invoiceDates._max.createdAt };
                break;
            case 'customers':
                totalRecords = await prisma_1.default.user.count({
                    where: {
                        shipments: {
                            some: where,
                        },
                    },
                });
                break;
            case 'leaves':
                totalRecords = await prisma_1.default.leave.count({ where });
                const leaveDates = await prisma_1.default.leave.aggregate({
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
                min: dateRange.min ? (0, date_fns_1.format)(dateRange.min, 'yyyy-MM-dd') : null,
                max: dateRange.max ? (0, date_fns_1.format)(dateRange.max, 'yyyy-MM-dd') : null,
            },
            generatedAt: (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        };
    }
}
exports.reportService = new ReportService();
