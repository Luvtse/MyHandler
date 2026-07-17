-- CreateTable
CREATE TABLE "RegionalHub" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "hubCode" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RegionalHub_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegionalHub_country_idx" ON "RegionalHub"("country");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalHub_country_hubCode_key" ON "RegionalHub"("country", "hubCode");
