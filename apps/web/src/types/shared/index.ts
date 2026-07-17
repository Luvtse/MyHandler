// Shared types between frontend and backend
// These types should match the Prisma schema definitions

export type UserRole = 'admin' | 'user' | 'manager' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Shipment related types
export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: Address;
  destination: Address;
  weight: number;
  dimensions: Dimensions;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type ShipmentStatus = string;

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
