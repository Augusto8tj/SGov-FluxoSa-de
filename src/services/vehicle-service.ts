
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from "firebase/firestore";
import { Vehicle } from "@/lib/types";
import { MOCK_VEHICLES } from "@/lib/mock-data";

const COLLECTION_NAME = "vehicles";

/**
 * @fileOverview Serviço de frota com suporte a telemetria mock.
 */
export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("licensePlate", "asc"));
      const querySnapshot = await getDocs(q);
      
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));

      // Modo Demo: Garante que o Chefe de TI veja veículos com telemetria
      return firestoreData.length > 0 ? firestoreData : MOCK_VEHICLES;
    } catch {
      return MOCK_VEHICLES;
    }
  },

  async addVehicle(vehicle: Omit<Vehicle, "id">): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...vehicle,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch {
      throw new Error("Erro ao persistir veículo oficial.");
    }
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error("Erro ao atualizar metadados da viatura.");
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Erro ao expurgar veículo da frota.");
    }
  }
};
