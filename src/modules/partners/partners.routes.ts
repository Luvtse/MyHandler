import express from 'express';
import { requireAuth } from '../../services/authService';
import * as partnersController from './partners.controller';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Partner management routes
router.post('/register', partnersController.registerPartner);
router.get('/', partnersController.getPartners);
router.get('/:id', partnersController.getPartnerById);
router.put('/:id', partnersController.updatePartner);
router.post('/:id/regenerate-credentials', partnersController.regenerateApiCredentials);

// E-commerce integration routes
router.post('/:partnerId/ecommerce/sync', partnersController.syncEcommerceOrders);

// Customs integration routes
router.post('/shipments/:shipmentId/customs', partnersController.submitCustomsDeclaration);

export default router;