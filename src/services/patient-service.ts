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
import { Patient } from "@/lib/types";

const COLLECTION_NAME = "patients";

/**
 * @fileOverview Serviço de gerenciamento de pacientes (Cidadãos) no Firestore.
 */
export const patientService = {
  /**
   * Lista todos os pacientes em ordem alfabética.
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      console.error("Error in patientService.getPatients:", error);
      throw new Error("Falha ao buscar lista de pacientes.");
    }
  },

  /**
   * Cadastra um novo paciente.
   */
  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...patient,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error in patientService.addPatient:", error);
      throw new Error("Falha ao cadastrar paciente.");
    }
  },

  /**
   * Atualiza informações cadastrais do paciente.
   */
  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in patientService.updatePatient:", error);
      throw new Error("Falha ao atualizar dados do paciente.");
    }
  },

  /**
   * Remove permanentemente um paciente.
   */
  async deletePatient(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error in patientService.deletePatient:", error);
      throw new Error("Falha ao remover paciente.");
    }
  }
};
