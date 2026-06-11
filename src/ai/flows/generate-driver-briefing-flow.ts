'use server';
/**
 * @fileOverview Fluxo Genkit para briefings de motoristas com fallback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DriverBriefingInputSchema = z.object({
  driverName: z.string(),
  vehicleType: z.string(),
  passengers: z.array(z.object({
    maskedName: z.string(),
    needs: z.array(z.string()),
    urgency: z.string(),
  })),
  routeDetails: z.string(),
});
export type DriverBriefingInput = z.infer<typeof DriverBriefingInputSchema>;

const DriverBriefingOutputSchema = z.object({
  summary: z.string(),
  criticalAlerts: z.array(z.string()),
  protocolReminder: z.string(),
});
export type DriverBriefingOutput = z.infer<typeof DriverBriefingOutputSchema>;

export async function generateDriverBriefing(input: DriverBriefingInput): Promise<DriverBriefingOutput> {
  return driverBriefingFlow(input);
}

const driverPrompt = ai.definePrompt({
  name: 'driverPrompt',
  input: { schema: DriverBriefingInputSchema },
  output: { schema: DriverBriefingOutputSchema },
  prompt: `Briefing para o condutor {{{driverName}}}.`,
});

const driverBriefingFlow = ai.defineFlow(
  {
    name: 'driverBriefingFlow',
    inputSchema: DriverBriefingInputSchema,
    outputSchema: DriverBriefingOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await driverPrompt(input);
      if (!output) throw new Error('AI Error');
      return output;
    } catch (error) {
      console.warn("AI Driver Briefing failed, using fallback:", error);
      const criticalCount = input.passengers.filter(p => p.urgency === 'crítica' || p.urgency === 'alta').length;
      return {
        summary: `Olá ${input.driverName}, você tem ${input.passengers.length} passageiros planejados para esta rota no veículo ${input.vehicleType}.`,
        criticalAlerts: criticalCount > 0 ? [`Atenção: ${criticalCount} passageiros requerem cuidados de prioridade alta.`] : [],
        protocolReminder: "Mantenha o rádio na frequência municipal e utilize os EPIs de biossegurança conforme o manual vigente."
      };
    }
  }
);