/*
  Warnings:

  - The `status` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[vehicleNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vin]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vin` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('truck', 'van', 'car', 'motorcycle', 'bus', 'trailer');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('idle', 'inTransit', 'maintenance', 'decommissioned', 'reserved');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('scheduled', 'emergency', 'inspection', 'tireReplacement', 'oilChange', 'brakeService');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('scheduled', 'inProgress', 'completed', 'cancelled', 'delayed');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('draft', 'pending_approval', 'sent', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "ApprovalLevel" AS ENUM ('manager', 'director', 'finance');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('express', 'standard', 'international', 'warehousing');

-- AlterEnum
ALTER TYPE "ApprovalStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'operations';
ALTER TYPE "UserRole" ADD VALUE 'fleet_manager';
ALTER TYPE "UserRole" ADD VALUE 'account_manager';
ALTER TYPE "UserRole" ADD VALUE 'coo';
ALTER TYPE "UserRole" ADD VALUE 'cfo';
ALTER TYPE "UserRole" ADD VALUE 'cmo';
ALTER TYPE "UserRole" ADD VALUE 'ceo';
ALTER TYPE "UserRole" ADD VALUE 'regional_manager';

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- DropIndex
DROP INDEX "Vehicle_driverId_key";

-- AlterTable
ALTER TABLE "Leave" ALTER COLUMN "approvedAt" DROP NOT NULL,
ALTER COLUMN "hrApprovedAt" DROP NOT NULL,
ALTER COLUMN "managerApprovedAt" DROP NOT NULL,
ALTER COLUMN "rejectedAt" DROP NOT NULL,
ALTER COLUMN "rejectedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PayoutRequest" ALTER COLUMN "bankAccount" DROP NOT NULL,
ALTER COLUMN "mobileNumber" DROP NOT NULL,
ALTER COLUMN "approvedBy" DROP NOT NULL,
ALTER COLUMN "approvedAt" DROP NOT NULL,
ALTER COLUMN "processedBy" DROP NOT NULL,
ALTER COLUMN "processedAt" DROP NOT NULL,
ALTER COLUMN "rejectionReason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "currentMileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fleetManagerId" TEXT,
ADD COLUMN     "fuelLevel" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "lastPing" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nextMaintenanceMileage" DOUBLE PRECISION NOT NULL DEFAULT 150000,
ADD COLUMN     "registrationExpiry" TIMESTAMP(3),
ADD COLUMN     "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "VehicleType" NOT NULL DEFAULT 'truck',
ADD COLUMN     "vehicleNumber" TEXT,
ADD COLUMN     "vin" TEXT NOT NULL,
ALTER COLUMN "driverId" DROP NOT NULL,
ALTER COLUMN "currentLocation" SET DEFAULT 'Unknown',
DROP COLUMN "status",
ADD COLUMN     "status" "VehicleStatus" NOT NULL DEFAULT 'idle';

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'scheduled',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "mileageAtService" DOUBLE PRECISION NOT NULL,
    "cost" DECIMAL(10,2),
    "notes" TEXT,
    "vendor" TEXT,
    "performedById" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "annualLeave" INTEGER NOT NULL DEFAULT 21,
    "sickLeave" INTEGER NOT NULL DEFAULT 10,
    "personalLeave" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serviceLevel" TEXT NOT NULL DEFAULT 'standard',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "assignedFleet" INTEGER NOT NULL DEFAULT 0,
    "approvalThreshold" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "QuotationStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationLineItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuotationLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationApproval" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "level" "ApprovalLevel" NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuotationApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Renewal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "currentContractValue" DOUBLE PRECISION NOT NULL,
    "proposedValue" DOUBLE PRECISION NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "stage" TEXT NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "lastContact" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Renewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalSpend" DOUBLE PRECISION NOT NULL,
    "shipmentCount" INTEGER NOT NULL,
    "avgSatisfaction" DOUBLE PRECISION NOT NULL,
    "supportTickets" INTEGER NOT NULL,
    "renewalProbability" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveMetric" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "region" TEXT,
    "role" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ExecutiveMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveInsight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "region" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'on_track',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "StrategicGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalConfig" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceRecord_vehicleId_idx" ON "MaintenanceRecord"("vehicleId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_vehicleId_status_idx" ON "MaintenanceRecord"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_status_idx" ON "MaintenanceRecord"("status");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_scheduledAt_idx" ON "MaintenanceRecord"("scheduledAt");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_scheduledAt_status_idx" ON "MaintenanceRecord"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_key" ON "LeaveBalance"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveBalance_employeeId_idx" ON "LeaveBalance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE INDEX "QuotationLineItem_quotationId_idx" ON "QuotationLineItem"("quotationId");

-- CreateIndex
CREATE INDEX "QuotationApproval_quotationId_idx" ON "QuotationApproval"("quotationId");

-- CreateIndex
CREATE INDEX "QuotationApproval_approverId_idx" ON "QuotationApproval"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotationApproval_quotationId_level_key" ON "QuotationApproval"("quotationId", "level");

-- CreateIndex
CREATE INDEX "Renewal_clientId_idx" ON "Renewal"("clientId");

-- CreateIndex
CREATE INDEX "Renewal_ownerId_idx" ON "Renewal"("ownerId");

-- CreateIndex
CREATE INDEX "AccountAnalyticsSnapshot_month_idx" ON "AccountAnalyticsSnapshot"("month");

-- CreateIndex
CREATE UNIQUE INDEX "AccountAnalyticsSnapshot_clientId_month_key" ON "AccountAnalyticsSnapshot"("clientId", "month");

-- CreateIndex
CREATE INDEX "ExecutiveMetric_role_date_idx" ON "ExecutiveMetric"("role", "date");

-- CreateIndex
CREATE INDEX "ExecutiveMetric_metricKey_date_idx" ON "ExecutiveMetric"("metricKey", "date");

-- CreateIndex
CREATE INDEX "ExecutiveMetric_region_idx" ON "ExecutiveMetric"("region");

-- CreateIndex
CREATE INDEX "ExecutiveInsight_role_idx" ON "ExecutiveInsight"("role");

-- CreateIndex
CREATE INDEX "ExecutiveInsight_region_idx" ON "ExecutiveInsight"("region");

-- CreateIndex
CREATE INDEX "ExecutiveInsight_createdAt_idx" ON "ExecutiveInsight"("createdAt");

-- CreateIndex
CREATE INDEX "StrategicGoal_ownerId_idx" ON "StrategicGoal"("ownerId");

-- CreateIndex
CREATE INDEX "StrategicGoal_status_idx" ON "StrategicGoal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalConfig_region_key" ON "RegionalConfig"("region");

-- CreateIndex
CREATE INDEX "RegionalConfig_managerId_idx" ON "RegionalConfig"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Vehicle_driverId_idx" ON "Vehicle"("driverId");

-- CreateIndex
CREATE INDEX "Vehicle_fleetManagerId_idx" ON "Vehicle"("fleetManagerId");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_type_status_idx" ON "Vehicle"("type", "status");

-- CreateIndex
CREATE INDEX "Vehicle_currentMileage_idx" ON "Vehicle"("currentMileage");

-- CreateIndex
CREATE INDEX "Vehicle_insuranceExpiry_idx" ON "Vehicle"("insuranceExpiry");

-- CreateIndex
CREATE INDEX "Vehicle_registrationExpiry_idx" ON "Vehicle"("registrationExpiry");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fleetManagerId_fkey" FOREIGN KEY ("fleetManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationLineItem" ADD CONSTRAINT "QuotationLineItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationApproval" ADD CONSTRAINT "QuotationApproval_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationApproval" ADD CONSTRAINT "QuotationApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountAnalyticsSnapshot" ADD CONSTRAINT "AccountAnalyticsSnapshot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicGoal" ADD CONSTRAINT "StrategicGoal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalConfig" ADD CONSTRAINT "RegionalConfig_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
