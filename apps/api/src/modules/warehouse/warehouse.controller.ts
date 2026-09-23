import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/catchAsync';
import * as warehouseService from './warehouse.service';

/**
 * Warehouse controller — thin HTTP layer over warehouse.service (Prisma-backed).
 */

// GET /api/warehouse/dashboard — aggregated dashboard payload
export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const data = await warehouseService.getWarehouseDashboard();
  res.json({ success: true, data });
});

// GET /api/warehouse/inventory
export const getInventoryItems = catchAsync(async (_req: Request, res: Response) => {
  const data = await warehouseService.listInventory();
  res.json({ success: true, data });
});

// POST /api/warehouse/inventory
export const createInventoryItem = catchAsync(async (req: Request, res: Response) => {
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
export const updateInventoryItem = catchAsync(async (req: Request, res: Response) => {
  const { sku, name, description, quantity, location } = req.body ?? {};
  const patch: Record<string, unknown> = {};
  if (sku !== undefined) patch.sku = String(sku);
  if (name !== undefined) patch.name = String(name);
  if (description !== undefined) patch.description = String(description);
  if (location !== undefined) patch.location = String(location);
  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      res.status(400).json({ success: false, message: 'quantity must be a non-negative integer' });
      return;
    }
    patch.quantity = qty;
  }
  const data = await warehouseService.updateInventoryItem(String(req.params.id), patch as any);
  res.json({ success: true, data });
});

// DELETE /api/warehouse/inventory/:id
export const deleteInventoryItem = catchAsync(async (req: Request, res: Response) => {
  await warehouseService.deleteInventoryItem(String(req.params.id));
  res.json({ success: true, message: 'Inventory item deleted' });
});

// POST /api/warehouse/scan  { code, location? }
export const scanItem = catchAsync(async (req: Request, res: Response) => {
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

export const createWarehouse = (_req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

export const getWarehouses = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [] });
};

export const getWarehouseById = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Warehouse not found' });
};

export const generateBarcode = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { barcode: 'TESTBARCODE' } });
};
