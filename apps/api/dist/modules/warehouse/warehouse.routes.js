"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../../services/authService");
const warehouseController = __importStar(require("./warehouse.controller"));
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authService_1.requireAuth);
// Role gating: warehouse data is restricted to warehouse staff, fleet
// managers, operations, regional managers and admins (mirrors ops/executive pattern).
router.use((0, authService_1.requireRole)(['admin', 'warehouse', 'fleet_manager', 'operations', 'regional_manager']));
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
exports.default = router;
