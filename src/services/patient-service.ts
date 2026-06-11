
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

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Patient));
  },

  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), patient);
    return docRef.id;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  },

  async deletePatient(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
