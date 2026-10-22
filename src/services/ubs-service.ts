
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
import { UBS } from "@/lib/types";
import { MOCK_UBS } from "@/lib/mock-data";

const COLLECTION_NAME = "units";

export const ubsService = {
  async getUnits(): Promise<UBS[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UBS));

      return firestoreData.length > 0 ? firestoreData : MOCK_UBS;
    } catch (error) {
      console.warn("UBS Service Error - Using Mock:", error);
      return MOCK_UBS;
    }
  },

  async addUnit(unit: Omit<UBS, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...unit,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch {
      throw new Error("Erro ao registrar Unidade de Saúde.");
    }
  },

  async updateUnit(id: string, data: Partial<UBS>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error("Erro ao atualizar unidade.");
    }
  },

  async deleteUnit(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Erro ao remover unidade.");
    }
  }
};
