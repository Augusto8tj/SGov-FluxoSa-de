/**
 * @fileOverview Definições de tipos globais para o sistema SGov FluxoSaúde.
 * Inclui entidades de domínio, perfis de acesso e estados operacionais.
 */

export type UserRole = 'UBS_MANAGER' | 'DRIVER' | 'ADMIN' | 'SECRETARY';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  unitId?: string; // ID da UBS (relevante apenas para UBS_MANAGER)
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  medicalRecordNumber: string;
  comorbidities: string[];
  needsCompanion: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  available: boolean;
  status?: 'AVAILABLE' | 'ON_ROUTE' | 'OFF_DUTY';
  createdAt?: string;
  updatedAt?: string;
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
  operatorId: string; // ID do usuário que criou/gerencia o pedido
  createdAt: string;
  updatedAt?: string;
  
  // Campos operacionais para escala e roteirização
  driverId?: string;
  vehicleId?: string;
  assignedAt?: string;
  manifestId?: string;
  pickupLocationCoords?: { lat: number; lng: number };
  destinationLocationCoords?: { lat: number; lng: number };
  
  // Suporte à IA (Preservando compatibilidade com fluxos Genkit)
  aiRecommendation?: string;
  aiSuggestedAction?: 'approve' | 'deny' | 'escalate' | 'needs_more_info';
  
  // TODO: Implementar trilha de auditoria para mudanças de status
}
