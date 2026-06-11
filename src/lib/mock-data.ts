
import { Patient, TransportRequest, Vehicle, Driver, UBS } from "./types";

/**
 * @fileOverview Dados de demonstração para o sistema SGov FluxoSaúde.
 * Baseado na geografia e necessidades reais de Rio Claro - RJ.
 */

export const MOCK_PATIENTS: Patient[] = [
  { id: "P1", name: "Benedito Silva", medicalRecordNumber: "123.456.789-00", comorbidities: ["Diabetes", "Hipertensão"], needsCompanion: true, notes: "Cadeirante, requer rampa.", createdAt: new Date().toISOString() },
  { id: "P2", name: "Maria de Fátima", medicalRecordNumber: "987.654.321-11", comorbidities: ["Renal Crônico"], needsCompanion: false, notes: "Tratamento de Hemodiálise.", createdAt: new Date().toISOString() },
  { id: "P3", name: "José Bonifácio", medicalRecordNumber: "456.789.123-44", comorbidities: ["Cardiopata"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P4", name: "Ana Oliveira", medicalRecordNumber: "321.654.987-22", comorbidities: ["Pós-Operatório"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P5", name: "Wilson Oliveira", medicalRecordNumber: "789.456.123-33", comorbidities: ["DPOC"], needsCompanion: false, notes: "Uso eventual de O2.", createdAt: new Date().toISOString() },
];

export const MOCK_REQUESTS: TransportRequest[] = [
  { 
    id: "REQ-001", 
    patientId: "P1", 
    patientName: "Benedito Silva", 
    ubsId: "UBS-03", 
    pickupLocation: "UBS Lídice", 
    destinationLocation: "Hospital Municipal Rio Claro", 
    urgencyLevel: "critical", 
    status: "APPROVED", 
    requestedTime: "2024-05-20T08:00:00Z", 
    operatorId: "ADMIN",
    createdAt: new Date().toISOString()
  },
  { 
    id: "REQ-002", 
    patientId: "P2", 
    patientName: "Maria de Fátima", 
    ubsId: "UBS-01", 
    pickupLocation: "UBS Central", 
    destinationLocation: "Centro de Hemodiálise", 
    urgencyLevel: "high", 
    status: "APPROVED", 
    requestedTime: "2024-05-20T09:30:00Z", 
    operatorId: "UBS_MGR",
    createdAt: new Date().toISOString()
  },
  { 
    id: "REQ-003", 
    patientId: "P3", 
    patientName: "José Bonifácio", 
    ubsId: "UBS-02", 
    pickupLocation: "UBS Passa Três", 
    destinationLocation: "Hospital Regional", 
    urgencyLevel: "medium", 
    status: "PENDING", 
    requestedTime: "2024-05-20T11:00:00Z", 
    operatorId: "UBS_MGR",
    createdAt: new Date().toISOString()
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { 
    id: "V1", 
    type: "Ambulância", 
    licensePlate: "ABC-1234", 
    capacity: 2, 
    available: true, 
    status: 'AVAILABLE',
    odometer: 12450,
    fuelLevel: 85,
    lastMaintenance: "2024-04-12",
    nextMaintenance: "2024-06-15",
    insuranceExpiry: "2024-12-31",
    lastSanitization: "2024-05-20 07:00",
    assignedDriverName: "Carlos Alberto Silva"
  },
  { 
    id: "V2", 
    type: "Van", 
    licensePlate: "XYZ-5678", 
    capacity: 12, 
    available: false, 
    status: 'IN_USE',
    odometer: 45600,
    fuelLevel: 40,
    lastMaintenance: "2024-03-05",
    nextMaintenance: "2024-07-10",
    insuranceExpiry: "2024-10-15",
    lastSanitization: "2024-05-20 06:30",
    assignedDriverName: "Marcos Pereira"
  },
  { 
    id: "V3", 
    type: "Acessível", 
    licensePlate: "LMN-3456", 
    capacity: 1, 
    available: true, 
    status: 'AVAILABLE',
    odometer: 8900,
    fuelLevel: 95,
    lastMaintenance: "2024-05-01",
    nextMaintenance: "2024-08-01",
    insuranceExpiry: "2025-01-20",
    lastSanitization: "2024-05-20 08:15",
    assignedDriverName: "Ana Cláudia"
  },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "D1", name: "Carlos Alberto Silva", licenseNumber: "123456789", phone: "(19) 99123-4567", available: true, status: 'AVAILABLE' },
  { id: "D2", name: "Marcos Pereira", licenseNumber: "987654321", phone: "(19) 98765-4321", available: true, status: 'AVAILABLE' },
];

export const MOCK_UBS: UBS[] = [
  { id: "UBS-01", name: "UBS Central", address: "Av. 29, 123 - Centro", location: { lat: -22.7214, lng: -44.1322 } },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Distrito de Passa Três", location: { lat: -22.7931, lng: -44.0244 } },
  { id: "UBS-03", name: "UBS Lídice", address: "Distrito de Lídice", location: { lat: -22.8455, lng: -44.2312 } },
];
