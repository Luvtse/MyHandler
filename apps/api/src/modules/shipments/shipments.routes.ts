import { Router } from 'express';
import { shipmentsService } from './shipments.service';
import { etaService } from './eta.service';
import { requireAuth, requireAnyRole, hasAnyRole } from '../../services/authService';
import prisma from '../../utils/prisma';
import { emailService } from '../../services/emailService';
import { audit } from '../../middlewares/auditLog';

const DELIVERED_STATUSES = new Set(['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED', 'SIGNATURE_OBTAINED']);

export const shipmentsRouter = Router();

// GET /api/shipments - List all shipments with pagination and filters (role-based visibility)
shipmentsRouter.get('/', requireAuth, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      userId: req.query.userId as string,
      status: req.query.status as string,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      paymentType: req.query.paymentType as string,
    };

    // Get user info from authenticated request
    const userRole = req.user?.role;
    const userId = req.user?.sub; // sub contains the user ID from JWT

    const result = await shipmentsService.findAll(page, limit, filters, userRole, userId);
    res.json({
      success: true,
      data: result.shipments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipments'
    });
  }
});

// Airports and flight schedules management routes are defined below with full CRUD implementations.

shipmentsRouter.get('/airports', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.airport.findMany({ orderBy: { city: 'asc' } });
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load airports' });
  }
});

shipmentsRouter.get('/flight-schedules', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.flightSchedule.findMany({ orderBy: [{ originCity: 'asc' }, { destinationCity: 'asc' }] });
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load flight schedules' });
  }
});

// GET /api/shipments/:id - Get shipment by ID
shipmentsRouter.get('/:id', requireAuth, async (req: any, res) => {
  try {
    const shipment = await shipmentsService.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Staff roles (incl. DB secondary roles) may view any shipment; others must own it.
    const canViewAllShipments = await hasAnyRole(req, ['admin', 'finance', 'report', 'warehouse', 'operations']);
    
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
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipment'
    });
  }
});

// POST /api/shipments - Create new shipment
shipmentsRouter.post('/', requireAuth, async (req: any, res) => {
  try {
    const rawPt = req.body?.paymentType;
    const ptUpper = rawPt ? String(rawPt).toUpperCase() : '';
    if (!ptUpper || !['PREPAID','COLLECT','ACCOUNT'].includes(ptUpper)) {
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
    
    const shipment = await shipmentsService.create(shipmentData);

    // Fire-and-forget: email notification + audit log
    const userId: string = shipmentData.userId ?? '';
    if (userId) {
      emailService.sendNotificationEmail(userId, 'SHIPMENT_CREATED', {
        reference: (shipment as any).reference ?? (shipment as any).id,
        origin: (shipment as any).originAddress ?? req.body.originAddress,
        destination: (shipment as any).destinationAddress ?? req.body.destinationAddress,
        serviceType: (shipment as any).serviceLevel ?? req.body.serviceLevel,
      }).catch(err => console.error('[Shipment email] create:', err));

      audit({ req, action: 'CREATE', entity: 'Shipment', entityId: (shipment as any).id }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shipment'
    });
  }
});

// PUT /api/shipments/:id - Update shipment
shipmentsRouter.put('/:id', requireAuth, async (req: any, res) => {
  try {
    // First check if user can access this shipment
    const existingShipment = await shipmentsService.findById(req.params.id);
    if (!existingShipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Staff roles (incl. DB secondary roles) may update any shipment; owners may update their own.
    const canUpdateAllShipments = await hasAnyRole(req, ['admin', 'warehouse', 'operations']);
    
    if (!canUpdateAllShipments && existingShipment.userId !== req.user?.sub) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this shipment'
      });
    }

    const shipment = await shipmentsService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shipment'
    });
  }
});

// DELETE /api/shipments/:id - Delete shipment
shipmentsRouter.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    // First check if user can access this shipment
    const existingShipment = await shipmentsService.findById(req.params.id);
    if (!existingShipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Deletion is admin-only (secondary admin role counts); owners cannot delete shipments.
    const canDelete = await hasAnyRole(req, ['admin']);
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this shipment'
      });
    }

    await shipmentsService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete shipment'
    });
  }
});

// GET /api/shipments/track/:awb - Track shipment by AWB number
// Public: Track shipment by AWB number (no auth)
shipmentsRouter.get('/track/:awb', async (req: any, res) => {
  try {
    const shipment = await shipmentsService.findByAwb(req.params.awb);
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
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track shipment'
    });
  }
});

// GET /api/shipments/:id/eta - Authoritative ETA based on server shipment status
shipmentsRouter.get('/:id/eta', requireAuth, async (req: any, res) => {
  try {
    const shipment = await shipmentsService.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    const canViewAll = await hasAnyRole(req, ['admin', 'finance', 'report', 'warehouse', 'operations']);
    if (!canViewAll && shipment.userId !== req.user?.sub) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const originCity = String((shipment as any).originCity || '').trim();
    const destinationCity = String((shipment as any).destinationCity || '').trim();
    const dropoffTime = new Date(shipment.createdAt).toISOString();
    const serviceLevel = String((shipment as any).serviceLevel || 'standard');
    const currentStatus = String(shipment.status || '');
    const result = await etaService.calculateETA({
      originCode: (shipment as any).originAirportCode,
      destinationCode: (shipment as any).destinationAirportCode,
      originCity: originCity || undefined,
      destinationCity: destinationCity || undefined,
      serviceLevel,
      dropoffTime,
      currentStatus,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate ETA' });
  }
});

// POST /api/shipments/eta/calculate
shipmentsRouter.post('/eta/calculate', async (req: any, res) => {
  try {
    const result = await etaService.calculateETA({
      originCode: req.body.originCode ? String(req.body.originCode) : undefined,
      destinationCode: req.body.destinationCode ? String(req.body.destinationCode) : undefined,
      originCity: req.body.originCity ? String(req.body.originCity) : undefined,
      destinationCity: req.body.destinationCity ? String(req.body.destinationCity) : undefined,
      serviceLevel: String(req.body.serviceLevel || ''),
      dropoffTime: String(req.body.dropoffTime || new Date().toISOString()),
      currentStatus: req.body.currentStatus ? String(req.body.currentStatus) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate ETA' });
  }
});

// GET /api/shipments/eta/availability
shipmentsRouter.get('/eta/availability', async (req: any, res) => {
  try {
    const result = await etaService.availability({
      originCode: req.query.originCode ? String(req.query.originCode) : undefined,
      destinationCode: req.query.destinationCode ? String(req.query.destinationCode) : undefined,
      originCity: req.query.originCity ? String(req.query.originCity) : undefined,
      destinationCity: req.query.destinationCity ? String(req.query.destinationCity) : undefined,
      date: String(req.query.date || new Date().toISOString()),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get availability' });
  }
});

// Airports management (admin only)
shipmentsRouter.get('/airports', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.airport.findMany({ orderBy: { city: 'asc' } });
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to load airports' }); }
});

shipmentsRouter.post('/airports', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const created = await prisma.airport.create({ data: req.body });
    res.status(201).json({ success: true, data: created });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to create airport' }); }
});

shipmentsRouter.put('/airports/:code', requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.airport.update({ where: { code: req.params.code }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to update airport' }); }
});

shipmentsRouter.delete('/airports/:code', requireAuth, async (req: any, res) => {
  try {
    await prisma.airport.delete({ where: { code: req.params.code } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to delete airport' }); }
});

// Flight schedules management (admin only)
shipmentsRouter.get('/flight-schedules', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.flightSchedule.findMany({ orderBy: [{ originCity: 'asc' }, { destinationCity: 'asc' }] });
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to load flight schedules' }); }
});

// Service Level Settings management (admin)
shipmentsRouter.get('/service-level-settings', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.serviceLevelSettings.findMany();
    res.json({ success: true, data: rows });
  } catch { res.status(500).json({ success: false, error: 'Failed to load settings' }); }
});

shipmentsRouter.post('/service-level-settings', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const created = await prisma.serviceLevelSettings.create({ data: req.body });
    res.status(201).json({ success: true, data: created });
  } catch { res.status(500).json({ success: false, error: 'Failed to create setting' }); }
});

shipmentsRouter.put('/service-level-settings/:id', requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.serviceLevelSettings.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch { res.status(500).json({ success: false, error: 'Failed to update setting' }); }
});

shipmentsRouter.delete('/service-level-settings/:id', requireAuth, async (req: any, res) => {
  try {
    await prisma.serviceLevelSettings.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Failed to delete setting' }); }
});

// Operating calendar management (admin)
shipmentsRouter.get('/operating-calendar', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const rows = await prisma.operatingCalendar.findMany({ orderBy: { date: 'asc' } });
    res.json({ success: true, data: rows });
  } catch { res.status(500).json({ success: false, error: 'Failed to load calendar' }); }
});

shipmentsRouter.post('/operating-calendar', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const created = await prisma.operatingCalendar.create({ data: req.body });
    res.status(201).json({ success: true, data: created });
  } catch { res.status(500).json({ success: false, error: 'Failed to create calendar entry' }); }
});

shipmentsRouter.delete('/operating-calendar/:id', requireAuth, async (req: any, res) => {
  try {
    await prisma.operatingCalendar.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Failed to delete calendar entry' }); }
});

// Bulk schedules upload (admin)
shipmentsRouter.post('/flight-schedules/bulk', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.length) return res.status(400).json({ success: false, error: 'No schedules provided' });
    await prisma.flightSchedule.createMany({ data: items });
    res.status(201).json({ success: true, count: items.length });
  } catch { res.status(500).json({ success: false, error: 'Failed to upload schedules' }); }
});

shipmentsRouter.post('/flight-schedules', requireAuth, requireAnyRole(['admin', 'warehouse']), async (req: any, res) => {
  try {
    const created = await prisma.flightSchedule.create({ data: req.body });
    res.status(201).json({ success: true, data: created });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to create flight schedule' }); }
});

shipmentsRouter.put('/flight-schedules/:id', requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.flightSchedule.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to update flight schedule' }); }
});

shipmentsRouter.delete('/flight-schedules/:id', requireAuth, async (req: any, res) => {
  try {
    await prisma.flightSchedule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: 'Failed to delete flight schedule' }); }
});

// POST /api/shipments/:id/tracking-events - Add tracking event
shipmentsRouter.post('/:id/tracking-events', requireAuth, async (req: any, res) => {
  try {
    // Check if user can access this shipment
    const existingShipment = await shipmentsService.findById(req.params.id);
    if (!existingShipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Allow staff roles (incl. DB secondary roles) or the shipment owner
    const canUpdateAllShipments = await hasAnyRole(req, ['admin', 'warehouse', 'driver', 'operations']);
    
    if (!canUpdateAllShipments && existingShipment.userId !== req.user?.sub) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to add tracking events to this shipment'
      });
    }

    const event = await shipmentsService.addTrackingEvent(req.params.id, req.body);

    // If this tracking event marks the shipment as delivered, send notification
    if (DELIVERED_STATUSES.has(req.body?.status ?? '')) {
      const shipment: any = existingShipment;
      if (shipment?.userId) {
        emailService.sendNotificationEmail(shipment.userId, 'SHIPMENT_DELIVERED', {
          reference: shipment.reference ?? shipment.id,
          destination: shipment.destinationAddress,
          deliveredAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        }).catch(err => console.error('[Shipment email] delivered:', err));

        audit({ req, action: 'STATUS_CHANGE', entity: 'Shipment', entityId: req.params.id, changes: { status: req.body.status } }).catch(() => {});
      }
    }

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error adding tracking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add tracking event'
    });
  }
});

// POST /api/shipments/:id/schedule-pickup - Schedule pickup
shipmentsRouter.post('/:id/schedule-pickup', requireAuth, async (req: any, res) => {
  try {
    // Check if user can access this shipment
    const existingShipment = await shipmentsService.findById(req.params.id);
    if (!existingShipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // Authorization: staff roles (incl. DB secondary roles) may act on any
    // shipment; everyone else must own it.
    const isStaff = await hasAnyRole(req, ['admin', 'warehouse', 'operations']);

    if (!isStaff && existingShipment.userId !== req.user?.sub) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to schedule pickup for this shipment'
      });
    }

    const event = await shipmentsService.schedulePickup(req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule pickup'
    });
  }
});

// POST /api/shipments/:id/retry-awb - Retry AWB generation for temporary AWBs
shipmentsRouter.post('/:id/retry-awb', requireAuth, async (req: any, res) => {
  try {
    const existingShipment = await shipmentsService.findById(req.params.id);
    if (!existingShipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    const isStaff = await hasAnyRole(req, ['admin', 'warehouse', 'operations']);

    if (!isStaff && existingShipment.userId !== req.user?.sub) {
      return res.status(403).json({ success: false, error: 'You do not have permission to retry AWB for this shipment' });
    }

    const updated = await shipmentsService.retryAWBGeneration(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error retrying AWB generation:', error);
    res.status(500).json({ success: false, error: 'Failed to retry AWB generation' });
  }
});

// Health check endpoint
shipmentsRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
