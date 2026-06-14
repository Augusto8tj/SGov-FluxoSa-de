
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
import { MOCK_REQUESTS, MOCK_VEHICLES } from "@/lib/mock-data";

const COLLECTION_NAME = "requests";

/**
 * @fileOverview Serviço de gestão de solicitações com suporte a batch para manifestos.
 * Implementa simulação de persistência para o modo demonstração.
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
    // Check mock first for instant response in demo environment
    const mockMatch = MOCK_REQUESTS.find(r => r.patientAccessCode === code);
    if (mockMatch) return mockMatch;

    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return null;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("patientAccessCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as TransportRequest;
    } catch {
      // Final fallback to mock if firebase fails
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
      const index = MOCK_REQUESTS.findIndex(r => r.id === id);
      if (index !== -1) {
        MOCK_REQUESTS[index] = { ...MOCK_REQUESTS[index], ...data, updatedAt: new Date().toISOString() };
      }
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
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      const index = MOCK_REQUESTS.findIndex(r => r.id === id);
      if (index !== -1) {
        MOCK_REQUESTS.splice(index, 1);
      }
      return Promise.resolve();
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Falha ao remover solicitação.");
    }
  },

  /**
   * Oficializa múltiplos manifestos em uma única transação.
   * Em modo demo, atualiza o array MOCK_REQUESTS em memória para que a fila de espera reflita as mudanças.
   */
  async createManifestBatch(assignments: any[]): Promise<void> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      assignments.forEach((assign) => {
        const manifestId = `MF-${Date.now().toString().slice(-4)}-${String(assign.vehicleId).slice(0, 3).toUpperCase()}`;
        const vehicleInfo = MOCK_VEHICLES.find(v => v.id === assign.vehicleId);

        assign.route.forEach((requestId: string) => {
          const req = MOCK_REQUESTS.find(r => r.id === requestId.trim());
          if (req) {
            req.manifestId = manifestId;
            req.driverId = assign.driverName;
            req.vehicleId = assign.vehicleType || assign.vehicleId;
            req.vehiclePlate = vehicleInfo?.licensePlate || "PMRC-000";
            req.assignedAt = new Date().toISOString();
            req.status = 'APPROVED';
          }
        });
      });
      return Promise.resolve();
    }

    const batch = writeBatch(db);
    
    assignments.forEach((assign) => {
      const manifestId = `MF-${Date.now().toString().slice(-4)}-${String(assign.vehicleId).slice(0, 3).toUpperCase()}`;
      // Nota: Em um sistema real, aqui buscaríamos a placa da coleção de veículos antes de rodar o batch
      assign.route.forEach((requestId: string) => {
        const docRef = doc(db, COLLECTION_NAME, requestId.trim());
        batch.update(docRef, {
          manifestId,
          driverId: assign.driverName,
          vehicleId: assign.vehicleType || assign.vehicleId,
          // vehiclePlate seria passado aqui após busca prévia
          assignedAt: new Date().toISOString(),
          status: 'APPROVED'
        });
      });
    });

    await batch.commit();
  }
};
