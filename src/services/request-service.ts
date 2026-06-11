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

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações de transporte no Firestore.
 */
export const requestService = {
  /**
   * Busca todas as solicitações, das mais recentes para as mais antigas.
   */
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch (error) {
      console.error("Error in requestService.getRequests:", error);
      throw new Error("Falha ao carregar solicitações de transporte.");
    }
  },

  /**
   * Cria um novo pedido de transporte.
   */
  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...request,
        createdAt: Timestamp.now().toDate().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error in requestService.addRequest:", error);
      throw new Error("Falha ao criar solicitação de transporte.");
    }
  },

  /**
   * Atualiza o status ou dados operacionais de um pedido.
   */
  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in requestService.updateRequest:", error);
      throw new Error("Falha ao atualizar solicitação.");
    }
  },

  /**
   * Remove ou cancela uma solicitação.
   */
  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error in requestService.deleteRequest:", error);
      throw new Error("Falha ao remover solicitação.");
    }
  }
};
