import { Request, Response } from 'express';

export const registerPartner = (_req: Request, res: Response) => {
  res.status(201).json({ message: 'Partner registered (stub)' });
};

export const getPartners = (_req: Request, res: Response) => {
  res.status(200).json([]);
};

export const getPartnerById = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Partner not found' });
};

export const updatePartner = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Partner updated (stub)' });
};

export const regenerateApiCredentials = (_req: Request, res: Response) => {
  res.status(200).json({ apiKey: 'TEST_KEY', secret: 'TEST_SECRET' });
};

export const syncEcommerceOrders = (_req: Request, res: Response) => {
  res.status(202).json({ message: 'Sync initiated (stub)' });
};

export const submitCustomsDeclaration = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Customs submitted (stub)' });
};