
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  updateDoc,
  doc
} from "firebase/firestore";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

const COLLECTION_NAME = "official_documents";

export const documentService = {
  async getDocuments(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return firestoreData.length > 0 ? firestoreData : MOCK_DOCUMENTS;
    } catch (error) {
      console.warn("Document Service Error - Using Mock:", error);
      return MOCK_DOCUMENTS;
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
