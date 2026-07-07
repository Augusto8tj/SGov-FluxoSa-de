
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  writeBatch,
  getDocsFromCache
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações operando 100% via Firestore para o Teste Beta.
 */
export const requestService = {
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(q);
        }
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch (error) {
      console.error("Firestore Error:", error);
      return [];
    }
  },

  async getByAccessCode(code: string): Promise<TransportRequest | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("patientAccessCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as TransportRequest;
    } catch {
      return null;
    }
  },

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    try {
      const now = new Date().toISOString();
      // Gera código de acesso único de 6 dígitos
      const patientAccessCode = Math.floor(100000 + Math.random() * 900000).toString();

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...request,
        patientAccessCode,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch {
      throw new Error("Falha ao criar nova solicitação oficial.");
    }
  },

  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error(`Falha ao atualizar solicitação ${id}.`);
    }
  },

  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Falha ao remover solicitação.");
    }
  },

  /**
   * Oficializa múltiplos manifestos em uma única transação atômica.
   */
  async createManifestBatch(assignments: any[]): Promise<void> {
    const batch = writeBatch(db);
    
    assignments.forEach((assign) => {
      // Gera ID de Manifesto único baseado em tempo e viatura
      const manifestId = `MF-${Date.now().toString().slice(-4)}-${String(assign.vehicleId).slice(0, 3).toUpperCase()}`;
      
      assign.route.forEach((requestId: string) => {
        const docRef = doc(db, COLLECTION_NAME, requestId.trim());
        batch.update(docRef, {
          manifestId,
          driverId: assign.driverName,
          vehicleId: assign.vehicleType || assign.vehicleId,
          assignedAt: new Date().toISOString(),
          status: 'APPROVED'
        });
      });
    });

    await batch.commit();
  }
};
