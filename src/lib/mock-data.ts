
import { Patient, TransportRequest, Vehicle, Driver, UBS } from "./types";

/**
 * @fileOverview Dados de demonstração enriquecidos para o SGov FluxoSaúde.
 * Cenário preparado para apresentação ao Secretário de Saúde.
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
  { id: "P16", name: "Ariano Suassuna", medicalRecordNumber: "666.666.666-66", comorbidities: ["Renal"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P17", name: "Mário de Andrade", medicalRecordNumber: "777.777.777-77", comorbidities: ["Diabetes"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P18", name: "Oswald de Andrade", medicalRecordNumber: "888.888.888-88", comorbidities: ["Geral"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P19", name: "Manuel Bandeira", medicalRecordNumber: "999.999.999-99", comorbidities: ["DPOC"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P20", name: "Vinícius de Moraes", medicalRecordNumber: "000.000.000-00", comorbidities: ["Cardiopata"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P21", name: "Tarsila do Amaral", medicalRecordNumber: "101.101.101-10", comorbidities: ["Geral"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P22", name: "Anita Malfatti", medicalRecordNumber: "202.202.202-20", comorbidities: ["Fisioterapia"], needsCompanion: true, createdAt: new Date().toISOString() },
  { id: "P23", name: "Candido Portinari", medicalRecordNumber: "303.303.303-30", comorbidities: ["Oncologia"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P24", name: "Di Cavalcanti", medicalRecordNumber: "404.404.404-40", comorbidities: ["Hipertensão"], needsCompanion: false, createdAt: new Date().toISOString() },
  { id: "P25", name: "Lygia Clark", medicalRecordNumber: "505.505.505-50", comorbidities: ["Reabilitação"], needsCompanion: true, createdAt: new Date().toISOString() },
];

export const MOCK_REQUESTS: TransportRequest[] = [
  // --- MANIFESTOS EXISTENTES (APROVADOS) ---
  { 
    id: "REQ-001", patientId: "P1", patientName: "Benedito Silva", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "APPROVED", requestedTime: "2024-05-25T08:00:00Z", operatorId: "ADMIN", createdAt: new Date().toISOString(), manifestId: "MF-2024-001", vehicleId: "Ambulância (V1)", driverId: "Carlos Alberto Silva", assignedAt: new Date().toISOString(), patientAccessCode: "123456" 
  },
  { 
    id: "REQ-206", patientId: "P12", patientName: "Rachel de Queiroz", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "high", status: "APPROVED", requestedTime: "2024-05-25T08:15:00Z", operatorId: "ADMIN", createdAt: new Date().toISOString(), manifestId: "MF-2024-001", vehicleId: "Ambulância (V1)", driverId: "Carlos Alberto Silva", assignedAt: new Date().toISOString(), patientAccessCode: "777000"
  },
  { 
    id: "REQ-214", patientId: "P20", patientName: "Vinícius de Moraes", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Regional", urgencyLevel: "high", status: "APPROVED", requestedTime: "2024-05-25T08:30:00Z", operatorId: "ADMIN", createdAt: new Date().toISOString(), manifestId: "MF-2024-001", vehicleId: "Ambulância (V1)", driverId: "Carlos Alberto Silva", assignedAt: new Date().toISOString(), patientAccessCode: "606606"
  },
  { 
    id: "REQ-002", patientId: "P2", patientName: "Maria de Fátima", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "high", status: "APPROVED", requestedTime: "2024-05-25T09:00:00Z", operatorId: "UBS_MGR", createdAt: new Date().toISOString(), manifestId: "MF-2024-002", vehicleId: "Van (V2)", driverId: "Marcos Pereira", assignedAt: new Date().toISOString(), patientAccessCode: "654321"
  },

  // --- NOVAS SOLICITAÇÕES PENDENTES (PARA O PAINEL DE COMANDO) ---
  { 
    id: "REQ-300", patientId: "P10", patientName: "Guimarães Rosa", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 3600000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "300300",
    aiRecommendation: "Paciente idoso com dificuldades de locomoção. Necessita de transporte para consulta de rotina pós-cirúrgica."
  },
  { 
    id: "REQ-301", patientId: "P11", patientName: "Graciliano Ramos", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Clínica de Olhos", urgencyLevel: "low", status: "PENDING", requestedTime: new Date(Date.now() + 7200000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "301301",
    aiRecommendation: "Exames oftalmológicos de rotina. Paciente estável."
  },
  { 
    id: "REQ-302", patientId: "P23", patientName: "Candido Portinari", ubsId: "UBS-02", pickupLocation: "UBS Rio Claro Sul", destinationLocation: "Oncologia", urgencyLevel: "high", status: "PENDING", requestedTime: new Date(Date.now() + 10800000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "302302",
    aiRecommendation: "Sessão de quimioterapia. Apresenta náuseas e fraqueza. Protocolo Rio Claro sugere prioridade alta."
  },
  { 
    id: "REQ-303", patientId: "P15", patientName: "Lygia Fagundes", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Centro de Fisioterapia", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 14400000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "303303",
    aiRecommendation: "Recuperação ortopédica. Requer veículo com acessibilidade para muletas."
  },
  { 
    id: "REQ-304", patientId: "P16", patientName: "Ariano Suassuna", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Centro de Hemodiálise", urgencyLevel: "critical", status: "PENDING", requestedTime: new Date(Date.now() + 18000000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "304304",
    aiRecommendation: "Insuficiência renal aguda. Perdeu a sessão anterior por febre. Requer monitoramento contínuo durante trajeto."
  },
  { 
    id: "REQ-305", patientId: "P17", patientName: "Mário de Andrade", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Municipal", urgencyLevel: "low", status: "PENDING", requestedTime: new Date(Date.now() + 21600000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "305305",
    aiRecommendation: "Ajuste de medicação para diabetes. Sem queixas agudas."
  },
  { 
    id: "REQ-306", patientId: "P18", patientName: "Oswald de Andrade", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 25200000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "306306",
    aiRecommendation: "Retorno pós-exames laboratoriais. Requer acompanhante."
  },
  { 
    id: "REQ-307", patientId: "P19", patientName: "Manuel Bandeira", ubsId: "UBS-02", pickupLocation: "UBS Rio Claro Sul", destinationLocation: "Hospital Municipal", urgencyLevel: "high", status: "PENDING", requestedTime: new Date(Date.now() + 28800000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "307307",
    aiRecommendation: "Crise leve de DPOC. Estável no momento mas requer suporte de oxigênio disponível na viatura."
  },
  { 
    id: "REQ-308", patientId: "P21", patientName: "Tarsila do Amaral", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Clínica Ortopédica", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 32400000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "308308",
    aiRecommendation: "Troca de gesso e avaliação de consolidação óssea."
  },
  { 
    id: "REQ-309", patientId: "P22", patientName: "Anita Malfatti", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Centro de Reabilitação", urgencyLevel: "low", status: "PENDING", requestedTime: new Date(Date.now() + 36000000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "309309",
    aiRecommendation: "Sessão de hidroterapia. Paciente possui autonomia."
  },
  { 
    id: "REQ-310", patientId: "P24", patientName: "Di Cavalcanti", ubsId: "UBS-02", pickupLocation: "UBS Passa Três", destinationLocation: "Hospital Regional", urgencyLevel: "high", status: "PENDING", requestedTime: new Date(Date.now() + 39600000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "310310",
    aiRecommendation: "Avaliação cardiológica urgente para ajuste de marca-passo."
  },
  { 
    id: "REQ-311", patientId: "P25", patientName: "Lygia Clark", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Municipal", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 43200000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "311311",
    aiRecommendation: "Fisioterapia respiratória. Pós-COVID persistente."
  },
  { 
    id: "REQ-312", patientId: "P4", patientName: "Ana Oliveira", ubsId: "UBS-03", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", urgencyLevel: "critical", status: "PENDING", requestedTime: new Date(Date.now() + 46800000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "312312",
    aiRecommendation: "Pós-operatório imediato de grande porte. Requer ambulância equipada e maca."
  },
  { 
    id: "REQ-313", patientId: "P3", patientName: "José Bonifácio", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 50400000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "313313",
    aiRecommendation: "Exame de imagem (Ressonância). Paciente claustrofóbico, necessita acompanhante."
  },
  { 
    id: "REQ-314", patientId: "P9", patientName: "Clarice Lispector", ubsId: "UBS-02", pickupLocation: "UBS Rio Claro Sul", destinationLocation: "Centro Materno Infantil", urgencyLevel: "medium", status: "PENDING", requestedTime: new Date(Date.now() + 54000000).toISOString(), operatorId: "UBS_MGR", createdAt: new Date().toISOString(), patientAccessCode: "314314",
    aiRecommendation: "Revisão pós-parto. Leva recém-nascido. Requer veículo higienizado."
  },

  // --- OUTROS STATUS ---
  { id: "REQ-100", patientId: "P6", patientName: "Carlos Drummond", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Regional", urgencyLevel: "medium", status: "APPROVED", requestedTime: new Date(Date.now() + 14400000).toISOString(), operatorId: "ADMIN", createdAt: new Date().toISOString(), patientAccessCode: "101010" },
  { id: "REQ-203", patientId: "P24", patientName: "Di Cavalcanti", ubsId: "UBS-01", pickupLocation: "UBS Central", destinationLocation: "Hospital Municipal", urgencyLevel: "medium", status: "COMPLETED", requestedTime: new Date(Date.now() - 86400000).toISOString(), operatorId: "ADMIN", createdAt: new Date(Date.now() - 86400000).toISOString(), manifestId: "MF-2024-009", vehicleId: "Van (V2)", driverId: "Marcos Pereira", assignedAt: new Date(Date.now() - 86400000).toISOString(), patientAccessCode: "444000" }
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
