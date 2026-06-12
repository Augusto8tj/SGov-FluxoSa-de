
import { Patient, TransportRequest, Vehicle, Driver, UBS } from "./types";

/**
 * @fileOverview Dados de demonstração enriquecidos para o SGov FluxoSaúde.
 * Cenário preparado para simular o volume diário de triagem da Secretaria.
 */

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
  // 15 Pedidos Pendentes para Triagem (Painel de Comando)
  { id: "REQ-001", patientId: "P1", patientName: "Benedito Silva", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "PENDING", requestedTime: "2024-05-25T08:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), aiRecommendation: "Paciente crítico, necessita suporte avançado." },
  { id: "REQ-002", patientId: "P2", patientName: "Maria de Fátima", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Centro Hemodiálise", urgencyLevel: "high", status: "PENDING", requestedTime: "2024-05-25T09:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), aiRecommendation: "Sessão recorrente, transporte essencial." },
  { id: "REQ-003", patientId: "P3", patientName: "José Bonifácio", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: "2024-05-25T10:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-004", patientId: "P4", patientName: "Ana Oliveira", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Clínica Ortopedia", urgencyLevel: "low", status: "PENDING", requestedTime: "2024-05-25T10:30:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-005", patientId: "P5", patientName: "Wilson Oliveira", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Municipal", urgencyLevel: "high", status: "PENDING", requestedTime: "2024-05-25T11:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), aiRecommendation: "Uso de O2 portátil relatado pela unidade." },
  { id: "REQ-006", patientId: "P6", patientName: "Carlos Drummond", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Centro Reabilitação", urgencyLevel: "medium", status: "PENDING", requestedTime: "2024-05-25T11:30:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-007", patientId: "P7", patientName: "Cecília Meireles", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Oncologia Regional", urgencyLevel: "high", status: "PENDING", requestedTime: "2024-05-25T13:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), aiRecommendation: "Tratamento quimioterápico. Paciente debilitado." },
  { id: "REQ-008", patientId: "P8", patientName: "Machado de Assis", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "PENDING", requestedTime: "2024-05-25T14:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-009", patientId: "P9", patientName: "Clarice Lispector", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: "2024-05-25T14:30:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-010", patientId: "P10", patientName: "Guimarães Rosa", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Clínica Especializada", urgencyLevel: "low", status: "PENDING", requestedTime: "2024-05-25T15:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-011", patientId: "P11", patientName: "Graciliano Ramos", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "PENDING", requestedTime: "2024-05-25T08:30:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), aiRecommendation: "Urgência clínica elevada pós-exame." },
  { id: "REQ-012", patientId: "P12", patientName: "Rachel de Queiroz", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Regional", urgencyLevel: "high", status: "PENDING", requestedTime: "2024-05-25T09:45:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-013", patientId: "P13", patientName: "Jorge Amado", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Fisioterapia", urgencyLevel: "medium", status: "PENDING", requestedTime: "2024-05-25T11:15:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-014", patientId: "P14", patientName: "Érico Veríssimo", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "PENDING", requestedTime: "2024-05-25T15:30:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
  { id: "REQ-015", patientId: "P15", patientName: "Lygia Fagundes", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: "2024-05-25T16:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString() },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: "V1", type: "Ambulância", licensePlate: "ABC-1234", capacity: 2, available: true, status: 'AVAILABLE', odometer: 12450, fuelLevel: 85, lastMaintenance: "2024-04-12", nextMaintenance: "2024-06-15", insuranceExpiry: "2024-12-31", lastSanitization: "2024-05-20 07:00", assignedDriverName: "Carlos Alberto Silva" },
  { id: "V2", type: "Van", licensePlate: "XYZ-5678", capacity: 12, available: true, status: 'AVAILABLE', odometer: 45600, fuelLevel: 40, lastMaintenance: "2024-03-05", nextMaintenance: "2024-07-10", insuranceExpiry: "2024-10-15", lastSanitization: "2024-05-20 06:30" },
  { id: "V3", type: "Acessível", licensePlate: "LMN-3456", capacity: 1, available: true, status: 'AVAILABLE', odometer: 8900, fuelLevel: 95, lastMaintenance: "2024-05-01", nextMaintenance: "2024-08-01", insuranceExpiry: "2025-01-20", lastSanitization: "2024-05-20 08:15" },
  { id: "V4", type: "Sedan", licensePlate: "GHI-9012", capacity: 4, available: true, status: 'AVAILABLE', odometer: 15200, fuelLevel: 100, lastSanitization: "2024-05-25 07:00" },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "D1", name: "Carlos Alberto Silva", licenseNumber: "123456789", phone: "(19) 99123-4567", available: true, status: 'AVAILABLE' },
  { id: "D2", name: "Marcos Pereira", licenseNumber: "987654321", phone: "(19) 98765-4321", available: true, status: 'AVAILABLE' },
  { id: "D3", name: "Ana Cláudia", licenseNumber: "456123789", phone: "(19) 99888-7766", available: true, status: 'AVAILABLE' },
  { id: "D4", name: "Ricardo Oliveira", licenseNumber: "789456123", phone: "(19) 99777-1122", available: true, status: 'AVAILABLE' },
];

export const MOCK_UBS: UBS[] = [
  { id: "UBS-01", name: "UBS Central", address: "Av. 29, 123 - Centro", location: { lat: -22.7214, lng: -44.1322 }, managerName: "Dra. Helena Souza", phone: "(24) 3332-1001", email: "ubs.central@rioclaro.rj.gov.br", operatingHours: "07:00 - 17:00", type: "UBS", status: "active" },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Distrito de Passa Três", location: { lat: -22.7931, lng: -44.0244 }, managerName: "Enf. Marcos Lima", phone: "(24) 3332-2002", email: "ubs.passatres@rioclaro.rj.gov.br", operatingHours: "08:00 - 16:00", type: "UBS", status: "active" },
  { id: "UBS-03", name: "UBS Lídice", address: "Distrito de Lídice", location: { lat: -22.8455, lng: -44.2312 }, managerName: "Dra. Ana Paula Costa", phone: "(24) 3332-3003", email: "ubs.lidice@rioclaro.rj.gov.br", operatingHours: "07:30 - 17:30", type: "UBS", status: "active" },
];
