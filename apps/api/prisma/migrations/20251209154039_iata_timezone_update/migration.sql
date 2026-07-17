-- AlterTable
ALTER TABLE "Airport" ADD COLUMN     "capacityStatus" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'ET',
ADD COLUMN     "loadFactor" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "operationalBufferHours" INTEGER DEFAULT 0,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa';

-- AlterTable
ALTER TABLE "FlightSchedule" ADD COLUMN     "destinationCode" TEXT,
ADD COLUMN     "originCode" TEXT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "destinationAirportCode" TEXT,
ADD COLUMN     "originAirportCode" TEXT;

-- CreateTable
CREATE TABLE "ServiceLevelSettings" (
    "id" TEXT NOT NULL,
    "airportType" TEXT NOT NULL,
    "serviceLevel" TEXT NOT NULL,
    "cutoffHour" INTEGER NOT NULL,
    "processingAdjustmentHours" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceLevelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingCalendar" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "airportCode" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "closedAllDay" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OperatingCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceLevelSettings_airportType_serviceLevel_key" ON "ServiceLevelSettings"("airportType", "serviceLevel");

-- CreateIndex
CREATE INDEX "OperatingCalendar_country_date_idx" ON "OperatingCalendar"("country", "date");

-- CreateIndex
CREATE INDEX "FlightSchedule_originCode_destinationCode_idx" ON "FlightSchedule"("originCode", "destinationCode");
