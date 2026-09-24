"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnsRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const authService_1 = require("../../services/authService");
exports.returnsRouter = (0, express_1.Router)();
exports.returnsRouter.use(authService_1.requireAuth);
exports.returnsRouter.get('/', async (_req, res) => {
    const returns = await prisma_1.default.return.findMany();
    res.json({ returns });
});
exports.returnsRouter.post('/', async (req, res) => {
    const { orderId, reason, status } = req.body;
    const ret = await prisma_1.default.return.create({ data: { orderId, reason, status } });
    res.status(201).json({ return: ret });
});
