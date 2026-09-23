import express from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import * as warehouseController from './warehouse.controller';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);
// Role gating: warehouse data is restricted to warehouse staff, fleet
// managers, operations, regional managers and admins (mirrors ops/executive pattern).
router.use(requireRole(['admin', 'warehouse', 'fleet_manager', 'operations', 'regional_manager']));

// Dashboard aggregate (inventory + equipment + storage + shipment counts)
router.get('/dashboard', warehouseController.getDashboard);

// Warehouse routes
router.post('/warehouses', warehouseController.createWarehouse);
router.get('/warehouses', warehouseController.getWarehouses);
router.get('/warehouses/:id', warehouseController.getWarehouseById);

// Inventory routes
router.post('/inventory', warehouseController.createInventoryItem);
router.get('/inventory', warehouseController.getInventoryItems);
router.patch('/inventory/:id', warehouseController.updateInventoryItem);
router.delete('/inventory/:id', warehouseController.deleteInventoryItem);
router.post('/inventory/:id/action', warehouseController.updateInventoryItem);

// Barcode and RFID routes
router.post('/scan', warehouseController.scanItem);
router.post('/inventory/:itemId/barcode', warehouseController.generateBarcode);

export default router;
