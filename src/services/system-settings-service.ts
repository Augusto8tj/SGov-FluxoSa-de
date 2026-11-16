
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
  /**
   * Obtém as configurações globais do sistema.
   * Aplica fallbacks para garantir que a URL do Ollama e o modelo padrão estejam sempre disponíveis.
   */
  async getSettings(): Promise<SystemSettings> {
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
        console.log("SystemSettingsService: Configurações lidas do Firestore", data);
        // Mescla os dados do Firestore com os padrões para garantir que campos novos não fiquem vazios
        return { ...defaults, ...data } as SystemSettings;
      }
    } catch (e) {
      console.warn("SystemSettingsService: Falha ao ler Firestore, usando defaults técnicos.", e);
    }
    
    return defaults;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      console.log("SystemSettingsService: Persistindo configurações...", settings);
      // Garantimos que não enviamos campos undefined para o Firestore
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      await setDoc(docRef, cleanSettings, { merge: true });
      console.log("SystemSettingsService: Persistência concluída com sucesso.");
    } catch (e) {
      console.error("SystemSettingsService: Falha ao salvar configurações.", e);
      throw new Error("Erro ao persistir no Firestore.");
    }
  }
};
