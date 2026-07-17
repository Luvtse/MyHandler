import express from 'express';
import { requireAuth } from '../../services/authService';
import * as warehouseController from './warehouse.controller';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Warehouse routes
router.post('/warehouses', warehouseController.createWarehouse);
router.get('/warehouses', warehouseController.getWarehouses);
router.get('/warehouses/:id', warehouseController.getWarehouseById);

// Inventory routes
router.post('/inventory', warehouseController.createInventoryItem);
router.get('/inventory', warehouseController.getInventoryItems);
router.post('/inventory/:id/action', warehouseController.updateInventory);

// Barcode and RFID routes
router.post('/scan', warehouseController.scanItem);
router.post('/inventory/:itemId/barcode', warehouseController.generateBarcode);

export default router;