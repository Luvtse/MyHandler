// AWB Data Types

export type CopyType = 'Client' | 'Customs' | 'Company';

export interface AWBData {
  awbNumber: string;
  date: string;
  time: string;
  serviceType: string;
  weight: string;
  pieces: string;
  price: string;
  certificationInfo: string;
  sender: {
    name: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    country: string;
    telephone: string;
  };
  recipient: {
    name: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    country: string;
    telephone: string;
  };
  commodities: Array<{
    description: string;
    hsCode: string;
    quantity: string;
    weightKg: string;
    unitPrice: string;
    totalValue: string;
  }>;
}
