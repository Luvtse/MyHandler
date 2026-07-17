// src/services/account.service.ts
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
export class AccountService {
  async createQuotation(input: CreateQuotationInput) {
    const { clientId, lineItems, validUntil, notes, createdBy } = input;
    
    // Calculate total
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    // Get client to check approval threshold
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const needsApproval = client?.approvalThreshold != null && total > client.approvalThreshold;

    const quotation = await prisma.quotation.create({
      data: {
        clientId,
        quotationNumber: this.generateQuotationNumber(),
        validUntil: new Date(validUntil),
        notes,
        status: needsApproval ? 'pending_approval' : 'draft',
        version: 1,
        subtotal,
        tax,
        total,
        createdBy,
        lineItems: {
// src/services/account.service.ts
          create: lineItems.map((item: LineItemInput) => ({
            serviceType: item.serviceType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      }
    });

    // If needs approval, create approval records
    if (needsApproval) {
      await this.createApprovalChain(quotation.id, total);
    }

    return quotation;
  }

  private async createApprovalChain(quotationId: string, total: number) {
    // Example: >500k → manager + director; >1M → + finance
    const levels: ApprovalLevel[] = ['manager'];
    if (total > 1_000_000) levels.push('director', 'finance');
    else if (total > 500_000) levels.push('director');

    await Promise.all(levels.map(level => 
      prisma.quotationApproval.create({
        data: {
          quotationId,
          level,
          approverId: this.getApproverForLevel(level), // implement based on your org structure
          status: 'pending',
        }
      })
    ));
  }
}