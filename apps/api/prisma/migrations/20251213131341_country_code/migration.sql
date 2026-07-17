-- AlterTable
ALTER TABLE "Airport" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT ' ',
ALTER COLUMN "country" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "destinationCompany" TEXT,
ADD COLUMN     "originCompany" TEXT;
