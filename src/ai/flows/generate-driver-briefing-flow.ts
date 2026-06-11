'use server';
/**
 * @fileOverview Fluxo Genkit para gerar briefings personalizados para motoristas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DriverBriefingInputSchema = z.object({
  driverName: z.string(),
  vehicleType: z.string(),
  passengers: z.array(z.object({
    name: z.string(),
    needs: z.array(z.string()),
    urgency: z.string(),
  })),
  routeDetails: z.string(),
});
export type DriverBriefingInput = z.infer<typeof DriverBriefingInputSchema>;

const DriverBriefingOutputSchema = z.object({
  summary: z.string().describe('Resumo motivador e informativo para o motorista.'),
  criticalAlerts: z.array(z.string()).describe('Alertas sobre pacientes que requerem atenção redobrada.'),
  protocolReminder: z.string().describe('Lembrete de protocolo de segurança relevante.'),
});
export type DriverBriefingOutput = z.infer<typeof DriverBriefingOutputSchema>;

export async function generateDriverBriefing(input: DriverBriefingInput): Promise<DriverBriefingOutput> {
  return driverBriefingFlow(input);
}

const driverPrompt = ai.definePrompt({
  name: 'driverPrompt',
  input: { schema: DriverBriefingInputSchema },
  output: { schema: DriverBriefingOutputSchema },
  prompt: `Você é o Coordenador de Logística do SGov Rio Claro falando com o motorista {{{driverName}}}.
O motorista está operando um(a) {{{vehicleType}}}.

Manifesto de Passageiros:
{{#each passengers}}
- {{name}} (Urgência: {{urgency}}, Necessidades: {{#each needs}}{{this}}, {{/each}})
{{/each}}

Detalhes da Rota: {{{routeDetails}}}

Gere um briefing profissional e empático que:
1. Resuma a missão do dia.
2. Destaque alertas críticos baseados nas necessidades dos pacientes (maca, oxigênio, etc).
3. Forneça um lembrete rápido de protocolo de transporte sanitário.`,
});

const driverBriefingFlow = ai.defineFlow(
  {
    name: 'driverBriefingFlow',
    inputSchema: DriverBriefingInputSchema,
    outputSchema: DriverBriefingOutputSchema,
  },
  async (input) => {
    const { output } = await driverPrompt(input);
    if (!output) throw new Error('Falha ao gerar briefing para o motorista.');
    return output;
  }
);
