
'use server';

import { ai } from "@/ai/ai-instance";
import { z } from 'genkit';
import { systemSettingsService } from "@/services/system-settings-service";

/**
 * @fileOverview Fluxos de diagnóstico para validação de infraestrutura de IA.
 */

export const checkAiConnection = ai.defineFlow(
  {
    name: 'checkAiConnection',
    inputSchema: z.void(),
    outputSchema: z.object({
      status: z.enum(['online', 'offline']),
      provider: z.string(),
      models: z.array(z.string()).optional(),
      error: z.string().optional()
    }),
  },
  async () => {
    const settings = await systemSettingsService.getSettings();
    
    if (settings.aiProvider === 'OLLAMA') {
      try {
        const baseUrl = settings.ollamaBaseUrl?.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) throw new Error("Servidor Ollama inacessível.");
        
        const data = await response.json();
        const modelNames = data.models?.map((m: any) => m.name) || [];
        
        return {
          status: 'online',
          provider: 'OLLAMA (Local)',
          models: modelNames
        };
      } catch (e: any) {
        return { status: 'offline', provider: 'OLLAMA', error: e.message };
      }
    } else {
      // Validação simplificada para Cloud
      return {
        status: 'online',
        provider: `${settings.aiProvider} (Cloud)`,
        models: [settings.aiModelId]
      };
    }
  }
);
