
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
  writeBatch
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações otimizado para resposta instantânea.
 * Removida lógica de verificação dupla de cache para acelerar leituras em bancos vazios.
 */
export const requestService = {
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      
      // Chamada direta ao Firestore: o SDK gerencia o cache internamente de forma eficiente
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch (error) {
      console.error("Firestore Error (Requests):", error);
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
    } catch (error) {
      console.error("Access Code Error:", error);
      return null;
    }
  },

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    try {
      const now = new Date().toISOString();
      const patientAccessCode = Math.floor(100000 + Math.random() * 900000).toString();

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...request,
        patientAccessCode,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error("Add Request Error:", error);
      throw new Error("Falha ao criar nova solicitação no Firestore.");
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
      throw new Error(`Falha ao atualizar solicitação real.`);
    }
  },

  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Falha ao remover solicitação real.");
    }
  },

  async createManifestBatch(assignments: any[]): Promise<void> {
    const batch = writeBatch(db);
    
    assignments.forEach((assign) => {
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
