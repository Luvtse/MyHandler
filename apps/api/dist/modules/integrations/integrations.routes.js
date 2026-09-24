"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationsRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
exports.integrationsRouter = (0, express_1.Router)();
exports.integrationsRouter.use(authService_1.requireAuth);
exports.integrationsRouter.get('/health', async (_req, res) => {
    res.json({ integrations: ['shopify', 'woocommerce', 'xero', 'quickbooks'], status: 'ready' });
});
