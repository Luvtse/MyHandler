-- CreateTable
CREATE TABLE "Airport" (
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processingHours" INTEGER NOT NULL,
    "businessStart" INTEGER NOT NULL,
    "businessEnd" INTEGER NOT NULL,
    "tzOffset" INTEGER NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "FlightSchedule" (
    "id" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "dailyFrequency" INTEGER NOT NULL,
    "lastDepartureLocal" TEXT NOT NULL,
    "flightMinutes" INTEGER NOT NULL,

    CONSTRAINT "FlightSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlightSchedule_originCity_destinationCity_idx" ON "FlightSchedule"("originCity", "destinationCity");
