"use strict";
// services/awbGenerationService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awbGenerationService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.awbGenerationService = {
    async generateNextAwb(tx) {
        try {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2); // e.g., "25"
            const sequence = await this.getNextSequence(tx);
            return `ANU${year}${sequence}`; // 13 chars: ANU + 2 + 8
        }
        catch (error) {
            console.error('AWB generation failed:', error);
            throw new Error('Failed to generate AWB number');
        }
    },
    async getNextSequence(tx) {
        const now = new Date();
        const sequenceKey = `awb_${now.getFullYear()}`;
        const sequence = await tx.sequence.upsert({
            where: { key: sequenceKey },
            update: {
                value: { increment: 1 },
                updatedAt: new Date(),
            },
            create: {
                key: sequenceKey,
                value: 1,
            },
        });
        return String(sequence.value).padStart(8, '0'); // ensures 8 digits
    },
    // Optional: if you ever want internal checksum, keep this private
    // But do NOT include in displayed AWB
    calculateChecksum(awbBase) {
        let sum = 0;
        const digits = awbBase.replace(/\D/g, '');
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i], 10);
            sum += digit * (i % 2 === 0 ? 1 : 3);
        }
        const checksum = (10 - (sum % 10)) % 10;
        return checksum.toString();
    },
    validateAWB(awb) {
        const awbRegex = /^ANU\d{10}$/; // 13 chars
        if (!awbRegex.test(awb)) {
            return {
                isValid: false,
                error: 'AWB must be in format ANUYYXXXXXXXX (13 characters)',
            };
        }
        return { isValid: true };
    },
    async getAWBStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalCount, monthlyCount, lastShipment] = await Promise.all([
            prisma_1.default.shipment.count(),
            prisma_1.default.shipment.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma_1.default.shipment.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
        ]);
        const successRate = await this.calculateSuccessRate();
        return {
            totalGenerated: totalCount,
            monthlyCount,
            successRate,
            lastGeneration: lastShipment?.createdAt || null,
        };
    },
    async calculateSuccessRate() {
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        const [successCount, totalAttempts] = await Promise.all([
            prisma_1.default.shipment.count({
                where: {
                    createdAt: { gte: lastHour },
                    NOT: { reference: { startsWith: 'DRAFT-' } },
                },
            }),
            prisma_1.default.shipment.count({
                where: {
                    createdAt: { gte: lastHour },
                },
            }),
        ]);
        return totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 100;
    },
};
