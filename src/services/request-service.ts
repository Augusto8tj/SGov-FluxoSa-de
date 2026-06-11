
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
  Timestamp 
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";

const COLLECTION_NAME = "requests";

export const requestService = {
  async getRequests(): Promise<TransportRequest[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TransportRequest));
  },

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...request,
      createdAt: Timestamp.now().toDate().toISOString()
    });
    return docRef.id;
  },

  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  },

  async deleteRequest(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
