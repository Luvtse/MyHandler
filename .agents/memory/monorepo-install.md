---
name: Monorepo install
description: How npm install works in this monorepo and where overrides must live
---

## Structure

This is an npm workspaces monorepo:
- Root `package.json` declares `"workspaces": ["apps/*", "packages/*"]`
- Packages: `apps/api`, `apps/web`, `packages/api-client`, `packages/contracts`
- Packages hoist shared dependencies to root `node_modules/`

## Install commands

- **Always run `npm install` from the workspace root** (not from inside individual apps). Running it from `apps/api` installs to the root anyway but can confuse resolution.
- After root install succeeds, all workspaces share the hoisted modules.

## Overrides

npm `overrides` must be in the **root** `package.json` to affect the full dependency tree. Overrides in `apps/api/package.json` are ignored for packages that get hoisted to root `node_modules/`.

**Why:** Discovered when trying to fix `fast-xml-parser@5.2.5` — the override in `apps/api/package.json` had no effect because npm resolves from the root workspace.

## `@emotion` / `@mui/material` in API

These frontend-only packages were mistakenly in `apps/api/package.json` — removed. They don't cause a runtime error but do pull in unnecessary dependencies and can cause security policy blocks.
