
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
import { MOCK_DRIVERS } from "@/lib/mock-data";

const COLLECTION_NAME = "drivers";

export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));

      return firestoreData.length > 0 ? firestoreData : MOCK_DRIVERS;
    } catch (error) {
      console.warn("Driver Service Error - Using Mock:", error);
      return MOCK_DRIVERS;
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
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));

      return firestoreData.length > 0 ? firestoreData : MOCK_DRIVERS.filter(d => d.available);
    } catch (error) {
      console.error("Firestore Error (getAvailableDrivers):", error);
      return MOCK_DRIVERS.filter(d => d.available);
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
