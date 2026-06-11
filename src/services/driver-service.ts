import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { Driver } from "@/lib/types";
import { MOCK_DRIVERS } from "@/lib/mock-data";

const COLLECTION_NAME = "drivers";

/**
 * @fileOverview Serviço de gerenciamento de motoristas no Firestore.
 */
export const driverService = {
  /**
   * Busca motoristas disponíveis no sistema.
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("available", "==", true),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return MOCK_DRIVERS.filter(d => d.available);
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.warn("Firestore error in driverService, falling back to mocks:", error);
      return MOCK_DRIVERS.filter(d => d.available);
    }
  }
};
