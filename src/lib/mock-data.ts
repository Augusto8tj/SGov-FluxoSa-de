import { Patient, TransportRequest, Vehicle, Driver, UBS } from "./types";

export const MOCK_PATIENTS: Patient[] = [
  { id: "P1", name: "Benedito Silva", medicalRecordNumber: "123.456.789-00", comorbidities: ["Diabetes", "Hipertensão"], needsCompanion: true, notes: "Cadeirante, requer rampa.", createdAt: new Date().toISOString() },
  { id: "P2", name: "Maria de Fátima", medicalRecordNumber: "987.654.321-11", comorbidities: ["Renal Crônico"], needsCompanion: false, notes: "Tratamento de Hemodiálise.", createdAt: new Date().toISOString() },
  { id: "P3", name: "José Bonifácio", medicalRecordNumber: "456.789.123-44", comorbidities: ["Cardiopata"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P4", name: "Ana Oliveira", medicalRecordNumber: "321.654.987-22", comorbidities: ["Pós-Operatório"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P5", name: "Wilson Oliveira", medicalRecordNumber: "789.456.123-33", comorbidities: ["DPOC"], needsCompanion: false, notes: "Uso eventual de O2.", createdAt: new Date().toISOString() },
  { id: "P6", name: "Carlos Drummond", medicalRecordNumber: "111.222.333-44", comorbidities: ["Ortopedia"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P7", name: "Cecília Meireles", medicalRecordNumber: "555.666.777-88", comorbidities: ["Oncologia"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P8", name: "Machado de Assis", medicalRecordNumber: "999.888.777-66", comorbidities: ["Visão Reduzida"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P9", name: "Clarice Lispector", medicalRecordNumber: "121.212.121-21", comorbidities: ["Pós-parto"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P10", name: "Guimarães Rosa", medicalRecordNumber: "343.343.343-34", comorbidities: ["Idoso / Fragilidade"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P11", name: "Graciliano Ramos", medicalRecordNumber: "111.111.111-11", comorbidities: ["Geral"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P12", name: "Rachel de Queiroz", medicalRecordNumber: "222.222.222-22", comorbidities: ["Diabetes"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P13", name: "Jorge Amado", medicalRecordNumber: "333.333.333-33", comorbidities: ["Cardiopata"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P14", name: "Érico Veríssimo", medicalRecordNumber: "444.444.444-44", comorbidities: ["Hipertensão"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P15", name: "Lygia Fagundes Telles", medicalRecordNumber: "555.555.555-55", comorbidities: ["Fisioterapia"], needsCompanion: true, createdAt: new Date().toISOString() },
];

export const MOCK_REQUESTS: TransportRequest[] = [
  // --- CLUSTER 1: Lídice -> Hospital Municipal (5 Pacientes) ---
  { id: "ORD-001", patientId: "P1", patientName: "Benedito Silva", ubsId: "UBS Lídice", pickupLocation: "Distrito de Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-002", patientId: "P4", patientName: "Ana Oliveira", ubsId: "UBS Lídice", pickupLocation: "Distrito de Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-003", patientId: "P8", patientName: "Machado de Assis", ubsId: "UBS Lídice", pickupLocation: "Distrito de Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "medium", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-004", patientId: "P11", patientName: "Graciliano Ramos", ubsId: "UBS Lídice", pickupLocation: "Distrito de Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-005", patientId: "P15", patientName: "Lygia Fagundes", ubsId: "UBS Lídice", pickupLocation: "Distrito de Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },

  // --- CLUSTER 2: Centro -> Hemodiálise (5 Pacientes) ---
  { id: "ORD-006", patientId: "P2", patientName: "Maria de Fátima", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "high", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-007", patientId: "P5", patientName: "Wilson Oliveira", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "high", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-008", patientId: "P7", patientName: "Cecília Meireles", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "high", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-009", patientId: "P9", patientName: "Clarice Lispector", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "medium", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-010", patientId: "P12", patientName: "Rachel de Queiroz", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },

  // --- CLUSTER 3: Passa Três -> Hospital Regional (5 Pacientes) ---
  { id: "ORD-011", patientId: "P3", patientName: "José Bonifácio", ubsId: "UBS Passa Três", pickupLocation: "Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-012", patientId: "P6", patientName: "Carlos Drummond", ubsId: "UBS Passa Três", pickupLocation: "Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-013", patientId: "P10", patientName: "Guimarães Rosa", ubsId: "UBS Passa Três", pickupLocation: "Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-014", patientId: "P13", patientName: "Jorge Amado", ubsId: "UBS Passa Três", pickupLocation: "Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },
  { id: "ORD-015", patientId: "P14", patientName: "Érico Veríssimo", ubsId: "UBS Passa Três", pickupLocation: "Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "low", status: "APPROVED", requestedTime: new Date().toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString() },

  // Pedidos Pendentes para Triagem
  { id: "PEND-001", patientId: "P1", patientName: "Benedito Silva", ubsId: "UBS Central", pickupLocation: "Centro", destinationLocation: "Clínica Médica", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date().toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: "V1", type: "Ambulância", licensePlate: "ABC-1234", capacity: 2, available: true, status: 'AVAILABLE', odometer: 12450, fuelLevel: 85, lastMaintenance: "2024-04-12", nextMaintenance: "2024-06-15", insuranceExpiry: "2024-12-31", lastSanitization: "2024-05-20 07:00", assignedDriverName: "Carlos Alberto Silva" },
  { id: "V2", type: "Van", licensePlate: "XYZ-5678", capacity: 12, available: true, status: 'AVAILABLE', odometer: 45600, fuelLevel: 40, lastMaintenance: "2024-03-05", nextMaintenance: "2024-07-10", insuranceExpiry: "2024-10-15", lastSanitization: "2024-05-20 06:30" },
  { id: "V3", type: "Acessível", licensePlate: "LMN-3456", capacity: 1, available: true, status: 'AVAILABLE', odometer: 8900, fuelLevel: 95, lastMaintenance: "2024-05-01", nextMaintenance: "2024-08-01", insuranceExpiry: "2025-01-20", lastSanitization: "2024-05-20 08:15" },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "D1", name: "Carlos Alberto Silva", licenseNumber: "123456789", phone: "(19) 99123-4567", available: true, status: 'AVAILABLE' },
  { id: "D2", name: "Marcos Pereira", licenseNumber: "987654321", phone: "(19) 98765-4321", available: true, status: 'AVAILABLE' },
  { id: "D3", name: "Ricardo Oliveira", licenseNumber: "554433221", phone: "(19) 99887-1122", available: true, status: 'AVAILABLE' },
];

export const MOCK_UBS: UBS[] = [
  { id: "UBS-01", name: "UBS Central", address: "Av. 29, 123 - Centro", location: { lat: -22.7214, lng: -44.1322 }, managerName: "Dra. Helena Souza", phone: "(24) 3332-1001", email: "ubs.central@rioclaro.rj.gov.br", operatingHours: "07:00 - 17:00", type: "UBS", status: "active" },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Distrito de Passa Três", location: { lat: -22.7931, lng: -44.0244 }, managerName: "Enf. Marcos Lima", phone: "(24) 3332-2002", email: "ubs.passatres@rioclaro.rj.gov.br", operatingHours: "08:00 - 16:00", type: "UBS", status: "active" },
  { id: "UBS-03", name: "UBS Lídice", address: "Distrito de Lídice", location: { lat: -22.8455, lng: -44.2312 }, managerName: "Dra. Ana Paula Costa", phone: "(24) 3332-3003", email: "ubs.lidice@rioclaro.rj.gov.br", operatingHours: "07:30 - 17:30", type: "UBS", status: "active" },
];
