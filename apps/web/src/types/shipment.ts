
export type Currency = 'USD' | 'EUR' | 'ETB' | 'CNY';

export interface CommodityItem {
  description: string;
  quantity: number;
  weight: number;
  value: number;
  currency: Currency;
  hsCode?: string;
}

export interface PackageDetails {
  length: number;
  width: number;
  height: number;
  quantity: number;
}

export interface ShipmentOptions {
  insurance: boolean;
  signature: boolean;
  fragile: boolean;
  saturday: boolean;
}

export interface Address {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ChargesInformation {
  amount: number;
  currency: Currency;
}

export type PaymentType = 'prepaid' | 'collect' | 'account';
export type PackageType = 'envelope' | 'box' | 'carton' | 'tube' | 'pallet';
export type ServiceType = 'express-domestic' | 'express-worldwide' | 'priority' | 'standard' | 'economy';

export type ShipmentStatus = string;

export interface Shipment {
  id: string;
  awbNumber: string;
  createdAt: string;
  sender: Address;
  recipient: Address;
  packageType: PackageType;
  serviceType: ServiceType;
  packageDetails?: PackageDetails;
  commodities: CommodityItem[];
  options: ShipmentOptions;
  specialInstructions?: string;
  paymentType: PaymentType;
  accountNumber?: string;
  chargesInformation?: ChargesInformation;
  totalWeight: number;
  totalValue: number;
  totalCurrency: Currency;
}
