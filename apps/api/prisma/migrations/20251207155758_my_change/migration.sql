/*
  Warnings:

  - Made the column `managerId` on table `Department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipmentId` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `InventoryItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `InventoryItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipmentId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedBy` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedAt` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hrApproval` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hrApprovedAt` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hrId` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `managerApprovedAt` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `managerId` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rejectedAt` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rejectedBy` on table `Leave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipmentId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bankAccount` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mobileNumber` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedBy` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedAt` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `processedBy` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `processedAt` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rejectionReason` on table `PayoutRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reference` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originAddress` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `destinationAddress` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weightKg` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serviceLevel` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chargesAmount` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chargesCurrency` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentType` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountNumber` on table `Shipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region` on table `TaxRate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `leaderId` on table `Team` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `TrackingEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessAccountCode` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `driverId` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentLocation` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/

-- First, fix all NULL values with meaningful defaults
-- ====================================================

-- User table
UPDATE "User" 
SET "phone" = '+1-555-UNKNOWN'
WHERE "phone" IS NULL;

UPDATE "User" 
SET "businessAccountCode" = CASE 
  WHEN "role" = 'admin' THEN 'ADM-' || id
  WHEN "role" = 'customer' THEN 'CUS-' || id
  WHEN "role" = 'driver' THEN 'DRV-' || id
  WHEN "role" = 'warehouse' THEN 'WRH-' || id
  WHEN "role" = 'finance' THEN 'FIN-' || id
  WHEN "role" = 'report' THEN 'RPT-' || id
  WHEN "role" = 'hr_manager' THEN 'HRM-' || id
  WHEN "role" = 'hr_staff' THEN 'HRS-' || id
  ELSE 'EMP-' || id
END
WHERE "businessAccountCode" IS NULL;

-- Shipment table
UPDATE "Shipment" 
SET "reference" = 'SHIP-' || id
WHERE "reference" IS NULL;

UPDATE "Shipment" 
SET "originAddress" = 'Unknown Origin'
WHERE "originAddress" IS NULL;

UPDATE "Shipment" 
SET "destinationAddress" = 'Unknown Destination'
WHERE "destinationAddress" IS NULL;

UPDATE "Shipment" 
SET "weightKg" = 0
WHERE "weightKg" IS NULL;

UPDATE "Shipment" 
SET "serviceLevel" = 'STANDARD'
WHERE "serviceLevel" IS NULL;

UPDATE "Shipment" 
SET "chargesAmount" = 0
WHERE "chargesAmount" IS NULL;

UPDATE "Shipment" 
SET "chargesCurrency" = 'USD'
WHERE "chargesCurrency" IS NULL;

UPDATE "Shipment" 
SET "paymentType" = 'PREPAID'
WHERE "paymentType" IS NULL;

UPDATE "Shipment" 
SET "accountNumber" = 'ACC-' || "userId"
WHERE "accountNumber" IS NULL;

-- Vehicle table
UPDATE "Vehicle" 
SET "driverId" = (
  SELECT id FROM "User" 
  WHERE "role" = 'driver' 
  AND "id" NOT IN (SELECT "driverId" FROM "Vehicle" WHERE "driverId" IS NOT NULL)
  LIMIT 1
)
WHERE "driverId" IS NULL;

UPDATE "Vehicle" 
SET "currentLocation" = 'Garage'
WHERE "currentLocation" IS NULL;

UPDATE "Vehicle" 
SET "status" = 'available'
WHERE "status" IS NULL;

-- Department table
UPDATE "Department" 
SET "managerId" = (
  SELECT "userId" FROM "Employee" 
  WHERE "position" ILIKE '%manager%' 
  OR "position" ILIKE '%head%'
  LIMIT 1
)
WHERE "managerId" IS NULL;

-- Document table
UPDATE "Document" 
SET "userId" = (
  SELECT id FROM "User" LIMIT 1
)
WHERE "userId" IS NULL;

UPDATE "Document" 
SET "shipmentId" = (
  SELECT id FROM "Shipment" LIMIT 1
)
WHERE "shipmentId" IS NULL;

-- InventoryItem table
UPDATE "InventoryItem" 
SET "description" = 'No description available'
WHERE "description" IS NULL;

UPDATE "InventoryItem" 
SET "location" = 'Main Warehouse'
WHERE "location" IS NULL;

-- Invoice table
UPDATE "Invoice" 
SET "shipmentId" = (
  SELECT id FROM "Shipment" LIMIT 1
)
WHERE "shipmentId" IS NULL;

-- Leave table
UPDATE "Leave" 
SET "approvedBy" = 'system'
WHERE "approvedBy" IS NULL;

UPDATE "Leave" 
SET "approvedAt" = CURRENT_TIMESTAMP
WHERE "approvedAt" IS NULL;

UPDATE "Leave" 
SET "hrApproval" = 'PENDING'
WHERE "hrApproval" IS NULL;

UPDATE "Leave" 
SET "hrApprovedAt" = CURRENT_TIMESTAMP
WHERE "hrApprovedAt" IS NULL;

UPDATE "Leave" 
SET "hrId" = (
  SELECT "userId" FROM "Employee" 
  WHERE "position" ILIKE '%hr%' 
  LIMIT 1
)
WHERE "hrId" IS NULL;

UPDATE "Leave" 
SET "managerApprovedAt" = CURRENT_TIMESTAMP
WHERE "managerApprovedAt" IS NULL;

UPDATE "Leave" 
SET "managerId" = (
  SELECT "userId" FROM "Employee" 
  WHERE "position" ILIKE '%manager%'
  LIMIT 1
)
WHERE "managerId" IS NULL;

UPDATE "Leave" 
SET "rejectedAt" = CURRENT_TIMESTAMP
WHERE "rejectedAt" IS NULL;

UPDATE "Leave" 
SET "rejectedBy" = 'system'
WHERE "rejectedBy" IS NULL;

-- Order table
UPDATE "Order" 
SET "shipmentId" = (
  SELECT id FROM "Shipment" LIMIT 1
)
WHERE "shipmentId" IS NULL;

-- Payment table
UPDATE "Payment" 
SET "transactionId" = 'TXN-' || id
WHERE "transactionId" IS NULL;

-- PayoutRequest table
UPDATE "PayoutRequest" 
SET "bankAccount" = 'Account not provided'
WHERE "bankAccount" IS NULL;

UPDATE "PayoutRequest" 
SET "mobileNumber" = 'Not provided'
WHERE "mobileNumber" IS NULL;

UPDATE "PayoutRequest" 
SET "approvedBy" = 'system'
WHERE "approvedBy" IS NULL;

UPDATE "PayoutRequest" 
SET "approvedAt" = CURRENT_TIMESTAMP
WHERE "approvedAt" IS NULL;

UPDATE "PayoutRequest" 
SET "processedBy" = 'system'
WHERE "processedBy" IS NULL;

UPDATE "PayoutRequest" 
SET "processedAt" = CURRENT_TIMESTAMP
WHERE "processedAt" IS NULL;

UPDATE "PayoutRequest" 
SET "rejectionReason" = 'No reason provided'
WHERE "rejectionReason" IS NULL;

-- TaxRate table
UPDATE "TaxRate" 
SET "region" = 'Default Region'
WHERE "region" IS NULL;

-- Team table
UPDATE "Team" 
SET "leaderId" = (
  SELECT "userId" FROM "Employee" 
  WHERE "position" ILIKE '%lead%' 
  OR "position" ILIKE '%supervisor%'
  LIMIT 1
)
WHERE "leaderId" IS NULL;

-- TrackingEvent table
UPDATE "TrackingEvent" 
SET "location" = 'Unknown Location'
WHERE "location" IS NULL;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ShipmentStatus" ADD VALUE 'ORDER_RECEIVED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'SHIPMENT_SCHEDULED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'AWAITING_PICKUP';
ALTER TYPE "ShipmentStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "ShipmentStatus" ADD VALUE 'IN_TRANSIT_TO_SORTING';
ALTER TYPE "ShipmentStatus" ADD VALUE 'RECEIVED_AT_HUB';
ALTER TYPE "ShipmentStatus" ADD VALUE 'SCANNED_INBOUND';
ALTER TYPE "ShipmentStatus" ADD VALUE 'SORTING_IN_PROGRESS';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DEPARTING_TO_NEXT_HUB';
ALTER TYPE "ShipmentStatus" ADD VALUE 'IN_TRANSIT_TO_DESTINATION';
ALTER TYPE "ShipmentStatus" ADD VALUE 'ARRIVED_AT_DESTINATION_HUB';
ALTER TYPE "ShipmentStatus" ADD VALUE 'CUSTOMS_CLEARANCE_INITIATED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'CUSTOMS_CLEARED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DISPATCHED_FOR_DELIVERY';
ALTER TYPE "ShipmentStatus" ADD VALUE 'IN_LOCAL_DELIVERY_FACILITY';
ALTER TYPE "ShipmentStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DELIVERY_ATTEMPTED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DELIVERY_RESCHEDULED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DELIVERED_SUCCESSFULLY';
ALTER TYPE "ShipmentStatus" ADD VALUE 'SIGNATURE_OBTAINED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'RETURNED_TO_SENDER';
ALTER TYPE "ShipmentStatus" ADD VALUE 'LOST_EXCEPTION';
ALTER TYPE "ShipmentStatus" ADD VALUE 'DAMAGED_UPON_ARRIVAL';

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Leave" DROP CONSTRAINT "Leave_hrId_fkey";

-- DropForeignKey
ALTER TABLE "Leave" DROP CONSTRAINT "Leave_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "managerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "shipmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "shipmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Leave" ALTER COLUMN "approvedBy" SET NOT NULL,
ALTER COLUMN "approvedAt" SET NOT NULL,
ALTER COLUMN "hrApproval" SET NOT NULL,
ALTER COLUMN "hrApprovedAt" SET NOT NULL,
ALTER COLUMN "hrId" SET NOT NULL,
ALTER COLUMN "managerApprovedAt" SET NOT NULL,
ALTER COLUMN "managerId" SET NOT NULL,
ALTER COLUMN "rejectedAt" SET NOT NULL,
ALTER COLUMN "rejectedBy" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shipmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "transactionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PayoutRequest" ALTER COLUMN "bankAccount" SET NOT NULL,
ALTER COLUMN "mobileNumber" SET NOT NULL,
ALTER COLUMN "approvedBy" SET NOT NULL,
ALTER COLUMN "approvedAt" SET NOT NULL,
ALTER COLUMN "processedBy" SET NOT NULL,
ALTER COLUMN "processedAt" SET NOT NULL,
ALTER COLUMN "rejectionReason" SET NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" ALTER COLUMN "reference" SET NOT NULL,
ALTER COLUMN "originAddress" SET NOT NULL,
ALTER COLUMN "destinationAddress" SET NOT NULL,
ALTER COLUMN "weightKg" SET NOT NULL,
ALTER COLUMN "serviceLevel" SET NOT NULL,
ALTER COLUMN "chargesAmount" SET NOT NULL,
ALTER COLUMN "chargesCurrency" SET NOT NULL,
ALTER COLUMN "paymentType" SET NOT NULL,
ALTER COLUMN "accountNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaxRate" ALTER COLUMN "region" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "leaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TrackingEvent" ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "businessAccountCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "driverId" SET NOT NULL,
ALTER COLUMN "currentLocation" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;