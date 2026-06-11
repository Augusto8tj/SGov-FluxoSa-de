'use server';
/**
 * @fileOverview Fluxo Genkit para classificação inteligente de urgência.
 * Implementa fallback determinístico para casos de erro RESOURCE_EXHAUSTED.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClassifyUrgencyInputSchema = z.object({
  patientNotes: z.string().describe('Observações clínicas ou motivo do transporte.'),
  destination: z.string().describe('Local de destino do paciente.'),
});
export type ClassifyUrgencyInput = z.infer<typeof ClassifyUrgencyInputSchema>;

const ClassifyUrgencyOutputSchema = z.object({
  suggestedUrgency: z.enum(['low', 'medium', 'high', 'critical']).describe('Nível de urgência sugerido.'),
  reasoning: z.string().describe('Justificativa para a classificação baseada nos protocolos de saúde.'),
});
export type ClassifyUrgencyOutput = z.infer<typeof ClassifyUrgencyOutputSchema>;

export async function classifyUrgency(input: ClassifyUrgencyInput): Promise<ClassifyUrgencyOutput> {
  return classifyUrgencyFlow(input);
}

const classificationPrompt = ai.definePrompt({
  name: 'classificationPrompt',
  input: { schema: ClassifyUrgencyInputSchema },
  output: { schema: ClassifyUrgencyOutputSchema },
  prompt: `Você é um triador médico experiente no sistema de transporte sanitário de Rio Claro.
Analise a condição do paciente e o destino para sugerir o nível de urgência correto (baixo, médio, alto ou crítico).

Condição/Notas: {{{patientNotes}}}
Destino: {{{destination}}}`,
});

const classifyUrgencyFlow = ai.defineFlow(
  {
    name: 'classifyUrgencyFlow',
    inputSchema: ClassifyUrgencyInputSchema,
    outputSchema: ClassifyUrgencyOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await classificationPrompt(input);
      if (!output) throw new Error('AI Output Empty');
      return output;
    } catch (error) {
      console.warn("AI Classification failed, using deterministic fallback:", error);
      
      const dest = input.destination.toLowerCase();
      const notes = input.patientNotes.toLowerCase();
      
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let reasoning = 'Classificação automática via protocolo de contingência municipal.';

      if (dest.includes('hemodialise') || dest.includes('oncologia') || dest.includes('regional')) {
        urgency = 'high';
        reasoning = 'Prioridade alta para tratamentos contínuos ou hospital regional (Protocolo Local).';
      } else if (notes.includes('dor') || notes.includes('falta de ar') || notes.includes('pos-operatorio')) {
        urgency = 'medium';
        reasoning = 'Atenção média devido à queixa clínica relatada (Protocolo Local).';
      }

      return { suggestedUrgency: urgency, reasoning };
    }
  }
);