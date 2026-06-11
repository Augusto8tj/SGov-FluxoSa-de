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
 * Gerencia o ciclo de vida dos pedidos, desde a criação até a finalização/cancelamento.
 */
export const requestService = {
  /**
   * Busca todas as solicitações, das mais recentes para as mais antigas.
   * @returns Lista de TransportRequest.
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
      throw new Error("Falha ao carregar solicitações de transporte do servidor.");
    }
  },

  /**
   * Cria um novo pedido de transporte.
   * @param request Dados da solicitação sem o ID.
   * @returns ID do documento criado.
   */
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
      console.error("Error in requestService.addRequest:", error);
      throw new Error("Falha ao criar nova solicitação de transporte.");
    }
  },

  /**
   * Atualiza o status ou dados operacionais de um pedido.
   * @param id ID do pedido.
   * @param data Campos a serem atualizados.
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
      throw new Error(`Falha ao atualizar solicitação ${id}.`);
    }
  },

  /**
   * Remove ou cancela uma solicitação.
   * @param id ID do pedido.
   */
  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error in requestService.deleteRequest:", error);
      throw new Error("Falha ao remover ou cancelar solicitação.");
    }
  }
};
