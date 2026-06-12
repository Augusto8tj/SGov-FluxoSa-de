
'use client';

import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  limit 
} from "firebase/firestore";
import { DriverReport } from "@/lib/types";

const COLLECTION_NAME = "reports";

// Dados de demonstração estratégica para o Secretário (Rio Claro - RJ)
const MOCK_REPORTS: DriverReport[] = [
  { 
    id: "REP-001", 
    driverId: "D1", 
    driverName: "Carlos Alberto Silva", 
    vehicleId: "V1 (Ambulância)", 
    content: "O odômetro da V1 está apresentando ruído metálico leve após a curva de Lídice. Sugiro revisão preventiva na suspensão antes da próxima escala.", 
    timestamp: new Date().toISOString(), 
    read: false 
  },
  { 
    id: "REP-002", 
    driverId: "D2", 
    driverName: "Marcos Pereira", 
    vehicleId: "V2 (Van)", 
    content: "Paciente Maria Souza transportada com sucesso. Rota tranquila. O paciente elogiou a agilidade de consulta via Portal do Cidadão.", 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    read: true 
  },
  { 
    id: "REP-003", 
    driverId: "D3", 
    driverName: "Ricardo Oliveira", 
    vehicleId: "V3 (Acessível)", 
    content: "Atraso de 15 minutos na chegada à UBS Passa Três devido à manutenção na rede elétrica da estrada. Todos os pacientes avisados e seguros.", 
    timestamp: new Date(Date.now() - 7200000).toISOString(), 
    read: false 
  },
  { 
    id: "REP-004", 
    driverId: "D1", 
    driverName: "Carlos Alberto Silva", 
    vehicleId: "V1 (Ambulância)", 
    content: "Solicito reposição de insumos básicos: luvas descartáveis e máscaras cirúrgicas para o kit de primeiros socorros da viatura V1.", 
    timestamp: new Date(Date.now() - 10800000).toISOString(), 
    read: true 
  },
  { 
    id: "REP-005", 
    driverId: "D2", 
    driverName: "Marcos Pereira", 
    vehicleId: "V2 (Van)", 
    content: "Checklist de segurança matinal concluído. Veículo totalmente higienizado conforme protocolo PMRC e abastecido para o turno.", 
    timestamp: new Date(Date.now() - 14400000).toISOString(), 
    read: false 
  },
];

/**
 * @fileOverview Serviço para gestão de relatórios de campo (feedbacks dos motoristas).
 */
export const reportService = {
  /**
   * Envia um novo relatório de campo.
   */
  async addReport(report: Omit<DriverReport, "id" | "read">): Promise<string> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
        const id = `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        MOCK_REPORTS.unshift({ id, ...report, read: false });
        return id;
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...report,
        read: false
      });
      return docRef.id;
    } catch (error: any) {
      console.error("Error adding report:", error);
      throw new Error("Falha ao enviar relatório para a Secretaria.");
    }
  },

  /**
   * Lista os relatórios para a Secretaria.
   */
  async getReports(): Promise<DriverReport[]> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return [...MOCK_REPORTS];
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DriverReport));
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      return []; // Silencioso para não quebrar a UI
    }
  },

  /**
   * Marca um relatório como lido/visto pelo Secretário.
   */
  async markAsRead(id: string): Promise<void> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
        const report = MOCK_REPORTS.find(r => r.id === id);
        if (report) report.read = true;
        return Promise.resolve();
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { read: true });
    } catch (error: any) {
      console.error("Error updating report status:", error);
    }
  }
};
