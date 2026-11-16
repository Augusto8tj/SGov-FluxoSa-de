
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
let cachedSettings: SystemSettings | null = null;

export const systemSettingsService = {
  /**
   * Obtém as configurações globais do sistema com cache em memória.
   */
  async getSettings(): Promise<SystemSettings> {
    if (cachedSettings) return cachedSettings;

    const defaults: SystemSettings = {
      aiProvider: 'OPENROUTER',
      aiModelId: SYSTEM_DEFAULT_MODEL,
      ollamaBaseUrl: 'https://boxlike-barrack-silencer.ngrok-free.dev',
      ollamaKeepAlive: '5m',
      ollamaTemperature: 0.7
    };

    try {
      const docRef = doc(db, SETTINGS_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        cachedSettings = { ...defaults, ...data } as SystemSettings;
        return cachedSettings;
      }
    } catch {
      console.warn("SystemSettingsService: Usando defaults técnicos.");
    }
    
    cachedSettings = defaults;
    return defaults;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      await setDoc(docRef, cleanSettings, { merge: true });
      cachedSettings = null; // Invalida o cache
    } catch (e) {
      throw new Error("Erro ao persistir no Firestore.");
    }
  }
};
