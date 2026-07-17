// src/modules/executive/executive.controller.ts
import { Request, Response } from 'express';
import { logger } from '/utils/logger'; // adjust path as needed
import { fetchCmoIntegratedData } from './executive.service';

export const getCmoIntegratedData = async (req: Request, res: Response) => {
  try {
    const data = await fetchCmoIntegratedData();
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('CMO: Integrated data fetch failed', { error });
    return res.status(500).json({ success: false, message: 'Failed to load integrated data' });
  }
};