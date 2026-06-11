
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
  Timestamp 
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

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    try {
      const now = Timestamp.now().toDate().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...request,
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
  }
};
