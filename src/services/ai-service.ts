/**
 * @fileOverview Serviço central de Inteligência Artificial do SGov FluxoSaúde.
 * Suporta múltiplos provedores (OpenRouter, Google, Ollama) com base nas configurações do Firestore.
 */

import { systemSettingsService } from "./system-settings-service";
import { maskPII } from "@/lib/pii-masking";

export type AiResponse<T> = {
  output: T | null;
  error?: string;
  latency: number;
};

export const aiService = {
  /**
   * Executa uma chamada de IA com base no provedor configurado no sistema.
   */
  async generate<T>(prompt: string, schemaDescription: string): Promise<AiResponse<T>> {
    const startTime = Date.now();
    const settings = await systemSettingsService.getSettings();
    
    // 1. Segurança: Mascaramento PII (LGPD)
    const sanitizedPrompt = maskPII(prompt);
    const fullPrompt = `${sanitizedPrompt}\n\nIMPORTANTE: Responda APENAS um objeto JSON válido seguindo esta estrutura: ${schemaDescription}. Não use markdown ou explicações.`;

    try {
      let response;
      let url = "";
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      let body: any = {};

      if (settings.aiProvider === 'OLLAMA') {
        if (!settings.ollamaBaseUrl) throw new Error("URL do Ollama não configurada.");
        
        const baseUrl = settings.ollamaBaseUrl.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
        url = `${baseUrl}/v1/chat/completions`;
        
        if (settings.ollamaApiKey) {
          headers["Authorization"] = `Bearer ${settings.ollamaApiKey}`;
        }

        body = {
          model: settings.aiModelId,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.1,
          format: "json"
        };
      } else {
        // Fallback para OpenRouter (Cloud)
        const apiKey = settings.openrouterApiKey || process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("Chave de API (OpenRouter) ausente.");

        url = "https://openrouter.ai/api/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["HTTP-Referer"] = "https://sgov-fluxosaude.gov.br";
        headers["X-Title"] = "SGov FluxoSaúde";

        body = {
          model: settings.aiModelId || "nvidia/nemotron-nano-9b-v2:free",
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.1
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Falha no provedor (${response.status})`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content;

      if (!content) throw new Error("O modelo retornou uma resposta vazia.");

      // Limpeza de Markdown redundante
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      return {
        output: JSON.parse(content) as T,
        latency: Date.now() - startTime
      };

    } catch (error: any) {
      console.error("AI Service Error:", error.message);
      return {
        output: null,
        error: error.message || "Erro desconhecido no processamento de IA.",
        latency: Date.now() - startTime
      };
    }
  }
};
