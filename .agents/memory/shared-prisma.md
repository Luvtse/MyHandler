---
name: Shared Prisma instance
description: All API modules must use the single shared Prisma client, never new PrismaClient().
---

## Rule
Import the shared client — never instantiate your own:

```ts
import prisma from '../../utils/prisma';   // from modules/*/*.ts
import prisma from '../utils/prisma';       // from services/*.ts
```

Never write `new PrismaClient()` — it leaks connections and bypasses the connection pool.

## Why
The API had 15+ files each calling `new PrismaClient()`, which creates a new DB connection pool per module, exhausting Postgres connection limits under load. The shared instance at `apps/api/src/utils/prisma.ts` is the single source of truth.

## How to apply
When adding a new route/controller/service in `apps/api/src`, always import from the shared instance. If you see `new PrismaClient()` anywhere in a code review, replace it.

## Type-only imports
If a file needs `PrismaClient` purely as a TypeScript type (e.g., for a function parameter), use:
```ts
import type { PrismaClient } from '@prisma/client';
```
This is a zero-cost type import and doesn't instantiate anything.
