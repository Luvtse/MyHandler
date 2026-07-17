/*
  Migration to remove legacy ShipmentStatus values (CREATED, PENDING, IN_TRANSIT, DELIVERED)
  and map them to real canonical statuses.
*/

-- Step 1: Update existing shipment statuses
UPDATE "Shipment"
SET "status" = 'ORDER_RECEIVED'
WHERE "status" = 'CREATED';

UPDATE "Shipment"
SET "status" = 'AWAITING_PICKUP'
WHERE "status" = 'PENDING';

UPDATE "Shipment"
SET "status" = 'IN_TRANSIT_TO_DESTINATION'
WHERE "status" = 'IN_TRANSIT';

UPDATE "Shipment"
SET "status" = 'DELIVERED_SUCCESSFULLY'
WHERE "status" = 'DELIVERED';

-- Step 2: Update tracking event statuses (if they use the same enum)
UPDATE "TrackingEvent"
SET "status" = 'ORDER_RECEIVED'
WHERE "status" = 'CREATED';

UPDATE "TrackingEvent"
SET "status" = 'AWAITING_PICKUP'
WHERE "status" = 'PENDING';

UPDATE "TrackingEvent"
SET "status" = 'IN_TRANSIT_TO_DESTINATION'
WHERE "status" = 'IN_TRANSIT';

UPDATE "TrackingEvent"
SET "status" = 'DELIVERED_SUCCESSFULLY'
WHERE "status" = 'DELIVERED';

-- Step 3: Now safely recreate the enum without legacy values
CREATE TYPE "ShipmentStatus_new" AS ENUM (
  'ORDER_RECEIVED',
  'LABEL_CREATED',
  'SHIPMENT_SCHEDULED',
  'SHIPMENT_INFORMATION_RECEIVED',
  'AWAITING_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT_TO_SORTING',
  'RECEIVED_AT_HUB',
  'ORIGIN_SCAN',
  'SCANNED_INBOUND',
  'SORTING_IN_PROGRESS',
  'DEPARTING_TO_NEXT_HUB',
  'ARRIVAL_SCAN',
  'PROCESSING_AT_FACILITY',
  'HELD_AT_LOCATION',
  'IN_TRANSIT_TO_DESTINATION',
  'DEPARTURE_SCAN',
  'ARRIVED_AT_DESTINATION_HUB',
  'ARRIVED_AT_FACILITY',
  'DEPARTED_FACILITY',
  'AWAITING_CLEARANCE',
  'CLEARANCE_DELAY',
  'CUSTOMS_CLEARANCE_INITIATED',
  'CUSTOMS_CLEARED',
  'CUSTOMS_RELEASED',
  'TENDERED_TO_DELIVERY_PARTNER',
  'TRANSFERRED_TO_POST_OFFICE',
  'WEATHER_DELAY',
  'TRANSPORTATION_DELAY',
  'SHIPMENT_ON_HOLD',
  'MISROUTED',
  'DISPATCHED_FOR_DELIVERY',
  'IN_LOCAL_DELIVERY_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERY_ATTEMPTED',
  'DELIVERY_RESCHEDULED',
  'READY_FOR_PICKUP',
  'DELIVERY_EXCEPTION',
  'DELIVERED_SUCCESSFULLY',
  'DELIVERY_CONFIRMED',
  'SIGNATURE_OBTAINED',
  'RETURNED_TO_SENDER',
  'LOST_EXCEPTION',
  'DAMAGED_UPON_ARRIVAL',
  'CANCELLED'
);

-- Remove default temporarily
ALTER TABLE "Shipment" ALTER COLUMN "status" DROP DEFAULT;

-- Convert column to new enum (now safe because all values exist in new enum)
ALTER TABLE "Shipment" ALTER COLUMN "status" TYPE "ShipmentStatus_new" USING ("status"::text::"ShipmentStatus_new");
ALTER TABLE "TrackingEvent" ALTER COLUMN "status" TYPE "ShipmentStatus_new" USING ("status"::text::"ShipmentStatus_new");

-- Replace old enum
ALTER TYPE "ShipmentStatus" RENAME TO "ShipmentStatus_old";
ALTER TYPE "ShipmentStatus_new" RENAME TO "ShipmentStatus";

-- Restore default
ALTER TABLE "Shipment" ALTER COLUMN "status" SET DEFAULT 'ORDER_RECEIVED';

-- Clean up
DROP TYPE "ShipmentStatus_old";