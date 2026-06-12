
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
  getDocsFromCache
} from "firebase/firestore";
import { Vehicle } from "@/lib/types";
import { MOCK_VEHICLES } from "@/lib/mock-data";

const COLLECTION_NAME = "vehicles";

/**
 * @fileOverview Serviço de gerenciamento da frota de veículos no Firestore com modo demo instantâneo.
 */
export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return MOCK_VEHICLES;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("licensePlate", "asc"));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return MOCK_VEHICLES;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
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
    } catch (error) {
      console.error("Error in vehicleService.addVehicle:", error);
      throw new Error("Erro ao registrar veículo no banco de dados.");
    }
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in vehicleService.updateVehicle:", error);
      throw new Error("Erro ao atualizar informações do veículo.");
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error in vehicleService.deleteVehicle:", error);
      throw new Error("Erro ao remover veículo da frota.");
    }
  }
};
