"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const authService_1 = require("../../services/authService");
exports.reportRouter = (0, express_1.Router)();
// Apply auth middleware to all routes
exports.reportRouter.use(authService_1.requireAuth);
// Report generation routes
exports.reportRouter.post('/generate', report_controller_1.reportController.generateReport);
exports.reportRouter.get('/available', report_controller_1.reportController.getAvailableReports);
exports.reportRouter.get('/metadata', report_controller_1.reportController.getReportMetadata);
