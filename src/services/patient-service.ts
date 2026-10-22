
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
import { MOCK_PATIENTS } from "@/lib/mock-data";

const COLLECTION_NAME = "patients";

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));

      return firestoreData.length > 0 ? firestoreData : MOCK_PATIENTS;
    } catch (error) {
      console.warn("Patient Service Error - Using Mock:", error);
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
    } catch {
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
