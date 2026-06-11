'use server';
/**
 * @fileOverview Fluxo Genkit para briefings estratégicos com fallback.
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
Gere um briefing executivo:
- Pedidos pendentes: {{pendingRequests}}
- Veículos ativos: {{activeVehicles}} de {{totalVehicles}}
- Pacientes críticos: {{criticalPatientsCount}}`,
});

const generateSystemInsightsFlow = ai.defineFlow(
  {
    name: 'generateSystemInsightsFlow',
    inputSchema: SystemInsightsInputSchema,
    outputSchema: SystemInsightsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await insightsPrompt(input);
      if (!output) throw new Error('AI failed');
      return output;
    } catch (error) {
      console.warn("AI Insights failed, using fallback:", error);
      const isCritical = input.criticalPatientsCount > 0 || input.pendingRequests > 20;
      return {
        briefing: `Resumo técnico: ${input.pendingRequests} pedidos pendentes e ${input.activeVehicles}/${input.totalVehicles} veículos operacionais.`,
        priorityAction: input.criticalPatientsCount > 0 ? "Priorizar remoção de pacientes críticos." : "Organizar logística de agendamentos pendentes.",
        alertLevel: isCritical ? (input.criticalPatientsCount > 2 ? 'critical' : 'warning') : 'normal'
      };
    }
  }
);