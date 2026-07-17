-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "destinationCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "destinationCountry" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "originCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "originCountry" TEXT NOT NULL DEFAULT '';
