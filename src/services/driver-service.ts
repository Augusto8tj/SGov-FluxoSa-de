import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  getDocsFromCache
} from "firebase/firestore";
import { Driver } from "@/lib/types";
import { MOCK_DRIVERS } from "@/lib/mock-data";

const COLLECTION_NAME = "drivers";

/**
 * @fileOverview Serviço de gerenciamento de motoristas no Firestore com suporte a modo demo.
 */
export const driverService = {
  async getAvailableDrivers(): Promise<Driver[]> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return MOCK_DRIVERS.filter(d => d.available);
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("available", "==", true),
        orderBy("name", "asc")
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return MOCK_DRIVERS.filter(d => d.available);
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch {
      return MOCK_DRIVERS.filter(d => d.available);
    }
  }
};
