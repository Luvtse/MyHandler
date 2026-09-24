"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentsRouter = void 0;
const express_1 = require("express");
const shipments_service_1 = require("./shipments.service");
const eta_service_1 = require("./eta.service");
const authService_1 = require("../../services/authService");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const emailService_1 = require("../../services/emailService");
const auditLog_1 = require("../../middlewares/auditLog");
const DELIVERED_STATUSES = new Set(['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED', 'SIGNATURE_OBTAINED']);
exports.shipmentsRouter = (0, express_1.Router)();
// GET /api/shipments - List all shipments with pagination and filters (role-based visibility)
exports.shipmentsRouter.get('/', authService_1.requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            userId: req.query.userId,
            status: req.query.status,
            search: req.query.search,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            paymentType: req.query.paymentType,
        };
        // Get user info from authenticated request
        const userRole = req.user?.role;
        const userId = req.user?.sub; // sub contains the user ID from JWT
        const result = await shipments_service_1.shipmentsService.findAll(page, limit, filters, userRole, userId);
        res.json({
            success: true,
            data: result.shipments,
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch shipments'
        });
    }
});
// Airports and flight schedules management routes are defined below with full CRUD implementations.
exports.shipmentsRouter.get('/airports', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.airport.findMany({ orderBy: { city: 'asc' } });
        res.json({ success: true, data: rows });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to load airports' });
    }
});
exports.shipmentsRouter.get('/flight-schedules', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.flightSchedule.findMany({ orderBy: [{ originCity: 'asc' }, { destinationCity: 'asc' }] });
        res.json({ success: true, data: rows });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to load flight schedules' });
    }
});
// GET /api/shipments/:id - Get shipment by ID
exports.shipmentsRouter.get('/:id', authService_1.requireAuth, async (req, res) => {
    try {
        const shipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Staff roles (incl. DB secondary roles) may view any shipment; others must own it.
        const canViewAllShipments = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance', 'report', 'warehouse', 'operations']);
        if (!canViewAllShipments && shipment.userId !== req.user?.sub) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to view this shipment'
            });
        }
        res.json({
            success: true,
            data: shipment
        });
    }
    catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch shipment'
        });
    }
});
// POST /api/shipments - Create new shipment
exports.shipmentsRouter.post('/', authService_1.requireAuth, async (req, res) => {
    try {
        const rawPt = req.body?.paymentType;
        const ptUpper = rawPt ? String(rawPt).toUpperCase() : '';
        if (!ptUpper || !['PREPAID', 'COLLECT', 'ACCOUNT'].includes(ptUpper)) {
            return res.status(400).json({ success: false, error: 'paymentType is required (PREPAID/COLLECT/ACCOUNT)' });
        }
        if (ptUpper === 'ACCOUNT') {
            const acct = req.body?.accountNumber;
            if (!acct || String(acct).trim().length === 0) {
                return res.status(400).json({ success: false, error: 'accountNumber is required when paymentType is ACCOUNT' });
            }
        }
        // Automatically set the userId from the authenticated user
        const shipmentData = {
            ...req.body,
            paymentType: ptUpper,
            userId: req.user?.sub // sub contains the user ID from JWT
        };
        const shipment = await shipments_service_1.shipmentsService.create(shipmentData);
        // Fire-and-forget: email notification + audit log
        const userId = shipmentData.userId ?? '';
        if (userId) {
            emailService_1.emailService.sendNotificationEmail(userId, 'SHIPMENT_CREATED', {
                reference: shipment.reference ?? shipment.id,
                origin: shipment.originAddress ?? req.body.originAddress,
                destination: shipment.destinationAddress ?? req.body.destinationAddress,
                serviceType: shipment.serviceLevel ?? req.body.serviceLevel,
            }).catch(err => console.error('[Shipment email] create:', err));
            (0, auditLog_1.audit)({ req, action: 'CREATE', entity: 'Shipment', entityId: shipment.id }).catch(() => { });
        }
        res.status(201).json({
            success: true,
            data: shipment
        });
    }
    catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create shipment'
        });
    }
});
// PUT /api/shipments/:id - Update shipment
exports.shipmentsRouter.put('/:id', authService_1.requireAuth, async (req, res) => {
    try {
        // First check if user can access this shipment
        const existingShipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!existingShipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Staff roles (incl. DB secondary roles) may update any shipment; owners may update their own.
        const canUpdateAllShipments = await (0, authService_1.hasAnyRole)(req, ['admin', 'warehouse', 'operations']);
        if (!canUpdateAllShipments && existingShipment.userId !== req.user?.sub) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this shipment'
            });
        }
        const shipment = await shipments_service_1.shipmentsService.update(req.params.id, req.body);
        res.json({
            success: true,
            data: shipment
        });
    }
    catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update shipment'
        });
    }
});
// DELETE /api/shipments/:id - Delete shipment
exports.shipmentsRouter.delete('/:id', authService_1.requireAuth, async (req, res) => {
    try {
        // First check if user can access this shipment
        const existingShipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!existingShipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Deletion is admin-only (secondary admin role counts); owners cannot delete shipments.
        const canDelete = await (0, authService_1.hasAnyRole)(req, ['admin']);
        if (!canDelete) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this shipment'
            });
        }
        await shipments_service_1.shipmentsService.delete(req.params.id);
        res.json({
            success: true,
            message: 'Shipment deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete shipment'
        });
    }
});
// GET /api/shipments/track/:awb - Track shipment by AWB number
// Public: Track shipment by AWB number (no auth)
exports.shipmentsRouter.get('/track/:awb', async (req, res) => {
    try {
        const shipment = await shipments_service_1.shipmentsService.findByAwb(req.params.awb);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Public tracking: do not enforce auth. Return shipment with tracking events.
        res.json({
            success: true,
            data: shipment
        });
    }
    catch (error) {
        console.error('Error tracking shipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track shipment'
        });
    }
});
// GET /api/shipments/:id/eta - Authoritative ETA based on server shipment status
exports.shipmentsRouter.get('/:id/eta', authService_1.requireAuth, async (req, res) => {
    try {
        const shipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ success: false, error: 'Shipment not found' });
        }
        const canViewAll = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance', 'report', 'warehouse', 'operations']);
        if (!canViewAll && shipment.userId !== req.user?.sub) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const originCity = String(shipment.originCity || '').trim();
        const destinationCity = String(shipment.destinationCity || '').trim();
        const dropoffTime = new Date(shipment.createdAt).toISOString();
        const serviceLevel = String(shipment.serviceLevel || 'standard');
        const currentStatus = String(shipment.status || '');
        const result = await eta_service_1.etaService.calculateETA({
            originCode: shipment.originAirportCode,
            destinationCode: shipment.destinationAirportCode,
            originCity: originCity || undefined,
            destinationCity: destinationCity || undefined,
            serviceLevel,
            dropoffTime,
            currentStatus,
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to calculate ETA' });
    }
});
// POST /api/shipments/eta/calculate
exports.shipmentsRouter.post('/eta/calculate', async (req, res) => {
    try {
        const result = await eta_service_1.etaService.calculateETA({
            originCode: req.body.originCode ? String(req.body.originCode) : undefined,
            destinationCode: req.body.destinationCode ? String(req.body.destinationCode) : undefined,
            originCity: req.body.originCity ? String(req.body.originCity) : undefined,
            destinationCity: req.body.destinationCity ? String(req.body.destinationCity) : undefined,
            serviceLevel: String(req.body.serviceLevel || ''),
            dropoffTime: String(req.body.dropoffTime || new Date().toISOString()),
            currentStatus: req.body.currentStatus ? String(req.body.currentStatus) : undefined,
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to calculate ETA' });
    }
});
// GET /api/shipments/eta/availability
exports.shipmentsRouter.get('/eta/availability', async (req, res) => {
    try {
        const result = await eta_service_1.etaService.availability({
            originCode: req.query.originCode ? String(req.query.originCode) : undefined,
            destinationCode: req.query.destinationCode ? String(req.query.destinationCode) : undefined,
            originCity: req.query.originCity ? String(req.query.originCity) : undefined,
            destinationCity: req.query.destinationCity ? String(req.query.destinationCity) : undefined,
            date: String(req.query.date || new Date().toISOString()),
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get availability' });
    }
});
// Airports management (admin only)
exports.shipmentsRouter.get('/airports', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.airport.findMany({ orderBy: { city: 'asc' } });
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to load airports' });
    }
});
exports.shipmentsRouter.post('/airports', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const created = await prisma_1.default.airport.create({ data: req.body });
        res.status(201).json({ success: true, data: created });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to create airport' });
    }
});
exports.shipmentsRouter.put('/airports/:code', authService_1.requireAuth, async (req, res) => {
    try {
        const updated = await prisma_1.default.airport.update({ where: { code: req.params.code }, data: req.body });
        res.json({ success: true, data: updated });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to update airport' });
    }
});
exports.shipmentsRouter.delete('/airports/:code', authService_1.requireAuth, async (req, res) => {
    try {
        await prisma_1.default.airport.delete({ where: { code: req.params.code } });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to delete airport' });
    }
});
// Flight schedules management (admin only)
exports.shipmentsRouter.get('/flight-schedules', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.flightSchedule.findMany({ orderBy: [{ originCity: 'asc' }, { destinationCity: 'asc' }] });
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to load flight schedules' });
    }
});
// Service Level Settings management (admin)
exports.shipmentsRouter.get('/service-level-settings', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.serviceLevelSettings.findMany();
        res.json({ success: true, data: rows });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to load settings' });
    }
});
exports.shipmentsRouter.post('/service-level-settings', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const created = await prisma_1.default.serviceLevelSettings.create({ data: req.body });
        res.status(201).json({ success: true, data: created });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to create setting' });
    }
});
exports.shipmentsRouter.put('/service-level-settings/:id', authService_1.requireAuth, async (req, res) => {
    try {
        const updated = await prisma_1.default.serviceLevelSettings.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: updated });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to update setting' });
    }
});
exports.shipmentsRouter.delete('/service-level-settings/:id', authService_1.requireAuth, async (req, res) => {
    try {
        await prisma_1.default.serviceLevelSettings.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to delete setting' });
    }
});
// Operating calendar management (admin)
exports.shipmentsRouter.get('/operating-calendar', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const rows = await prisma_1.default.operatingCalendar.findMany({ orderBy: { date: 'asc' } });
        res.json({ success: true, data: rows });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to load calendar' });
    }
});
exports.shipmentsRouter.post('/operating-calendar', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const created = await prisma_1.default.operatingCalendar.create({ data: req.body });
        res.status(201).json({ success: true, data: created });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to create calendar entry' });
    }
});
exports.shipmentsRouter.delete('/operating-calendar/:id', authService_1.requireAuth, async (req, res) => {
    try {
        await prisma_1.default.operatingCalendar.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to delete calendar entry' });
    }
});
// Bulk schedules upload (admin)
exports.shipmentsRouter.post('/flight-schedules/bulk', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const items = Array.isArray(req.body) ? req.body : [];
        if (!items.length)
            return res.status(400).json({ success: false, error: 'No schedules provided' });
        await prisma_1.default.flightSchedule.createMany({ data: items });
        res.status(201).json({ success: true, count: items.length });
    }
    catch {
        res.status(500).json({ success: false, error: 'Failed to upload schedules' });
    }
});
exports.shipmentsRouter.post('/flight-schedules', authService_1.requireAuth, (0, authService_1.requireAnyRole)(['admin', 'warehouse']), async (req, res) => {
    try {
        const created = await prisma_1.default.flightSchedule.create({ data: req.body });
        res.status(201).json({ success: true, data: created });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to create flight schedule' });
    }
});
exports.shipmentsRouter.put('/flight-schedules/:id', authService_1.requireAuth, async (req, res) => {
    try {
        const updated = await prisma_1.default.flightSchedule.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: updated });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to update flight schedule' });
    }
});
exports.shipmentsRouter.delete('/flight-schedules/:id', authService_1.requireAuth, async (req, res) => {
    try {
        await prisma_1.default.flightSchedule.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to delete flight schedule' });
    }
});
// POST /api/shipments/:id/tracking-events - Add tracking event
exports.shipmentsRouter.post('/:id/tracking-events', authService_1.requireAuth, async (req, res) => {
    try {
        // Check if user can access this shipment
        const existingShipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!existingShipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Allow staff roles (incl. DB secondary roles) or the shipment owner
        const canUpdateAllShipments = await (0, authService_1.hasAnyRole)(req, ['admin', 'warehouse', 'driver', 'operations']);
        if (!canUpdateAllShipments && existingShipment.userId !== req.user?.sub) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to add tracking events to this shipment'
            });
        }
        const event = await shipments_service_1.shipmentsService.addTrackingEvent(req.params.id, req.body);
        // If this tracking event marks the shipment as delivered, send notification
        if (DELIVERED_STATUSES.has(req.body?.status ?? '')) {
            const shipment = existingShipment;
            if (shipment?.userId) {
                emailService_1.emailService.sendNotificationEmail(shipment.userId, 'SHIPMENT_DELIVERED', {
                    reference: shipment.reference ?? shipment.id,
                    destination: shipment.destinationAddress,
                    deliveredAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                }).catch(err => console.error('[Shipment email] delivered:', err));
                (0, auditLog_1.audit)({ req, action: 'STATUS_CHANGE', entity: 'Shipment', entityId: req.params.id, changes: { status: req.body.status } }).catch(() => { });
            }
        }
        res.status(201).json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Error adding tracking event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add tracking event'
        });
    }
});
// POST /api/shipments/:id/schedule-pickup - Schedule pickup
exports.shipmentsRouter.post('/:id/schedule-pickup', authService_1.requireAuth, async (req, res) => {
    try {
        // Check if user can access this shipment
        const existingShipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!existingShipment) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        // Authorization: staff roles (incl. DB secondary roles) may act on any
        // shipment; everyone else must own it.
        const isStaff = await (0, authService_1.hasAnyRole)(req, ['admin', 'warehouse', 'operations']);
        if (!isStaff && existingShipment.userId !== req.user?.sub) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to schedule pickup for this shipment'
            });
        }
        const event = await shipments_service_1.shipmentsService.schedulePickup(req.params.id, req.body);
        res.status(201).json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Error scheduling pickup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule pickup'
        });
    }
});
// POST /api/shipments/:id/retry-awb - Retry AWB generation for temporary AWBs
exports.shipmentsRouter.post('/:id/retry-awb', authService_1.requireAuth, async (req, res) => {
    try {
        const existingShipment = await shipments_service_1.shipmentsService.findById(req.params.id);
        if (!existingShipment) {
            return res.status(404).json({ success: false, error: 'Shipment not found' });
        }
        const isStaff = await (0, authService_1.hasAnyRole)(req, ['admin', 'warehouse', 'operations']);
        if (!isStaff && existingShipment.userId !== req.user?.sub) {
            return res.status(403).json({ success: false, error: 'You do not have permission to retry AWB for this shipment' });
        }
        const updated = await shipments_service_1.shipmentsService.retryAWBGeneration(req.params.id);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Error retrying AWB generation:', error);
        res.status(500).json({ success: false, error: 'Failed to retry AWB generation' });
    }
});
// Health check endpoint
exports.shipmentsRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
