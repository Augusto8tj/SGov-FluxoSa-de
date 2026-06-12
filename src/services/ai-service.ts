/**
 * @fileOverview Serviço central de Inteligência Artificial do SGov FluxoSaúde.
 * Gerencia chamadas para OpenRouter com limpeza rigorosa de saída JSON.
 */

import { SYSTEM_DEFAULT_MODEL } from "@/ai/genkit";

export type AiResponse<T> = {
  output: T | null;
  error?: string;
  latency: number;
};

export const aiService = {
  /**
   * Executa uma chamada de IA com prompt e retorno estruturado.
   * Inclui limpeza de marcações Markdown comuns em respostas de LLMs.
   */
  async generate<T>(prompt: string, schemaDescription: string): Promise<AiResponse<T>> {
    const startTime = Date.now();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn("AI Service: OPENROUTER_API_KEY não configurada.");
      return { output: null, error: "API Key missing", latency: 0 };
    }

    try {
      const fullPrompt = `${prompt}\n\nIMPORTANTE: Sua resposta deve ser exclusivamente um objeto JSON seguindo esta estrutura: ${schemaDescription}. Não inclua blocos de código (markdown), explicações ou qualquer texto extra.`;

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
          temperature: 0.1 // Baixa temperatura para maior precisão estrutural
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      let content = data.choices?.[0]?.message?.content;

      if (!response.ok || !content) {
        throw new Error(data.error?.message || "Falha na resposta da IA");
      }

      // Limpeza de Markdown (```json ... ```) caso o modelo ignore as instruções
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      return {
        output: JSON.parse(content) as T,
        latency: endTime - startTime
      };
    } catch (error: any) {
      console.error("AI Service Parse Error:", error);
      return {
        output: null,
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }
};
