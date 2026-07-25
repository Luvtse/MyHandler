---
name: Schema field names
description: Correct Prisma model field names that differ from what you might guess; prevents type errors when writing queries.
---

## Invoice
- Fields: `subtotal`, `taxAmount`, `totalAmount`, `dueDate`, `status` (InvoiceStatus enum: DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- **No `paidAmount` field.** Do not use `_sum: { paidAmount: true }` or access `inv.paidAmount`.
- For overdue balance, use `totalAmount` as the outstanding amount (no partial-payment tracking in schema).

## Quotation
- Status enum values: `draft`, `pending_approval`, `sent`, `accepted`, `rejected`, `expired`
- **No `won`, `pending`, or `lost` statuses.** Map them: won → `accepted`, pending → `pending_approval`/`sent`, lost → `rejected`/`expired`.
- Sum aggregate field: `total` (not `totalAmount`). Fields are: `subtotal`, `tax`, `total`.

## Client
- Status values are lowercase strings stored as plain String in DB (not a Prisma enum): `active`, `at_risk`, `inactive`.
- Use `status: 'active' as any` if TypeScript infers a narrower type.

**Why:** These mismatches caused silent runtime bugs and TS2339/TS2353 errors throughout the executive and AI insights services. Correct field names are in `apps/api/prisma/schema.prisma`.

**How to apply:** Before writing any `prisma.<model>.aggregate`, `findMany`, or `count` with field references, grep the schema for the model to confirm field names and enum values.
