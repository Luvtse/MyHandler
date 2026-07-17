import { Request, Response } from 'express';
import { authenticate, authorizeRole } from './middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { FleetService } from '@/fleet-manager/fleet.service';
import { CreateMaintenanceDto, UpdateVehicleDto } from '@/dtos/fleet.dto';
import { logger } from '@/utils/logger';

const fleetService = new FleetService();

// POST /api/fleet/maintenance/:id/sync-google
export const syncToGoogleCalendar = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const record = await fleetService.getMaintenanceById(id);
      
      // Use your OAuth service
      const calendarService = req.user?.calendarService || new CalendarService();
      await calendarService.syncToGoogle({
        title: `Maintenance: ${record.vehiclePlate}`,
        start: record.scheduledAt,
        end: new Date(record.scheduledAt.getTime() + 2*3600*1000),
        description: record.notes,
        accessToken: req.user?.googleCalendarToken, // stored securely
      });

      res.json({ success: true, message: 'Synced to Google Calendar' });
    } catch (error) {
      logger.error('Calendar sync failed', { error, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Sync failed' });
    }
  }

];
// GET /api/fleet/vehicles
export const getVehicles = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const vehicles = await fleetService.getAllVehicles();
      res.json({ success: true, data: { vehicles } });
    } catch (error) {
      logger.error('Fleet: Failed to fetch vehicles', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to load vehicles' });
    }
  }
];

// GET /api/fleet/metrics
export const getFleetMetrics = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const metrics = await fleetService.getFleetMetrics();
      res.json({ success: true, data: { metrics } });
    } catch (error) {
      logger.error('Fleet: Failed to fetch metrics', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to load metrics' });
    }
  }
];

// GET /api/fleet/vehicles/:id
export const getVehicleById = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vehicle = await fleetService.getVehicleWithHistory(id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      res.json({ success: true, data: { vehicle } });
    } catch (error) {
      logger.error('Fleet: Failed to fetch vehicle', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to load vehicle details' });
    }
  }
];

// POST /api/fleet/maintenance
export const scheduleMaintenance = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  validate(CreateMaintenanceDto),
  async (req: Request, res: Response) => {
    try {
      const { vehicleId, type, scheduledAt, mileageAtService, notes, vendor, estimatedCost } = req.body;
      
      const record = await fleetService.scheduleMaintenance({
        vehicleId,
        type,
        scheduledAt: new Date(scheduledAt),
        mileage: mileageAtService,
        notes,
        vendor,
        estimatedCost,
        createdBy: req.user!.id,
      });

      // 📝 Audit log
      logger.info('Fleet: Maintenance scheduled', {
        maintenanceId: record.id,
        vehicleId,
        userId: req.user!.id,
      });

      res.status(201).json({ success: true, data: { record } });
    } catch (error) {
      logger.error('Fleet: Failed to schedule maintenance', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to schedule maintenance' });
    }
  }
];

// GET /api/fleet/maintenance/calendar
export const getMaintenanceCalendarEvents = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const { start, end } = req.query; // ISO strings
      const events = await fleetService.getMaintenanceEvents(
        start ? new Date(start as string) : undefined,
        end ? new Date(end as string) : undefined
      );
      res.json({ success: true, data: { events } });
    } catch (error) {
      logger.error('Fleet: Failed to fetch calendar events', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to load schedule' });
    }
  }
];

// GET /api/fleet/vehicles/:id/maintenance-pdf-data
// Used by frontend PDF generator (sends structured data)
export const getMaintenancePdfData = [
  authenticate,
  authorizeRole(['admin', 'fleet_manager']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await fleetService.getVehicleForPdf(id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      res.json({ success: true, data });
    } catch (error) {
      logger.error('Fleet: Failed to fetch PDF data', { error, userId: req.user?.id, vehicleId: req.params.id });
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
];