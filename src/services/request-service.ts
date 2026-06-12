
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
  Timestamp,
  writeBatch,
  getDocsFromCache,
  getDocsFromServer
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";
import { MOCK_REQUESTS } from "@/lib/mock-data";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações de transporte no Firestore.
 * Otimizado para demonstrar agilidade no carregamento de dados mock.
 */
export const requestService = {
  /**
   * Busca todas as solicitações. Retorna mocks instantaneamente se o banco estiver vazio.
   */
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      
      // Tenta primeiro carregar do cache para agilidade máxima
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
      } catch {
        // Se falhar o cache, tenta servidor com timeout curto implícito
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return MOCK_REQUESTS;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch (error) {
      // Falha rápida redireciona para mocks imediatamente
      return MOCK_REQUESTS;
    }
  },

  /**
   * Busca uma solicitação pelo código de acesso do paciente.
   */
  async getByAccessCode(code: string): Promise<TransportRequest | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("patientAccessCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
      }

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as TransportRequest;
    } catch (error) {
      return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
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
      console.error("Error adding request:", error);
      throw new Error("Falha ao criar nova solicitação.");
    }
  },

  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating request:", error);
      throw new Error(`Falha ao atualizar solicitação ${id}.`);
    }
  },

  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting request:", error);
      throw new Error("Falha ao remover solicitação.");
    }
  },

  /**
   * Atualiza múltiplas solicitações para atribuir um manifesto em lote.
   */
  async createManifestBatch(assignments: any[]): Promise<void> {
    const batch = writeBatch(db);
    
    assignments.forEach((assign) => {
      const manifestId = `MF-${Date.now().toString().slice(-6)}-${assign.vehicleId}`;
      assign.route.forEach((requestId: string) => {
        // Ignora se for ID de mock que começa com REQ-
        if (requestId.startsWith('REQ-')) return;
        
        const docRef = doc(db, COLLECTION_NAME, requestId);
        batch.update(docRef, {
          manifestId,
          driverId: assign.driverName,
          vehicleId: assign.vehicleType,
          assignedAt: new Date().toISOString(),
          status: 'APPROVED'
        });
      });
    });

    await batch.commit();
  }
};
