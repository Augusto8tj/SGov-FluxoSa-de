'use server';
/**
 * @fileOverview Fluxo Genkit para gerar briefings personalizados para motoristas.
 * 
 * - generateDriverBriefing - Gera um resumo estratégico e alertas para o condutor.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DriverBriefingInputSchema = z.object({
  driverName: z.string().describe('Nome do motorista.'),
  vehicleType: z.string().describe('Tipo do veículo (ex: Ambulância, Van).'),
  passengers: z.array(z.object({
    name: z.string(),
    needs: z.array(z.string()),
    urgency: z.string(),
  })).describe('Lista de passageiros e suas necessidades.'),
  routeDetails: z.string().describe('Descrição geral da rota.'),
});
export type DriverBriefingInput = z.infer<typeof DriverBriefingInputSchema>;

const DriverBriefingOutputSchema = z.object({
  summary: z.string().describe('Resumo motivador e informativo.'),
  criticalAlerts: z.array(z.string()).describe('Alertas sobre pacientes que requerem atenção redobrada.'),
  protocolReminder: z.string().describe('Lembrete de protocolo de segurança relevante para a missão.'),
});
export type DriverBriefingOutput = z.infer<typeof DriverBriefingOutputSchema>;

export async function generateDriverBriefing(input: DriverBriefingInput): Promise<DriverBriefingOutput> {
  return driverBriefingFlow(input);
}

const driverPrompt = ai.definePrompt({
  name: 'driverPrompt',
  input: { schema: DriverBriefingInputSchema },
  output: { schema: DriverBriefingOutputSchema },
  prompt: `Você é o Coordenador de Logística de Saúde de Rio Claro - RJ.
Sua tarefa é dar um "briefing" rápido e eficiente para o motorista {{{driverName}}} que operará um(a) {{{vehicleType}}}.

Manifesto de Passageiros:
{{#each passengers}}
- {{name}} (Urgência: {{urgency}}, Necessidades: {{#each needs}}{{this}}, {{/each}})
{{/each}}

Detalhes da Rota: {{{routeDetails}}}

Gere um briefing profissional que:
1. Resuma o objetivo da viagem.
2. Destaque alertas críticos baseados nas condições dos pacientes (ex: uso de maca, oxigênio, prioridade alta).
3. Forneça um lembrete de segurança específico para transporte sanitário.
Seja direto e encorajador.`,
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
