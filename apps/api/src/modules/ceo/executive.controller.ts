import { Request, Response } from 'express';
import { getCeoMetricsService } from './executive.service';
import { logger } from '../utils/logger';

export const getCeoMetricsHandler = async (req: Request, res: Response) => {
  try {
    const data = await getCeoMetricsService();
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('CEO: Metrics fetch failed', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to load strategic data',
    });
  }
};