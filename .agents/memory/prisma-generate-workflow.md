---
name: Prisma generate workflow
description: How Prisma is set up and what to do after schema changes
---

## Prisma setup

- **Version**: Prisma v5.22.0 (not v7). The schema uses the classic `datasource db { url = env("DATABASE_URL") }` format — no `prisma.config.ts` needed.
- **Client location**: `node_modules/@prisma/client` (hoisted to workspace root)
- **DATABASE_URL**: Prisma Accelerate URL (see `.env` in apps/api)

## After schema changes

1. Run `cd apps/api && npx prisma generate` — regenerates `@prisma/client` types.
2. Run `cd apps/api && npx prisma db push` (dev) or `npx prisma migrate deploy` (prod) — applies the schema to the database.
3. Restart the `GoodsHandler API` workflow — the running ts-node-dev process caches the old client.

**Why:** The API workflow must be restarted after `prisma generate` because ts-node-dev imports the module at startup. If the workflow starts before `prisma generate` runs, it throws "PrismaClient did not initialize yet."

## AuditLog model

`AuditLog` was added to `schema.prisma` in a previous session but `prisma generate` was not re-run and `prisma db push` was not run. The `audit()` helper in `apps/api/src/middlewares/auditLog.ts` accesses it via `(prisma as any).auditLog` so it fails silently if the table doesn't exist. Run `prisma db push` to create the table.
