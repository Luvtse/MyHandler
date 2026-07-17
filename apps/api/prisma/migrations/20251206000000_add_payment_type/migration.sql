-- Add PaymentType enum and columns to Shipment
DO $$ BEGIN
  CREATE TYPE "PaymentType" AS ENUM ('PREPAID','COLLECT','ACCOUNT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Shipment"
  ADD COLUMN IF NOT EXISTS "paymentType" "PaymentType",
  ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;

