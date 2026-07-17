// src/types/fleet.types.ts

// ========================
// 🔑 Core Enums
// ========================

export type UserRole =
  | 'admin'
  | 'driver'
  | 'warehouse'
  | 'finance'
  | 'report'
  | 'hr_manager'
  | 'hr_staff'
  | 'service_point_agent'
  | 'customer'
  | 'operations'
  | 'fleet_manager';

export type VehicleType = 'van' | 'truck' | 'motorbike' | 'car';
export type VehicleStatus = 'active' | 'maintenance' | 'decommissioned' | 'idle';

export type MaintenanceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'full_inspection'
  | 'other';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// ========================
// 🚛 Vehicle Data
// ========================

// Correct Vehicle interface (based on Prisma)
export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  vin: string;
  capacityKg: number;
  currentMileage: number;
  lastMaintenanceDate?: string | null; // ← computed, not in DB
  nextMaintenanceMileage: number;
  fuelLevel: number;
  currentLocation: string;
  status: VehicleStatus;
  driverId: string | null;
  driverName?: string | null; // ← computed via join, not in DB
  driverEmail?: string | null;
  fleetManagerId: string | null;
  fleetManagerName?: string | null;
  lastPing: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  totalTrips: number;
  totalDistance: number;
  createdAt: string;
  updatedAt: string;
  location: string; // alias for currentLocation?
}

// Extended for vehicle detail page
export interface VehicleWithMaintenance extends Vehicle {
  plateNumber: string; // alias for licensePlate?
  vehicleDetail: string; // required
  licensePlate: string; // required
  type: VehicleType;
  maintenanceHistory: MaintenanceRecord[];
  upcomingServices: string[];
  insuranceExpiry: string; // ISO
  registrationExpiry: string; // ISO
  deletedAt: string | null;
  totalTrips: number;
  totalDistance: number;
}

// ========================
// 🔧 Maintenance Records
// ========================

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledAt: string; // ISO
  completedAt: string | null; // ISO
  mileageAtService: number;
  cost: number | null; // ETB
  notes: string | null;
  vendor: string | null;
  performedById: string | null;
  performedByName: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  calendarSyncButton: string;
  lastMaintenanceDate: string | null; // ISO
}

// ========================
// 📊 Dashboard Metrics
// ========================

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesDueMaintenance: number;
  avgFuelConsumption: number; // L/100km (or omit if not used)
  utilizationRate: number; // percentage (e.g., 85.2)
}

// ========================
// 🗓️ Calendar Integration
// ========================

export interface MaintenanceCalendarEvent {
  id: string;
  title: string; // e.g., "🔧 ADD-1234"
  start: string; // ISO
  end: string; // ISO
  vehicleId: string;
  plateNumber: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  assignedMechanic: string | null;
  calendarSyncButton: string;
}

// ========================
// ✍️ Form DTOs (User Input)
// ========================

export interface CreateMaintenanceDto {
  vehicleId: string;
  type: MaintenanceType;
  scheduledAt: string; // ISO date string
  mileageAtService: number;
  notes?: string;
  vendor?: string;
  estimatedCost?: number;
}

// ========================
// 📥 API Response Structure
// ========================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Common response payloads
export type GetVehiclesResponse = ApiResponse<{ vehicles: Vehicle[] }>;
export type GetFleetMetricsResponse = ApiResponse<{ metrics: FleetMetrics }>;
export type GetVehicleDetailResponse = ApiResponse<{ vehicle: VehicleWithMaintenance }>;
export type ScheduleMaintenanceResponse = ApiResponse<{ record: MaintenanceRecord }>;
export type GetCalendarEventsResponse = ApiResponse<{ events: MaintenanceCalendarEvent[] }>;

// ========================
// 🧩 Fleet Data Snapshot (for hooks)
// ========================

export interface FleetDataSnapshot {
  vehicles: Vehicle[];
  metrics: FleetMetrics;
  lastUpdated: string; // ISO
}