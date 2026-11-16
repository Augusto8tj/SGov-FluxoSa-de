
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type SystemSettings = {
  aiProvider: 'GOOGLE' | 'OPENROUTER' | 'OLLAMA' | 'NVIDIA';
  aiModelId: string;
  ollamaBaseUrl?: string;
  ollamaApiKey?: string;
  googleApiKey?: string;
  openrouterApiKey?: string;
};

const SETTINGS_DOC = "system_settings/global";

export const systemSettingsService = {
  async getSettings(): Promise<SystemSettings> {
    const docRef = doc(db, SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
    // Fallback default
    return {
      aiProvider: 'OPENROUTER',
      aiModelId: 'nvidia/nemotron-nano-9b-v2:free',
    };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const docRef = doc(db, SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  }
};
