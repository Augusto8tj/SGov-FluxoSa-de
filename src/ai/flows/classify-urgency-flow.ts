'use server';
/**
 * @fileOverview Fluxo Genkit para classificação inteligente de urgência em transporte sanitário.
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
Destino: {{{destination}}}

Considere:
- Pacientes para hemodiálise ou oncologia geralmente são Alta/Crítica.
- Exames de rotina ou consultas simples são Baixa/Média.
- Menção a falta de ar, dor aguda ou pós-operatório imediato eleva o nível.`,
});

const classifyUrgencyFlow = ai.defineFlow(
  {
    name: 'classifyUrgencyFlow',
    inputSchema: ClassifyUrgencyInputSchema,
    outputSchema: ClassifyUrgencyOutputSchema,
  },
  async (input) => {
    const { output } = await classificationPrompt(input);
    if (!output) throw new Error('Falha na classificação pela IA.');
    return output;
  }
);
