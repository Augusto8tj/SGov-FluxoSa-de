
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit,
  addDoc
} from "firebase/firestore";
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data";

const COLLECTION_NAME = "audit_logs";

/**
 * @fileOverview Serviço de auditoria com suporte a dados mock técnicos para TI.
 */
export const auditService = {
  async getLogs(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fallback para mock se o Firestore estiver vazio (Essencial para demonstração ao Chefe de TI)
      return firestoreData.length > 0 ? firestoreData : MOCK_AUDIT_LOGS;
    } catch {
      console.warn("Audit Service: Firestore offline ou vazio. Usando Mock técnico.");
      return MOCK_AUDIT_LOGS;
    }
  },

  async logAction(data: { userId: string, userEmail: string, action: string, resource: string, ip: string, status: 'SUCCESS' | 'WARNING' | 'ERROR' }) {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log technical action", e);
    }
  }
};
