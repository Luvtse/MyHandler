"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = audit;
const prisma_1 = __importDefault(require("../utils/prisma"));
/**
 * Records an audit event.  Fire-and-forget – errors are logged but never thrown,
 * so they never affect the calling request.
 */
async function audit(params) {
    try {
        const userId = params.req.user?.sub ??
            params.req.user?.id ??
            params.req.user?.userId;
        if (!userId)
            return; // unauthenticated request – skip
        await prisma_1.default.auditLog.create({
            data: {
                userId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId ?? null,
                changes: params.changes ?? null,
                ipAddress: params.req.ip ?? null,
                userAgent: params.req.get('user-agent') ?? null,
            },
        });
    }
    catch (err) {
        // Never let audit failures break the main request
        console.error('[AuditLog] Failed to write audit record:', err);
    }
}
