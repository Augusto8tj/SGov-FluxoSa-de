'use server';
/**
 * @fileOverview Fluxo Genkit para briefings de motoristas com proteção de dados.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DriverBriefingInputSchema = z.object({
  driverName: z.string(),
  vehicleType: z.string(),
  passengers: z.array(z.object({
    maskedName: z.string().describe('Apenas primeiro nome.'),
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
  prompt: `Briefing logístico para o condutor {{{driverName}}} - Rio Claro, RJ.
Operação de transporte sanitário com dados protegidos.

Manifesto de Missão:
{{#each passengers}}
- Paciente {{maskedName}} (Urgência: {{urgency}}, Requer: {{#each needs}}{{this}} {{/each}})
{{/each}}

Itinerário: {{{routeDetails}}}

Gere um resumo operacional focado na segurança do paciente e eficiência do trajeto. 
Não tente deduzir identidades; foque no suporte necessário durante o transporte.`,
});

const driverBriefingFlow = ai.defineFlow(
  {
    name: 'driverBriefingFlow',
    inputSchema: DriverBriefingInputSchema,
    outputSchema: DriverBriefingOutputSchema,
  },
  async (input) => {
    const { output } = await driverPrompt(input);
    if (!output) throw new Error('Falha ao gerar briefing.');
    return output;
  }
);
