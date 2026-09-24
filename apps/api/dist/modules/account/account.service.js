"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
// src/modules/account/account.service.ts
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Service ──────────────────────────────────────────────────────────────────
class AccountService {
    async createQuotation(input) {
        const { clientId, lineItems, validUntil, notes, createdBy } = input;
        const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        const client = await prisma_1.default.client.findUnique({ where: { id: clientId } });
        const needsApproval = client?.approvalThreshold != null &&
            total > client.approvalThreshold;
        const quotation = await prisma_1.default.quotation.create({
            data: {
                clientId,
                quotationNumber: this.generateQuotationNumber(),
                validUntil: new Date(validUntil),
                notes,
                status: (needsApproval ? 'pending_approval' : 'draft'),
                version: 1,
                subtotal,
                tax,
                total,
                createdBy,
                lineItems: {
                    create: lineItems.map((item) => ({
                        serviceType: item.serviceType,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                    })),
                },
            },
        });
        if (needsApproval) {
            await this.createApprovalChain(quotation.id, total);
        }
        return quotation;
    }
    generateQuotationNumber() {
        const year = new Date().getFullYear();
        const rand = Math.floor(Math.random() * 90000) + 10000;
        return `QUO-${year}-${rand}`;
    }
    async createApprovalChain(quotationId, total) {
        const levels = ['manager'];
        if (total > 1000000)
            levels.push('director', 'finance');
        else if (total > 500000)
            levels.push('director');
        const approverId = await this.getDefaultApproverId();
        await Promise.all(levels.map(level => prisma_1.default.quotationApproval.create({
            data: {
                quotationId,
                level: level,
                approverId,
                status: 'PENDING',
            },
        })));
    }
    async getDefaultApproverId() {
        const admin = await prisma_1.default.user.findFirst({ where: { role: 'admin' } });
        return admin?.id ?? 'system';
    }
}
exports.AccountService = AccountService;
