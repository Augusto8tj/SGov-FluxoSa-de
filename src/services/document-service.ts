
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";

const COLLECTION_NAME = "official_documents";

export const documentService = {
  async getDocuments(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Document Service Error:", error);
      return [];
    }
  },

  async markAsPrinted(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { status: 'PRINTED' });
    } catch (e) {
      console.error("Failed to update document status", e);
    }
  }
};
