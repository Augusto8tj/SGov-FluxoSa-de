
/**
 * @fileOverview Serviço central de Inteligência Artificial do SGov FluxoSaúde.
 * Gerencia chamadas para OpenRouter com limpeza rigorosa de saída JSON e timeout de segurança.
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
   * Inclui limpeza de marcações Markdown e timeout de 25 segundos para evitar travamentos.
   */
  async generate<T>(prompt: string, schemaDescription: string): Promise<AiResponse<T>> {
    const startTime = Date.now();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn("AI Service: OPENROUTER_API_KEY não configurada.");
      return { output: null, error: "API Key missing", latency: 0 };
    }

    // Timeout de segurança para evitar esperas de 2-5 minutos (limite de 25s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

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
          temperature: 0.1 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      const endTime = Date.now();
      let content = data.choices?.[0]?.message?.content;

      if (!response.ok || !content) {
        throw new Error(data.error?.message || "Falha na resposta da IA");
      }

      // Limpeza de Markdown (```json ... ```)
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      return {
        output: JSON.parse(content) as T,
        latency: endTime - startTime
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("AI Service Error:", error.name === 'AbortError' ? 'Timeout de 25s atingido' : error.message);
      return {
        output: null,
        error: error.name === 'AbortError' ? 'Tempo limite de processamento atingido' : error.message,
        latency: Date.now() - startTime
      };
    }
  }
};
