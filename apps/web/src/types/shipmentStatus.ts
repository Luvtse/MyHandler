export type ShipmentStatusCategory = 
  | 'Order Initiation & Shipment Preparation'
  | 'Inbound & Sorting'
  | 'Long-Haul / Inter-City/Country Transit'
  | 'Final Delivery Preparation'
  | 'Delivery Completion or Exception Handling';

export interface ShipmentStatusOption {
  id: string;
  category: ShipmentStatusCategory;
  label: string;
  description: string;
}

export const SHIPMENT_STATUSES: ShipmentStatusOption[] = [
  // Order Initiation & Shipment Preparation
  {
    id: 'order-received',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Order Received',
    description: 'Order has been confirmed.'
  },
  {
    id: 'label-created',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Label Created',
    description: 'Shipping label generated; awaiting pickup.'
  },
  {
    id: 'shipment-scheduled',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Shipment Scheduled',
    description: 'Pickup scheduled with carrier.'
  },
  {
    id: 'shipment-information-received',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Shipment Information Received',
    description: 'Carrier has received electronic information.'
  },
  {
    id: 'awaiting-pickup',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Awaiting Pickup',
    description: 'Shipment is ready at sender\'s location.'
  },
  {
    id: 'picked-up',
    category: 'Order Initiation & Shipment Preparation',
    label: 'Picked Up',
    description: 'Package collected by courier.'
  },
  {
    id: 'in-transit-to-sorting',
    category: 'Order Initiation & Shipment Preparation',
    label: 'In Transit to Sorting Facility',
    description: 'En route to central hub.'
  },

  // Inbound & Sorting
  {
    id: 'received-at-hub',
    category: 'Inbound & Sorting',
    label: 'Received at Hub',
    description: 'Package arrived at facility.'
  },
  {
    id: 'origin-scan',
    category: 'Inbound & Sorting',
    label: 'Origin Scan',
    description: 'Processed at origin facility.'
  },
  {
    id: 'scanned-inbound',
    category: 'Inbound & Sorting',
    label: 'Scanned Inbound',
    description: 'Logged into the system.'
  },
  {
    id: 'sorting-in-progress',
    category: 'Inbound & Sorting',
    label: 'Sorting in Progress',
    description: 'Being sorted by destination.'
  },
  {
    id: 'departing-to-next-hub',
    category: 'Inbound & Sorting',
    label: 'Departing to Next Hub',
    description: 'Leaving current hub to next facility.'
  },
  {
    id: 'arrival-scan',
    category: 'Inbound & Sorting',
    label: 'Arrival Scan',
    description: 'Arrived at sorting facility.'
  },
  {
    id: 'processing-at-facility',
    category: 'Inbound & Sorting',
    label: 'Processing at Facility',
    description: 'Package is being processed.'
  },
  {
    id: 'held-at-location',
    category: 'Inbound & Sorting',
    label: 'Held at Location',
    description: 'Held per recipient request or local regulations.'
  },

  // Long-Haul / Inter-City/Country Transit
  {
    id: 'in-transit-to-destination',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'In Transit to Destination',
    description: 'Moving toward final location.'
  },
  {
    id: 'departure-scan',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Departure Scan',
    description: 'Departed origin or transit facility.'
  },
  {
    id: 'arrived-at-destination-hub',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Arrived at Destination Hub',
    description: 'Reached destination city hub.'
  },
  {
    id: 'arrived-at-facility',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Arrived at Facility',
    description: 'Arrived at transportation facility.'
  },
  {
    id: 'departed-facility',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Departed Facility',
    description: 'Departed carrier facility.'
  },
  {
    id: 'customs-clearance-initiated',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Customs Clearance Initiated',
    description: 'International clearance started.'
  },
  {
    id: 'customs-cleared',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Customs Cleared',
    description: 'Customs formalities completed.'
  },
  {
    id: 'awaiting-clearance',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Awaiting Clearance',
    description: 'Pending customs clearance.'
  },
  {
    id: 'clearance-delay',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Clearance Delay',
    description: 'Customs clearance delayed.'
  },
  {
    id: 'customs-released',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Customs Released',
    description: 'Released by customs.'
  },
  {
    id: 'tendered-to-delivery-partner',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Tendered to Delivery Partner',
    description: 'Handed off to local delivery partner.'
  },
  {
    id: 'transferred-to-post-office',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Transferred to Post Office',
    description: 'Transferred to postal operator.'
  },
  {
    id: 'weather-delay',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Weather Delay',
    description: 'Delayed due to weather conditions.'
  },
  {
    id: 'transportation-delay',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Transportation Delay',
    description: 'Carrier transportation delay.'
  },
  {
    id: 'shipment-on-hold',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Shipment on Hold',
    description: 'Shipment placed on temporary hold.'
  },
  {
    id: 'misrouted',
    category: 'Long-Haul / Inter-City/Country Transit',
    label: 'Misrouted',
    description: 'Routed incorrectly; being corrected.'
  },

  // Final Delivery Preparation
  {
    id: 'dispatched-for-delivery',
    category: 'Final Delivery Preparation',
    label: 'Dispatched for Delivery',
    description: 'Leaving local facility.'
  },
  {
    id: 'in-local-delivery-facility',
    category: 'Final Delivery Preparation',
    label: 'In Local Delivery Facility',
    description: 'Arrived at last-mile center.'
  },
  {
    id: 'out-for-delivery',
    category: 'Final Delivery Preparation',
    label: 'Out for Delivery',
    description: 'On its way to recipient.'
  },
  {
    id: 'delivery-attempted',
    category: 'Final Delivery Preparation',
    label: 'Delivery Attempted',
    description: 'Attempt made but not successful.'
  },
  {
    id: 'delivery-rescheduled',
    category: 'Final Delivery Preparation',
    label: 'Delivery Rescheduled',
    description: 'New delivery date/time set.'
  },
  {
    id: 'ready-for-pickup',
    category: 'Final Delivery Preparation',
    label: 'Ready for Pickup',
    description: 'Available for pickup at carrier location.'
  },
  {
    id: 'delivery-exception',
    category: 'Final Delivery Preparation',
    label: 'Delivery Exception',
    description: 'Issue preventing normal delivery flow.'
  },

  // Delivery Completion or Exception Handling
  {
    id: 'delivered-successfully',
    category: 'Delivery Completion or Exception Handling',
    label: 'Delivered Successfully',
    description: 'Recipient received the package.'
  },
  {
    id: 'delivery-confirmed',
    category: 'Delivery Completion or Exception Handling',
    label: 'Delivery Confirmed',
    description: 'Delivery confirmed by carrier.'
  },
  {
    id: 'signature-obtained',
    category: 'Delivery Completion or Exception Handling',
    label: 'Signature Obtained',
    description: 'Signature recorded upon delivery.'
  },
  {
    id: 'returned-to-sender',
    category: 'Delivery Completion or Exception Handling',
    label: 'Returned to Sender',
    description: 'Undelivered; returning to origin.'
  },
  {
    id: 'lost-exception',
    category: 'Delivery Completion or Exception Handling',
    label: 'Lost/Exception',
    description: 'Issue reported; under investigation.'
  },
  {
    id: 'damaged-upon-arrival',
    category: 'Delivery Completion or Exception Handling',
    label: 'Damaged Upon Arrival',
    description: 'Damage noted during delivery.'
  }
  ,
  {
    id: 'cancelled',
    category: 'Delivery Completion or Exception Handling',
    label: 'Cancelled',
    description: 'Shipment has been cancelled.'
  }
];
