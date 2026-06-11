/**
 * @fileOverview Serviço central de Inteligência Artificial do SGov FluxoSaúde.
 * Gerencia todas as chamadas para a OpenRouter utilizando o modelo padrão Nvidia.
 */

import { SYSTEM_DEFAULT_MODEL } from "@/ai/genkit";

export type AiResponse<T> = {
  output: T | null;
  error?: string;
  latency: number;
};

export const aiService = {
  /**
   * Executa uma chamada de IA com prompt e retorno estruturado (JSON).
   */
  async generate<T>(prompt: string, schemaDescription: string): Promise<AiResponse<T>> {
    const startTime = Date.now();
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Fallback caso a chave não esteja configurada (ambiente de dev)
    if (!apiKey) {
      console.warn("AI Service: OPENROUTER_API_KEY não configurada.");
      return { output: null, error: "API Key missing", latency: 0 };
    }

    try {
      // Adicionada instrução explícita para Português do Brasil
      const fullPrompt = `${prompt}\n\nIMPORTANTE: Sua resposta deve ser escrita obrigatoriamente em Português do Brasil (pt-BR). Sua resposta deve ser APENAS um objeto JSON válido seguindo esta estrutura: ${schemaDescription}. Não inclua explicações ou markdown fora do JSON.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://sgov-fluxosaude.gov.br",
          "X-Title": "SGov FluxoSaúde",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: SYSTEM_DEFAULT_MODEL,
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      const content = data.choices?.[0]?.message?.content;

      if (!response.ok || !content) {
        throw new Error(data.error?.message || "Falha na resposta da IA");
      }

      return {
        output: JSON.parse(content) as T,
        latency: endTime - startTime
      };
    } catch (error: any) {
      console.error("AI Service Error:", error);
      return {
        output: null,
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }
};
