'use server';
/**
 * @fileOverview Fluxo Genkit para resumir a demanda de transporte de uma UBS com fallback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UbsDemandInputSchema = z.object({
  ubsName: z.string(),
  pendingRequests: z.number(),
  urgentCases: z.number(),
  commonDestinations: z.array(z.string()),
});
export type UbsDemandInput = z.infer<typeof UbsDemandInputSchema>;

const UbsDemandOutputSchema = z.object({
  summary: z.string().describe('Resumo da situação de transporte da unidade.'),
  recommendation: z.string().describe('Sugestão para otimizar os pedidos da semana.'),
  priorityLevel: z.enum(['low', 'medium', 'high']).describe('Nível de atenção para a unidade.'),
});
export type UbsDemandOutput = z.infer<typeof UbsDemandOutputSchema>;

export async function summarizeUbsDemand(input: UbsDemandInput): Promise<UbsDemandOutput> {
  return ubsDemandFlow(input);
}

const ubsDemandPrompt = ai.definePrompt({
  name: 'ubsDemandPrompt',
  input: { schema: UbsDemandInputSchema },
  output: { schema: UbsDemandOutputSchema },
  prompt: `Gere um resumo estratégico para a UBS {{{ubsName}}}.`,
});

const ubsDemandFlow = ai.defineFlow(
  {
    name: 'ubsDemandFlow',
    inputSchema: UbsDemandInputSchema,
    outputSchema: UbsDemandOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ubsDemandPrompt(input);
      if (!output) throw new Error('AI Error');
      return output;
    } catch (error) {
      console.warn("AI UBS Demand failed, using fallback:", error);
      return {
        summary: `A ${input.ubsName} possui ${input.pendingRequests} pedidos pendentes no sistema, sendo ${input.urgentCases} de urgência.`,
        recommendation: "Revise os horários de saída para evitar acúmulo na janela das 08h às 10h.",
        priorityLevel: input.urgentCases > 2 ? 'high' : 'medium'
      };
    }
  }
);