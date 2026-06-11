'use server';
/**
 * @fileOverview Fluxo Genkit para gerar briefings estratégicos para o Secretário de Saúde.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SystemInsightsInputSchema = z.object({
  pendingRequests: z.number(),
  activeVehicles: z.number(),
  totalVehicles: z.number(),
  criticalPatientsCount: z.number(),
  currentHour: z.number(),
});
export type SystemInsightsInput = z.infer<typeof SystemInsightsInputSchema>;

const SystemInsightsOutputSchema = z.object({
  briefing: z.string().describe('Resumo executivo da situação atual.'),
  priorityAction: z.string().describe('Ação mais importante a ser tomada agora.'),
  alertLevel: z.enum(['normal', 'warning', 'critical']).describe('Nível de alerta do sistema.'),
});
export type SystemInsightsOutput = z.infer<typeof SystemInsightsOutputSchema>;

export async function generateSystemInsights(input: SystemInsightsInput): Promise<SystemInsightsOutput> {
  return generateSystemInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt({
  name: 'insightsPrompt',
  input: { schema: SystemInsightsInputSchema },
  output: { schema: SystemInsightsOutputSchema },
  prompt: `Você é o braço direito do Secretário de Saúde de Rio Claro. 
Gere um briefing executivo com base nos seguintes dados operacionais:

- Pedidos pendentes: {{pendingRequests}}
- Veículos ativos: {{activeVehicles}} de {{totalVehicles}}
- Pacientes críticos hoje: {{criticalPatientsCount}}
- Hora atual: {{currentHour}}h

Seja direto, profissional e focado em logística de saúde municipal. Use um tom de assessoria técnica.`,
});

const generateSystemInsightsFlow = ai.defineFlow(
  {
    name: 'generateSystemInsightsFlow',
    inputSchema: SystemInsightsInputSchema,
    outputSchema: SystemInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await insightsPrompt(input);
    if (!output) throw new Error('Falha ao gerar insights pela IA.');
    return output;
  }
);
