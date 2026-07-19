---
name: Blocked packages
description: npm packages blocked by Replit's security firewall and their workarounds
---

## Blocked packages (as of July 2026)

| Package | Version blocked | Reason | Fix applied |
|---------|----------------|---------|-------------|
| `jspdf` | `^3.0.4` | Security policy | Removed; stub implementations in all PDF utils |
| `jspdf-autotable` | `^5.0.2` | Security policy | Removed along with jspdf |
| `vitest` | `^1.6.1` | Security policy | Removed from API devDependencies |
| `exceljs` | `^4.4.0` | Pulls `fast-xml-parser@5.2.5` (CVE) | Removed; replaced with CSV generation |
| `xlsx` | `^0.18.5` | Security policy | Removed |
| `fast-xml-parser` | `5.2.5` | CVE (GHSA-gh4j-gqv2-49f6, DoS) | Added as direct root dep at `5.10.1` (patched) |
| `mongodb` | any | Pulls AWS auth → fast-xml-parser@5 | Removed (app uses Prisma/PostgreSQL, not MongoDB) |

## Client-side PDF generation

All four jspdf utility files have been stubbed:
- `apps/web/src/shared/utils/generateInvoice.ts`
- `apps/web/src/shared/utils/generateInvoiceMaker.ts`
- `apps/web/src/shared/utils/generateMaintenancePDF.ts`
- `apps/web/src/shared/utils/quotationPdf.ts`
- `apps/web/src/shared/utils/generateAwb.ts`

Stubs export the same function signatures and interfaces so callers compile. The implementations return an empty Blob with a console.warn.

**Why:** jsPDF is blocked at the network level — cannot be installed. Server-side PDF is implemented via a pure-JS PDF generator in `apps/api/src/services/reportService.ts`.

## Excel generation

`exceljs` and `xlsx` both blocked. `generateExcelReport` in `reportService.ts` now returns a CSV buffer (UTF-8, comma-separated). Excel opens CSV natively. Content-Disposition header sets filename `.xlsx` so downloads are recognised.

## fast-xml-parser override

Added `"fast-xml-parser": "5.10.1"` as a direct dependency in root `package.json` AND in `overrides`. This prevents npm from trying to resolve the blocked `5.2.5` tarball during dependency resolution.

**Why:** npm overrides alone don't prevent fetching the blocked version; adding it as a direct root dependency hoists the allowed version before resolution.
