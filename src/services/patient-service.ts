
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
import { MOCK_PATIENTS } from "@/lib/mock-data";

const COLLECTION_NAME = "patients";

/**
 * @fileOverview Serviço de gerenciamento de pacientes com suporte instantâneo a modo demo.
 */
export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (typeof window !== 'undefined' && sessionStorage.getItem("sgov_demo_user")) {
      return MOCK_PATIENTS;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromCache(q);
      } catch {
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return MOCK_PATIENTS;
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      return MOCK_PATIENTS;
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
    } catch (error) {
      console.error("Error in patientService.addPatient:", error);
      throw new Error("Erro ao realizar cadastro do cidadão.");
    }
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in patientService.updatePatient:", error);
      throw new Error("Erro ao atualizar dados cadastrais.");
    }
  },

  async deletePatient(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error in patientService.deletePatient:", error);
      throw new Error("Erro ao remover registro do paciente.");
    }
  }
};
