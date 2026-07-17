import { Router } from 'express';
import * as fleetController from './fleet.controller';

const router = Router();

router.get('/vehicles', ...fleetController.getVehicles);
router.get('/metrics', ...fleetController.getFleetMetrics);
router.get('/vehicles/:id', ...fleetController.getVehicleById);
router.post('/maintenance', ...fleetController.scheduleMaintenance);
router.get('/maintenance/calendar', ...fleetController.getMaintenanceCalendarEvents);
router.get('/vehicles/:id/maintenance-pdf-data', ...fleetController.getMaintenancePdfData);

export default router;