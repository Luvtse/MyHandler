import { Request, Response } from 'express';
import crypto from 'crypto';

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

// Generates cryptographically random credentials instead of returning the
// previous hardcoded TEST_KEY/TEST_SECRET placeholders. NOTE: persistence is
// still a stub until partners are stored in the DB — the secret is shown once
// and must be stored hashed server-side when real storage lands.
export const regenerateApiCredentials = (_req: Request, res: Response) => {
  const apiKey = `ah_${crypto.randomBytes(16).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  res.status(200).json({ apiKey, secret });
};

export const syncEcommerceOrders = (_req: Request, res: Response) => {
  res.status(202).json({ message: 'Sync initiated (stub)' });
};

export const submitCustomsDeclaration = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Customs submitted (stub)' });
};