
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
  writeBatch
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";
import { MOCK_REQUESTS } from "@/lib/mock-data";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações de transporte no Firestore.
 * Suporta fallback para dados de demonstração quando o banco está vazio.
 */
export const requestService = {
  /**
   * Busca todas as solicitações. Retorna mocks se o banco estiver vazio.
   */
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return MOCK_REQUESTS;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch (error) {
      console.warn("Firestore error, falling back to mocks:", error);
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
        // Busca nos mocks para demonstração
        return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
      }

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as TransportRequest;
    } catch (error) {
      console.error("Error searching by access code:", error);
      return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
    }
  },

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    try {
      const now = Timestamp.now().toDate().toISOString();
      // Geração de código simples de 6 dígitos para o paciente
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
