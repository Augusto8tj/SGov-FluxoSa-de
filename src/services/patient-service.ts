
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
import { Patient } from "@/lib/types";

const COLLECTION_NAME = "patients";

/**
 * @fileOverview Serviço de gerenciamento de pacientes com suporte a dados reais no Firestore.
 */
export const patientService = {
  async getPatients(): Promise<Patient[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      
      let querySnapshot;
      try {
        // Tenta cache primeiro para velocidade instantânea
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
      } as Patient));
    } catch (error) {
      console.error("Firestore Error:", error);
      return [];
    }
  },

  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...patient,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch {
      throw new Error("Erro ao realizar cadastro do cidadão no banco de dados.");
    }
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch {
      throw new Error("Erro ao atualizar dados cadastrais.");
    }
  },

  async deletePatient(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch {
      throw new Error("Erro ao remover registro do paciente.");
    }
  }
};
