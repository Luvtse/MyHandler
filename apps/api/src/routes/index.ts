import { Router } from 'express';
import { apiRouter } from '../services/apiService';

const mainRouter = Router();
mainRouter.use('/api', apiRouter);

export { mainRouter };
