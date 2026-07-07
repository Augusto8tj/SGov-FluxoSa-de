
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit,
  addDoc
} from "firebase/firestore";

const COLLECTION_NAME = "audit_logs";

export const auditService = {
  async getLogs(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Audit Service Error:", error);
      return [];
    }
  },

  async logAction(data: { userId: string, userEmail: string, action: string, resource: string, ip: string, status: 'SUCCESS' | 'WARNING' | 'ERROR' }) {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log action", e);
    }
  }
};
