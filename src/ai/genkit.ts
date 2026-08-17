import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit.
 * O modelo padrão do sistema foi migrado para Llama 3.1 8B para
 * garantir o máximo de agilidade no processamento logístico.
 */

// Modelo padrão escolhido para todo o sistema (Ultra Rápido)
export const SYSTEM_DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct";

export const ai = genkit({
  plugins: [googleAI()],
  // Mantemos o plugin para compatibilidade de tipos, 
  // mas as chamadas reais agora são centralizadas no aiService via OpenRouter.
});
