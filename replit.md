# GoodsHandler

A full-stack logistics web application for shipment tracking, delivery management, and customer/driver/admin workflows.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express + TypeScript (ts-node-dev) |
| Database | PostgreSQL via Prisma ORM |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| State | Zustand + TanStack Query |
| Auth | JWT + Passport (Google, GitHub OAuth) |

## Monorepo layout

```
apps/
  api/      Express backend  (port 4000)
  web/      React frontend   (port 8080)
packages/
  api-client/   Typed HTTP client
  contracts/    Shared Zod schemas & types
```

## Running locally

```bash
# Install all workspace dependencies
npm install

# Start both servers (separate terminals)
npm run dev:api      # http://localhost:4000
npm run dev:web      # http://localhost:8080
```

## Required environment variables (apps/api)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection string |
| `SESSION_SECRET` | JWT / session signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional) |

## Database setup

```bash
cd apps/api
npx prisma migrate dev   # run migrations
npx prisma db seed       # seed initial data
```

## Brand

- **Name:** GoodsHandler
- **Primary:** Bold Blue `#1A3C8F`
- **Accent:** Bold Yellow `#FFC107`
- **Typography:** Inter (headings + body), JetBrains Mono (codes/tracking numbers)

## User preferences

- Keep the existing monorepo structure — do not restructure or migrate to a different workspace tool.
- Do not hardcode localhost URLs in application code; use relative URLs or environment variables.
