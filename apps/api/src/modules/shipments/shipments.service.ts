import prisma from '../../utils/prisma';
import { ShipmentStatus, PaymentType } from '@prisma/client';
import { awbGenerationService } from './awbService';

// AWB Generation monitoring
const AWB_GENERATION_METRICS = {
  successes: 0,
  failures: 0,
  lastError: null as string | null
};

function validateAndConvertStatus(canonical: string): ShipmentStatus {
  const input = String(canonical || '').trim();
  const key = input.toUpperCase().replace(/-/g, '_');
  const enumValue = (ShipmentStatus as unknown as Record<string, ShipmentStatus>)[key];
  if (!enumValue) {
    throw new Error(`Invalid shipment status: "${canonical}". Valid values: ${Object.keys(ShipmentStatus).join(', ')}`);
  }
  return enumValue;
}

// Fields that may be written when creating/updating a shipment. Anything else
// in the request body (id, userId, createdAt, nested relations, etc.) is
// stripped so clients cannot inject arbitrary Prisma payload keys.
const SHIPMENT_EDITABLE_FIELDS = [
  'reference', 'originAddress', 'originCompany', 'originCity', 'originCountry',
  'destinationAddress', 'destinationCompany', 'destinationCity', 'destinationCountry',
  'weightKg', 'dimensionsCm', 'serviceLevel', 'notes', 'chargesAmount',
  'chargesCurrency', 'paymentType', 'accountNumber', 'status',
  'originAirportCode', 'destinationAirportCode',
] as const;

function pickShipmentFields(data: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!data || typeof data !== 'object') return out;
  for (const key of SHIPMENT_EDITABLE_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
}

export const shipmentsService = {
  // Resolve a shipment by database id OR by AWB reference (the frontend route
  // params carry AWBs, while some callers pass ids). Returns null if not found.
  async findByIdOrReference(idOrReference: string) {
    if (!idOrReference) return null;
    const byId = await prisma.shipment.findUnique({ where: { id: idOrReference } });
    if (byId) return byId;
    return prisma.shipment.findFirst({
      where: { reference: idOrReference },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ---- Drafts -----------------------------------------------------------
  // A draft is a Shipment row with isDraft=true and a provisional DRAFT-*
  // reference. No real AWB is allocated until the draft is finalized.

  async createDraft(userId: string, data: any) {
    const fields = pickShipmentFields(data);
    const pt = normalizePaymentType(fields.paymentType ?? data.paymentType);
    const chargesAmount = typeof fields.chargesAmount === 'number'
      ? fields.chargesAmount
      : Number(fields.chargesAmount ?? data.chargesInformation?.amount ?? 0) || 0;

    return prisma.shipment.create({
      data: {
        ...fields,
        userId,
        paymentType: pt ?? PaymentType.PREPAID,
        accountNumber: pt === PaymentType.ACCOUNT && fields.accountNumber
          ? String(fields.accountNumber).trim()
          : fields.accountNumber != null ? String(fields.accountNumber).trim() : null,
        originAddress: fields.originAddress ?? '',
        destinationAddress: fields.destinationAddress ?? '',
        weightKg: typeof fields.weightKg === 'number' ? fields.weightKg : Number(fields.weightKg ?? data.totalWeight ?? 0),
        serviceLevel: fields.serviceLevel ?? data.serviceType ?? 'standard',
        chargesAmount,
        chargesCurrency: fields.chargesCurrency ?? data.chargesInformation?.currency ?? 'USD',
        reference: `DRAFT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: ShipmentStatus.ORDER_RECEIVED,
        isDraft: true,
      },
    });
  },

  async findDraftById(id: string) {
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    return shipment && shipment.isDraft ? shipment : null;
  },

  async listDrafts(userId?: string) {
    return prisma.shipment.findMany({
      where: { isDraft: true, ...(userId ? { userId } : {}) },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async updateDraft(id: string, data: any) {
    const existing = await this.findDraftById(id);
    if (!existing) {
      const err: any = new Error('Draft not found');
      err.statusCode = 404;
      throw err;
    }
    const fields = pickShipmentFields(data);
    if (fields.paymentType) {
      const pt = normalizePaymentType(fields.paymentType);
      if (pt) fields.paymentType = pt;
    }
    return prisma.shipment.update({ where: { id }, data: fields });
  },

  async deleteDraft(id: string) {
    const existing = await this.findDraftById(id);
    if (!existing) {
      const err: any = new Error('Draft not found');
      err.statusCode = 404;
      throw err;
    }
    return prisma.shipment.delete({ where: { id } });
  },

  // Finalize a draft: allocate a real AWB, persist any last edits and mark it
  // as a live shipment. Runs inside a transaction so a failure never leaves a
  // half-finalized draft behind.
  async finalizeDraft(id: string, data: any, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const draft = await tx.shipment.findUnique({ where: { id } });
      if (!draft || !draft.isDraft) {
        const err: any = new Error('Draft not found');
        err.statusCode = 404;
        throw err;
      }
      if (userId && draft.userId !== userId) {
        const err: any = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
      }

      const awb = await awbGenerationService.generateNextAwb(tx);
      const validation = awbGenerationService.validateAWB(awb);
      if (!validation.isValid) {
        throw new Error(`Generated invalid AWB: ${validation.error}`);
      }

      const fields = pickShipmentFields(data || {});
      if (fields.paymentType) {
        const pt = normalizePaymentType(fields.paymentType);
        if (pt) fields.paymentType = pt;
      }
      if (typeof fields.status === 'string') {
        fields.status = validateAndConvertStatus(fields.status);
      } else {
        delete fields.status;
      }
      if (fields.originCity) {
        const ap = await tx.airport.findFirst({ where: { city: { equals: String(fields.originCity).trim(), mode: 'insensitive' } } });
        if (ap?.code) fields.originAirportCode = ap.code;
      }
      if (fields.destinationCity) {
        const ap = await tx.airport.findFirst({ where: { city: { equals: String(fields.destinationCity).trim(), mode: 'insensitive' } } });
        if (ap?.code) fields.destinationAirportCode = ap.code;
      }

      const updated = await tx.shipment.update({
        where: { id },
        data: {
          ...fields,
          reference: awb,
          isDraft: false,
          status: fields.status ?? ShipmentStatus.ORDER_RECEIVED,
        },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: id,
          status: updated.status,
          location: `${updated.originCity || ''}`.trim() || 'Origin',
          description: 'Shipment order received',
        },
      });

      AWB_GENERATION_METRICS.successes++;
      return updated;
    });
  },

  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      try {
        const awb = await awbGenerationService.generateNextAwb(tx);
        
        // Validate the generated AWB
        const validation = awbGenerationService.validateAWB(awb);
        if (!validation.isValid) {
          throw new Error(`Generated invalid AWB: ${validation.error}`);
        }

        // Normalize airport codes using structured city fields
        const originAirportCode = data.originCity ? (await tx.airport.findFirst({ where: { city: { equals: String(data.originCity).trim(), mode: 'insensitive' } } }))?.code : null;
        const destinationAirportCode = data.destinationCity ? (await tx.airport.findFirst({ where: { city: { equals: String(data.destinationCity).trim(), mode: 'insensitive' } } }))?.code : null;

        const pt = normalizePaymentType(data.paymentType);
        if (!pt) {
          throw new Error('paymentType is required');
        }
        if (pt === PaymentType.ACCOUNT && !data.accountNumber) {
          throw new Error('accountNumber is required when paymentType is ACCOUNT');
        }
        const statusEnum = typeof data.status === 'string'
          ? validateAndConvertStatus(data.status)
          : undefined;

        const shipment = await tx.shipment.create({
          data: {
            userId: data.userId,
            reference: awb,
            originAddress: data.originAddress,
            originCompany: data.originCompany,
            originCity: data.originCity || '',
            originCountry: data.originCountry || '',
            destinationAddress: data.destinationAddress,
            destinationCompany: data.destinationCompany,
            destinationCity: data.destinationCity || '',
            destinationCountry: data.destinationCountry || '',
            originAirportCode,
            destinationAirportCode,
            weightKg: data.weightKg,
            dimensionsCm: data.dimensionsCm,
            serviceLevel: data.serviceLevel,
            notes: data.notes,
            chargesAmount: typeof data.chargesAmount === 'number' ? data.chargesAmount : Number(data.chargesAmount || 0),
            chargesCurrency: data.chargesCurrency,
            paymentType: data.paymentType,
            ...(data.accountNumber && { accountNumber: String(data.accountNumber).trim() }),
            ...(statusEnum && { status: statusEnum })
          }
        });

        // Track success
        AWB_GENERATION_METRICS.successes++;
        
        return shipment;
      } catch (error) {
        // Track failure
        AWB_GENERATION_METRICS.failures++;
        AWB_GENERATION_METRICS.lastError = error instanceof Error ? error.message : 'Unknown error';
        
        console.error('AWB generation transaction failed:', error);
        
        // Fallback: Create with temporary AWB
        const fallbackAWB = `DRAFT-${Date.now()}`;
        console.warn(`Using fallback AWB: ${fallbackAWB}`);
        
        const originAirportCode2 = data.originCity ? (await tx.airport.findFirst({ where: { city: { equals: String(data.originCity).trim(), mode: 'insensitive' } } }))?.code : null;
        const destinationAirportCode2 = data.destinationCity ? (await tx.airport.findFirst({ where: { city: { equals: String(data.destinationCity).trim(), mode: 'insensitive' } } }))?.code : null;
        const pt2 = normalizePaymentType(data.paymentType);
        if (!pt2) {
          throw new Error('paymentType is required');
        }
        if (pt2 === PaymentType.ACCOUNT && !data.accountNumber) {
          throw new Error('accountNumber is required when paymentType is ACCOUNT');
        }
        return tx.shipment.create({
          data: {
            userId: data.userId,
            reference: fallbackAWB,
            originAddress: data.originAddress,
            originCompany: data.originCompany,
            originCity: data.originCity || '',
            originCountry: data.originCountry || '',
            destinationAddress: data.destinationAddress,
            destinationCompany: data.destinationCompany,
            destinationCity: data.destinationCity || '',
            destinationCountry: data.destinationCountry || '',
            originAirportCode: originAirportCode2,
            destinationAirportCode: destinationAirportCode2,
            weightKg: data.weightKg,
            dimensionsCm: data.dimensionsCm,
            serviceLevel: data.serviceLevel,
            notes: data.notes,
            chargesAmount: typeof data.chargesAmount === 'number' ? data.chargesAmount : Number(data.chargesAmount || 0),
            chargesCurrency: data.chargesCurrency,
            paymentType: data.paymentType,
            ...(data.accountNumber && { accountNumber: String(data.accountNumber).trim() }),
            ...(typeof data.status === 'string' && { status: validateAndConvertStatus(data.status) })
          }
        });
      }
    });
  },

  async getAWBGenerationMetrics() {
    const stats = await awbGenerationService.getAWBStats();
    
    return {
      ...stats,
      currentSession: {
        successes: AWB_GENERATION_METRICS.successes,
        failures: AWB_GENERATION_METRICS.failures,
        successRate: AWB_GENERATION_METRICS.successes + AWB_GENERATION_METRICS.failures > 0 
          ? (AWB_GENERATION_METRICS.successes / (AWB_GENERATION_METRICS.successes + AWB_GENERATION_METRICS.failures)) * 100 
          : 100,
        lastError: AWB_GENERATION_METRICS.lastError
      }
    };
  },

  async retryAWBGeneration(shipmentId: string) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId }
      });

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      if (shipment.reference && !shipment.reference.startsWith('DRAFT-')) {
        throw new Error('Shipment already has a valid AWB');
      }

      try {
        const newAWB = await awbGenerationService.generateNextAwb(tx);
        
        const validation = awbGenerationService.validateAWB(newAWB);
        if (!validation.isValid) {
          throw new Error(`Generated invalid AWB: ${validation.error}`);
        }

        const updatedShipment = await tx.shipment.update({
          where: { id: shipmentId },
          data: { 
            reference: newAWB,
            status: ShipmentStatus.ORDER_RECEIVED
          }
        });

        AWB_GENERATION_METRICS.successes++;
        return updatedShipment;
      } catch (error) {
        AWB_GENERATION_METRICS.failures++;
        AWB_GENERATION_METRICS.lastError = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    });
  },

  // ... keep other existing methods (findAll, findById, update, etc.)
  async findAll(page = 1, limit = 10, filters = {}, userRole?: string, userId?: string) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (page - 1) * safeLimit;
    const where = await buildWhereClause(filters, userRole, userId);
    // Drafts are only visible via the /shipments/drafts endpoints.
    where.isDraft = false;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          trackingEvents: {
            orderBy: {
              eventTime: 'desc'
            },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shipment.count({ where })
    ]);
    
    return {
      shipments,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit)
      }
    };
  },
  
  async findById(id: string) {
    return prisma.shipment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        trackingEvents: {
          orderBy: {
            eventTime: 'desc'
          }
        },
        documents: true
      }
    });
  },

  // Same as findById but resolves the route param as either a DB id or an AWB
  // reference. Use this for all /:id routes (the frontend passes AWBs).
  async findByIdOrReferenceFull(idOrReference: string) {
    const base = await this.findByIdOrReference(idOrReference);
    if (!base) return null;
    return this.findById(base.id);
  },

  // Public tracking view: shipment + events, WITHOUT owner PII (name/email/
  // phone/documents). Used by the unauthenticated /track/:awb endpoint.
  async findTrackingByAwb(awb: string) {
    const shipment = await prisma.shipment.findFirst({
      where: { reference: awb, isDraft: false },
      orderBy: { createdAt: 'desc' },
      include: {
        trackingEvents: {
          orderBy: { eventTime: 'desc' },
          select: { id: true, status: true, location: true, description: true, eventTime: true },
        },
      },
    });
    if (!shipment) return null;
    const { userId, ...rest } = shipment as any;
    return rest;
  },
  
  async update(id: string, data: any) {
    // Whitelist editable fields so clients cannot inject id/userId/isDraft or
    // relation writes through the request body.
    const picked = pickShipmentFields(data);
    if (typeof picked.status === 'string') {
      picked.status = validateAndConvertStatus(picked.status);
    }
    if (picked.paymentType) {
      const pt = normalizePaymentType(String(picked.paymentType));
      if (pt) picked.paymentType = pt;
    }
    const payload: Record<string, any> = picked;
    if (payload.originCity) {
      const code = await prisma.airport.findFirst({ where: { city: { equals: String(payload.originCity).trim(), mode: 'insensitive' } } });
      if (code?.code) (payload as any).originAirportCode = code.code;
    }
    if (payload.destinationCity) {
      const code = await prisma.airport.findFirst({ where: { city: { equals: String(payload.destinationCity).trim(), mode: 'insensitive' } } });
      if (code?.code) (payload as any).destinationAirportCode = code.code;
    }
  return prisma.shipment.update({
      where: { id },
      data: payload
    });
  },
  
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.trackingEvent.deleteMany({
        where: { shipmentId: id }
      });
      
      await tx.document.deleteMany({
        where: { shipmentId: id }
      });
      
      return tx.shipment.delete({
        where: { id }
      });
    });
  },

  async addTrackingEvent(shipmentId: string, data: any) {
    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: validateAndConvertStatus(String(data.status)),
        location: data.location,
        description: data.description,
        eventTime: data.eventTime ? new Date(data.eventTime) : undefined,
      }
    });
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: validateAndConvertStatus(String(data.status)) }
    });
    return event;
  },

  async findByAwb(awb: string) {
    return prisma.shipment.findFirst({
      where: { reference: awb },
      include: {
        trackingEvents: {
          orderBy: { eventTime: 'desc' }
        }
      }
    });
  },

  async schedulePickup(id: string, pickupDetails: any) {
    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status: ShipmentStatus.SHIPMENT_SCHEDULED,
        location: pickupDetails.location,
        description: `Pickup scheduled for ${pickupDetails.date} at ${pickupDetails.time}`
      }
    });
    await prisma.shipment.update({
      where: { id },
      data: { status: ShipmentStatus.SHIPMENT_SCHEDULED }
    });
    return event;
  }
};

// ... keep existing buildWhereClause function
async function buildWhereClause(filters: any, userRole?: string, userId?: string) {
  const where: any = {};
  
  const shipmentVisibilityRoles = ['admin', 'finance', 'report', 'warehouse', 'marketing'];
  const canViewAllShipments = shipmentVisibilityRoles.includes(userRole || '');
  
  if (!canViewAllShipments && userId) {
    where.userId = userId;
  } else if (filters.userId && canViewAllShipments) {
    where.userId = filters.userId;
  }
  
  if (filters.status) {
    where.status = validateAndConvertStatus(String(filters.status));
  }
  if (filters.paymentType) {
    const pt = String(filters.paymentType).toUpperCase();
    if (pt === 'PREPAID') where.paymentType = PaymentType.PREPAID;
    else if (pt === 'COLLECT') where.paymentType = PaymentType.COLLECT;
    else if (pt === 'ACCOUNT') where.paymentType = PaymentType.ACCOUNT;
  }
  
  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search, mode: 'insensitive' } },
      { originAddress: { contains: filters.search, mode: 'insensitive' } },
      { destinationAddress: { contains: filters.search, mode: 'insensitive' } },
      { originCity: { contains: filters.search, mode: 'insensitive' } },
      { destinationCity: { contains: filters.search, mode: 'insensitive' } },
      { originCountry: { contains: filters.search, mode: 'insensitive' } },
      { destinationCountry: { contains: filters.search, mode: 'insensitive' } },
      { originCompany: { contains: filters.search, mode: 'insensitive' } },
      { destinationCompany: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  if (filters.dateFrom) {
    where.createdAt = {
      ...where.createdAt,
      gte: new Date(filters.dateFrom)
    };
  }
  
  if (filters.dateTo) {
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(filters.dateTo)
    };
  }
  
  return where;
}

function normalizePaymentType(data?: string): PaymentType | undefined {
  if (!data) return undefined;
  const key = data.toUpperCase();
  if (key === 'PREPAID') return PaymentType.PREPAID;
  if (key === 'COLLECT') return PaymentType.COLLECT;
  if (key === 'ACCOUNT') return PaymentType.ACCOUNT;
  return undefined;
}
