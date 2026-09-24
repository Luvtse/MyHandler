-- Adds the draft lifecycle flag used by /shipments/drafts (create/list/update/finalize).
-- Drafts are Shipment rows with isDraft=true and a provisional DRAFT-* reference;
-- a real AWB is only allocated when the draft is finalized.
ALTER TABLE "Shipment" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- Speeds up id-or-AWB resolution (findByIdOrReference falls back to reference lookup).
CREATE INDEX IF NOT EXISTS "Shipment_reference_idx" ON "Shipment"("reference");

-- Keeps the drafts listing fast.
CREATE INDEX IF NOT EXISTS "Shipment_isDraft_userId_idx" ON "Shipment"("isDraft", "userId");
