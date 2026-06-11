
export type UserRole = 'OPERATOR' | 'DRIVER' | 'ADMIN' | 'SECRETARY';

export interface Patient {
  id: string;
  name: string;
  medicalRecordNumber: string;
  comorbidities: string[];
  needsCompanion: boolean;
  notes?: string;
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
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  available: boolean;
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
  aiRecommendation?: string;
  aiSuggestedAction?: 'approve' | 'deny' | 'escalate' | 'needs_more_info';
}
