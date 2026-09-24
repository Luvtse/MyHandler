"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.documentsService = {
    async findByShipment(shipmentId) {
        return prisma_1.default.document.findMany({
            where: { shipmentId }
        });
    },
    async findByUser(userId) {
        return prisma_1.default.document.findMany({
            where: { userId }
        });
    },
    async create(data) {
        return prisma_1.default.document.create({
            data: {
                name: data.name,
                type: data.type,
                size: data.size,
                url: data.url,
                userId: data.userId,
                shipmentId: data.shipmentId
            }
        });
    },
    async delete(id) {
        return prisma_1.default.document.delete({
            where: { id }
        });
    },
    async findById(id) {
        return prisma_1.default.document.findUnique({
            where: { id }
        });
    }
};
