/*
  Warnings:

  - A unique constraint covering the columns `[staffId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'service_point_agent';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInvited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staffId" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "businessAccountCode" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_staffId_key" ON "User"("staffId");
