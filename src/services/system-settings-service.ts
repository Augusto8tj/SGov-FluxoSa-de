
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SYSTEM_DEFAULT_MODEL } from "@/ai/constants";

export type SystemSettings = {
  aiProvider: 'GOOGLE' | 'OPENROUTER' | 'OLLAMA' | 'NVIDIA';
  aiModelId: string;
  ollamaBaseUrl?: string;
  ollamaApiKey?: string;
  ollamaKeepAlive?: string; // -1, 5m, 30m, 0
  ollamaTemperature?: number;
  googleApiKey?: string;
  openrouterApiKey?: string;
};

const SETTINGS_DOC = "system_settings/global";

export const systemSettingsService = {
  async getSettings(): Promise<SystemSettings> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SystemSettings;
      }
    } catch (e) {
      console.warn("SystemSettingsService: Falha ao ler Firestore, usando defaults.", e);
    }
    
    return {
      aiProvider: 'OPENROUTER',
      aiModelId: SYSTEM_DEFAULT_MODEL,
      ollamaKeepAlive: '5m',
      ollamaTemperature: 0.7
    };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      await setDoc(docRef, settings, { merge: true });
    } catch (e) {
      console.error("SystemSettingsService: Falha ao salvar configurações.", e);
      throw new Error("Erro ao persistir no Firestore.");
    }
  }
};
