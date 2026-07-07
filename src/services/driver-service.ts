import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  addDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { Driver } from "@/lib/types";

const COLLECTION_NAME = "drivers";

/**
 * @fileOverview Serviço de gerenciamento de condutores oficiais no Firestore.
 */
export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error("Firestore Error (getDrivers):", error);
      return [];
    }
  },

  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("available", "==", true),
        orderBy("name", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
    } catch (error) {
      console.error("Firestore Error (getAvailableDrivers):", error);
      return [];
    }
  },

  async addDriver(driver: Omit<Driver, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...driver,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch {
      throw new Error("Erro ao cadastrar motorista.");
    }
  },

  async updateDriver(id: string, data: Partial<Driver>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error("Erro ao atualizar dados do motorista.");
    }
  }
};
