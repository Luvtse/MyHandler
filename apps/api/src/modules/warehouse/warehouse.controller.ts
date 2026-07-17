import { Request, Response } from 'express';

export const createWarehouse = (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const getWarehouses = (_req: Request, res: Response) => {
  res.status(200).json([]);
};

export const getWarehouseById = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Warehouse not found' });
};

export const createInventoryItem = (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const getInventoryItems = (_req: Request, res: Response) => {
  res.status(200).json([]);
};

export const updateInventory = (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const scanItem = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Scan recorded' });
};

export const generateBarcode = (_req: Request, res: Response) => {
  res.status(200).json({ barcode: 'TESTBARCODE' });
};