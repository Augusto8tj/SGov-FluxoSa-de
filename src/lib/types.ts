export type UserRole = 'OPERATOR' | 'DRIVER' | 'ADMIN' | 'SECRETARY';

export interface Patient {
  id: string;
  name: string;
  medicalRecordNumber: string;
  comorbidities: string[];
  needsCompanion: boolean;
  notes?: string;
  createdAt?: string;
}

export interface UBS {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
}

export interface Vehicle {
  id: string;
  type: 'Ambulância' | 'Van' | 'Sedan' | 'Acessível';
  licensePlate: string;
  capacity: number;
  available: boolean;
  status?: 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  available: boolean;
  status?: 'AVAILABLE' | 'ON_ROUTE' | 'OFF_DUTY';
}

export type TransportStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'COMPLETED' | 'CANCELLED';

export interface TransportRequest {
  id: string;
  patientId: string;
  patientName: string;
  ubsId: string;
  pickupLocation: string;
  destinationLocation: string;
  requestedTime: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: TransportStatus;
  operatorId: string;
  createdAt: string;
  
  // Campos operacionais adicionados para escala e roteirização
  driverId?: string;
  vehicleId?: string;
  assignedAt?: string;
  manifestId?: string;
  pickupLocationCoords?: { lat: number; lng: number };
  destinationLocationCoords?: { lat: number; lng: number };
  
  // Suporte à IA
  aiRecommendation?: string;
  aiSuggestedAction?: 'approve' | 'deny' | 'escalate' | 'needs_more_info';
}
