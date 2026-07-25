// src/modules/account/account.service.ts
import prisma from '../../utils/prisma';

// ─── Local types ──────────────────────────────────────────────────────────────

interface LineItemInput {
  serviceType: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateQuotationInput {
  clientId: string;
  lineItems: LineItemInput[];
  validUntil: string;
  notes?: string;
  createdBy: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AccountService {
  async createQuotation(input: CreateQuotationInput) {
    const { clientId, lineItems, validUntil, notes, createdBy } = input;

    const subtotal = lineItems.reduce(
      (sum: number, item: LineItemInput) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    const needsApproval =
      (client as any)?.approvalThreshold != null &&
      total > (client as any).approvalThreshold;

    const quotation = await prisma.quotation.create({
      data: {
        clientId,
        quotationNumber: this.generateQuotationNumber(),
        validUntil: new Date(validUntil),
        notes,
        status: (needsApproval ? 'pending_approval' : 'draft') as any,
        version: 1,
        subtotal,
        tax,
        total,
        createdBy,
        lineItems: {
          create: lineItems.map((item: LineItemInput) => ({
            serviceType: item.serviceType as any,
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

  private generateQuotationNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 90000) + 10000;
    return `QUO-${year}-${rand}`;
  }

  private async createApprovalChain(quotationId: string, total: number) {
    const levels: string[] = ['manager'];
    if (total > 1_000_000) levels.push('director', 'finance');
    else if (total > 500_000) levels.push('director');

    const approverId = await this.getDefaultApproverId();

    await Promise.all(
      levels.map(level =>
        (prisma as any).quotationApproval.create({
          data: {
            quotationId,
            level: level as any,
            approverId,
            status: 'PENDING',
          },
        }),
      ),
    );
  }

  private async getDefaultApproverId(): Promise<string> {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    return admin?.id ?? 'system';
  }
}
