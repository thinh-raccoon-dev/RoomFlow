export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'landlord' | 'tenant';
}

export interface Property {
  id: string;
  name: string;
  address: string;
  landlord: string;
  electricityPricePerKwh: number;
  waterPricePerM3: number;
  totalRooms?: number;
  occupiedRooms?: number;
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  property: string | Property;
  floor: number;
  area: number;
  baseRent: number;
  status: 'vacant' | 'occupied';
  description?: string;
}

export interface Contract {
  id: string;
  room: string | Room;
  tenant: string | User;
  startDate: string;
  endDate: string;
  rentPrice: number;
  deposit: number;
  status: 'active' | 'ended' | 'pending';
  notes?: string;
}

export interface UtilityReading {
  id: string;
  room: string | Room;
  month: number;
  year: number;
  electricityOld: number;
  electricityNew: number;
  waterOld: number;
  waterNew: number;
  electricityUsed: number;
  waterUsed: number;
  electricityCost: number;
  waterCost: number;
}

export interface Invoice {
  id: string;
  room: string | Room;
  contract: string | Contract;
  tenant: string | User;
  month: number;
  year: number;
  rentAmount: number;
  electricityCost: number;
  waterCost: number;
  otherFees: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoice: string | Invoice;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'momo' | 'other';
  note?: string;
  paidAt: string;
  collectedBy: string;
}

export interface MaintenanceRequest {
  id: string;
  room: string | Room;
  tenant: string | User;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  images: string[];
  resolvedAt?: string;
  resolvedNote?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  propertyStats: Array<{
    id: string;
    name: string;
    totalRooms: number;
    occupiedRooms: number;
  }>;
  month: number;
  year: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
