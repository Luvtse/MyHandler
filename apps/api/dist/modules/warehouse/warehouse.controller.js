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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBarcode = exports.getWarehouseById = exports.getWarehouses = exports.createWarehouse = exports.scanItem = exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItems = exports.getDashboard = void 0;
const catchAsync_1 = require("../../middlewares/catchAsync");
const warehouseService = __importStar(require("./warehouse.service"));
/**
 * Warehouse controller — thin HTTP layer over warehouse.service (Prisma-backed).
 */
// GET /api/warehouse/dashboard — aggregated dashboard payload
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await warehouseService.getWarehouseDashboard();
    res.json({ success: true, data });
});
// GET /api/warehouse/inventory
exports.getInventoryItems = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await warehouseService.listInventory();
    res.json({ success: true, data });
});
// POST /api/warehouse/inventory
exports.createInventoryItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { sku, name, description, quantity, location } = req.body ?? {};
    if (!sku || !name || quantity == null || !location) {
        res.status(400).json({ success: false, message: 'sku, name, quantity and location are required' });
        return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
        res.status(400).json({ success: false, message: 'quantity must be a non-negative integer' });
        return;
    }
    const data = await warehouseService.createInventoryItem({
        sku: String(sku),
        name: String(name),
        description: description != null ? String(description) : undefined,
        quantity: qty,
        location: String(location),
    });
    res.status(201).json({ success: true, data });
});
// PATCH /api/warehouse/inventory/:id
exports.updateInventoryItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { sku, name, description, quantity, location } = req.body ?? {};
    const patch = {};
    if (sku !== undefined)
        patch.sku = String(sku);
    if (name !== undefined)
        patch.name = String(name);
    if (description !== undefined)
        patch.description = String(description);
    if (location !== undefined)
        patch.location = String(location);
    if (quantity !== undefined) {
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 0) {
            res.status(400).json({ success: false, message: 'quantity must be a non-negative integer' });
            return;
        }
        patch.quantity = qty;
    }
    const data = await warehouseService.updateInventoryItem(String(req.params.id), patch);
    res.json({ success: true, data });
});
// DELETE /api/warehouse/inventory/:id
exports.deleteInventoryItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await warehouseService.deleteInventoryItem(String(req.params.id));
    res.json({ success: true, message: 'Inventory item deleted' });
});
// POST /api/warehouse/scan  { code, location? }
exports.scanItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { code, barcode, qrCode, location } = req.body ?? {};
    const scanned = code ?? barcode ?? qrCode;
    const result = await warehouseService.recordScan(String(scanned ?? ''), String(location ?? ''));
    if (!result.found) {
        res.status(404).json({ success: false, message: result.message });
        return;
    }
    res.status(201).json({ success: true, data: result });
});
// ─── Legacy stubs kept for route compatibility (warehouses CRUD) ────────────
const createWarehouse = (_req, res) => {
    res.status(501).json({ success: false, message: 'Not implemented' });
};
exports.createWarehouse = createWarehouse;
const getWarehouses = (_req, res) => {
    res.status(200).json({ success: true, data: [] });
};
exports.getWarehouses = getWarehouses;
const getWarehouseById = (_req, res) => {
    res.status(404).json({ success: false, message: 'Warehouse not found' });
};
exports.getWarehouseById = getWarehouseById;
const generateBarcode = (_req, res) => {
    res.status(200).json({ success: true, data: { barcode: 'TESTBARCODE' } });
};
exports.generateBarcode = generateBarcode;
