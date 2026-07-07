
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
import { UBS } from "@/lib/types";

const COLLECTION_NAME = "units";

/**
 * @fileOverview Serviço de gerenciamento de Unidades de Saúde (UBS) no Firestore.
 */
export const ubsService = {
  async getUnits(): Promise<UBS[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(q);
        }
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UBS));
    } catch (error) {
      console.error("Firestore Error (UBS):", error);
      return [];
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
