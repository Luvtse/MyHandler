"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const authService_1 = require("../../services/authService");
exports.trackingRouter = (0, express_1.Router)();
exports.trackingRouter.use(authService_1.requireAuth);
// List tracking events by shipment
exports.trackingRouter.get('/', async (req, res) => {
    const { shipmentId } = req.query;
    if (!shipmentId)
        return res.status(400).json({ error: 'shipmentId is required' });
    const events = await prisma_1.default.trackingEvent.findMany({
        where: { shipmentId },
        orderBy: { eventTime: 'desc' },
    });
    res.json({ events });
});
// Add tracking event to shipment (owner or admin)
exports.trackingRouter.post('/', async (req, res) => {
    const user = req.user;
    const { shipmentId, status, location, description, eventTime } = req.body;
    if (!shipmentId || !status)
        return res.status(400).json({ error: 'shipmentId and status are required' });
    const shipment = await prisma_1.default.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment)
        return res.status(404).json({ error: 'Shipment not found' });
    if (shipment.userId !== user.sub && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const toEnum = (s) => {
        const key = String(s || '').trim().toUpperCase().replace(/-/g, '_');
        return client_1.ShipmentStatus[key] ?? client_1.ShipmentStatus.IN_TRANSIT_TO_DESTINATION;
    };
    const event = await prisma_1.default.trackingEvent.create({
        data: {
            shipmentId,
            status: toEnum(status),
            location,
            description,
            eventTime: eventTime ? new Date(eventTime) : new Date(),
        },
    });
    res.status(201).json({ event });
});
// Delete tracking event (owner or admin)
exports.trackingRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const existing = await prisma_1.default.trackingEvent.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: 'Tracking event not found' });
    const shipment = await prisma_1.default.shipment.findUnique({ where: { id: existing.shipmentId } });
    if (!shipment)
        return res.status(404).json({ error: 'Shipment not found' });
    if (shipment.userId !== user.sub && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma_1.default.trackingEvent.delete({ where: { id } });
    res.status(204).send();
});
