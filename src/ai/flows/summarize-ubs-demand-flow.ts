'use server';
/**
 * @fileOverview Fluxo Genkit para resumir a demanda de transporte de uma UBS específica.
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
  prompt: `Você é um analista de logística de saúde pública. 
Gere um resumo estratégico para o gerente da {{{ubsName}}} com base nos seguintes dados:

- Pedidos pendentes: {{pendingRequests}}
- Casos de urgência (alta/crítica): {{urgentCases}}
- Destinos frequentes: {{#each commonDestinations}}{{this}}, {{/each}}

O objetivo é ajudar a UBS a entender se sua demanda está sendo atendida e como melhorar a organização dos pedidos para o transporte sanitário municipal.`,
});

const ubsDemandFlow = ai.defineFlow(
  {
    name: 'ubsDemandFlow',
    inputSchema: UbsDemandInputSchema,
    outputSchema: UbsDemandOutputSchema,
  },
  async (input) => {
    const { output } = await ubsDemandPrompt(input);
    if (!output) throw new Error('Falha ao gerar resumo da UBS.');
    return output;
  }
);
