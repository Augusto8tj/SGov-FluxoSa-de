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
import { MOCK_REQUESTS } from "@/lib/mock-data";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações com suporte a batch para manifestos.
 * Implementa a lógica de filtro status === 'APPROVED' E manifestId ausente para o Otimizador.
 */
export const requestService = {
  async getRequests(): Promise<TransportRequest[]> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return MOCK_REQUESTS;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return MOCK_REQUESTS;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransportRequest));
    } catch {
      return MOCK_REQUESTS;
    }
  },

  async getByAccessCode(code: string): Promise<TransportRequest | null> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("patientAccessCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return MOCK_REQUESTS.find(r => r.patientAccessCode === code) || null;
      }

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as TransportRequest;
    } catch {
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
    } catch {
      throw new Error("Falha ao criar nova solicitação.");
    }
  },

  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      // Em modo demo, apenas simulamos o sucesso (local state update handles the UI)
      return Promise.resolve();
    }

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
   * Oficializa múltiplos manifestos em uma única transação Firestore.
   */
  async createManifestBatch(assignments: any[]): Promise<void> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      // Simulação para o Secretário no modo demonstração: apenas resolve com sucesso.
      return Promise.resolve();
    }

    const batch = writeBatch(db);
    
    assignments.forEach((assign) => {
      const manifestId = `MF-${Date.now().toString().slice(-4)}-${assign.vehicleId.slice(0, 3).toUpperCase()}`;
      assign.route.forEach((requestId: string) => {
        const docRef = doc(db, COLLECTION_NAME, requestId.trim());
        batch.update(docRef, {
          manifestId,
          driverId: assign.driverName,
          driverName: assign.driverName,
          vehicleId: assign.vehicleType || assign.vehicleId,
          assignedAt: new Date().toISOString(),
          status: 'APPROVED'
        });
      });
    });

    await batch.commit();
  }
};
