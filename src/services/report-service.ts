
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

/**
 * @fileOverview Serviço para gestão de relatórios de campo (feedbacks dos motoristas).
 */
export const reportService = {
  /**
   * Envia um novo relatório de campo.
   */
  async addReport(report: Omit<DriverReport, "id" | "read">): Promise<string> {
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
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { read: true });
    } catch (error: any) {
      console.error("Error updating report status:", error);
    }
  }
};
