import { Router } from 'express';
import { reportController } from './report.controller';
import { requireAuth } from '../../services/authService';

export const reportRouter = Router();

// Apply auth middleware to all routes
reportRouter.use(requireAuth);

// Report generation routes
reportRouter.post('/generate', reportController.generateReport);
reportRouter.get('/available', reportController.getAvailableReports);
reportRouter.get('/metadata', reportController.getReportMetadata);