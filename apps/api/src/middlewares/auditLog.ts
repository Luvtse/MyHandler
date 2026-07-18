import { Request } from 'express';
import prisma from '../utils/prisma';

export interface AuditParams {
  req: Request;
  action: string;   // e.g. CREATE, UPDATE, DELETE, LOGIN, STATUS_CHANGE
  entity: string;   // e.g. Shipment, Invoice, User
  entityId?: string;
  changes?: Record<string, any>;
}

/**
 * Records an audit event.  Fire-and-forget – errors are logged but never thrown,
 * so they never affect the calling request.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    const userId: string | undefined =
      (params.req as any).user?.sub ??
      (params.req as any).user?.id ??
      (params.req as any).user?.userId;

    if (!userId) return; // unauthenticated request – skip

    await (prisma as any).auditLog.create({
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
  } catch (err) {
    // Never let audit failures break the main request
    console.error('[AuditLog] Failed to write audit record:', err);
  }
}
