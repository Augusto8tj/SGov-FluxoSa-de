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
 * @fileOverview Serviço de gerenciamento da frota de veículos no Firestore.
 * Com suporte a fallback de demonstração.
 */
export const vehicleService = {
  /**
   * Recupera todos os veículos. Retorna mocks se o banco estiver vazio ou falhar.
   */
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("licensePlate", "asc"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return MOCK_VEHICLES;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
      console.warn("Firestore error in vehicleService, falling back to mocks:", error);
      return MOCK_VEHICLES;
    }
  },

  /**
   * Adiciona um novo veículo à coleção.
   */
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

  /**
   * Atualiza dados de um veículo existente.
   */
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

  /**
   * Remove um veículo da frota.
   */
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
