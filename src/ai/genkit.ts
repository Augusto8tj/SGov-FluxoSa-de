import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit.
 * O modelo padrão do sistema foi migrado para Nvidia Nemotron via OpenRouter
 * para garantir alta performance e disponibilidade sem custos de infraestrutura.
 */

// Modelo padrão escolhido para todo o sistema
export const SYSTEM_DEFAULT_MODEL = "nvidia/nemotron-nano-9b-v2:free";

export const ai = genkit({
  plugins: [googleAI()],
  // Mantemos o plugin para compatibilidade de tipos, 
  // mas as chamadas reais agora são centralizadas no aiService.
});
