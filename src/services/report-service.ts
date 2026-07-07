
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
  limit,
  writeBatch
} from "firebase/firestore";
import { DriverReport, BoardingLog } from "@/lib/types";

const COLLECTION_NAME = "reports";

/**
 * @fileOverview Serviço de relatórios e SOS operando 100% em tempo real.
 */
export const reportService = {
  async addReport(report: Omit<DriverReport, "id" | "read">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...report,
        read: false,
        type: report.type || 'NORMAL'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding report:", error);
      throw new Error("Falha ao enviar relatório oficial.");
    }
  },

  async addBoardingLog(log: BoardingLog): Promise<void> {
    try {
      // Logs de embarque são salvos em uma coleção auditável
      await addDoc(collection(db, "boarding_logs"), log);
    } catch (error) {
      console.error("Error logging boarding:", error);
    }
  },

  async getReports(): Promise<DriverReport[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DriverReport));
    } catch (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  },

  async markManyAsRead(ids: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const ref = doc(db, COLLECTION_NAME, id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error in batch mark as read:", error);
    }
  }
};
