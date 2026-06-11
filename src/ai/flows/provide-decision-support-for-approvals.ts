'use server';
/**
 * @fileOverview Fluxo Genkit para suporte à decisão de aprovações.
 * Implementa de-identificação: recebe apenas dados clínicos e nomes parciais.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideDecisionSupportInputSchema = z.object({
  requestId: z.string().describe('ID parcial do sistema (ex: #001).'),
  patientMaskedName: z.string().describe('Apenas o primeiro nome do paciente.'),
  patientDetails: z.string().describe('Contexto clínico sem dados de identificação pessoal (PII).'),
  needsCompanion: z.boolean(),
  pickupLocation: z.string(),
  destinationLocation: z.string(),
  requestedTime: z.string(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  availableVehiclesSummary: z.string(),
  availableDriversSummary: z.string(),
  conflictingRequestsSummary: z.string(),
});
export type ProvideDecisionSupportInput = z.infer<typeof ProvideDecisionSupportInputSchema>;

const ProvideDecisionSupportOutputSchema = z.object({
  recommendation: z.string().describe('Recomendação técnica baseada em logística e clínica.'),
  criticalFactors: z.array(z.string()),
  suggestedAction: z.enum(['approve', 'deny', 'escalate', 'needs_more_info']),
});
export type ProvideDecisionSupportOutput = z.infer<typeof ProvideDecisionSupportOutputSchema>;

export async function provideDecisionSupportForApprovals(input: ProvideDecisionSupportInput): Promise<ProvideDecisionSupportOutput> {
  return provideDecisionSupportFlow(input);
}

const decisionSupportPrompt = ai.definePrompt({
  name: 'decisionSupportPrompt',
  input: { schema: ProvideDecisionSupportInputSchema },
  output: { schema: ProvideDecisionSupportOutputSchema },
  prompt: `Você é um assistente técnico da Secretaria de Saúde de Rio Claro. 
IMPORTANTE: Você está trabalhando com dados de-identificados (Pseudonimizados). 
O nome fornecido é apenas o primeiro nome e o ID é interno. 

Analise a solicitação de transporte baseando-se estritamente na necessidade clínica e logística:

Paciente: {{{patientMaskedName}}} (Ref: {{{requestId}}})
Condição Clínica: {{{patientDetails}}}
Necessita Acompanhante: {{#if needsCompanion}}Sim{{else}}Não{{/if}}
Trajeto: {{{pickupLocation}}} -> {{{destinationLocation}}}
Urgência Declarada: {{{urgencyLevel}}}

Recursos Disponíveis:
Veículos: {{{availableVehiclesSummary}}}
Condutores: {{{availableDriversSummary}}}
Conflitos: {{{conflictingRequestsSummary}}}

Sua recomendação deve ser técnica, focada em salvar vidas e otimizar a frota municipal.`,
});

const provideDecisionSupportFlow = ai.defineFlow(
  {
    name: 'provideDecisionSupportFlow',
    inputSchema: ProvideDecisionSupportInputSchema,
    outputSchema: ProvideDecisionSupportOutputSchema,
  },
  async (input) => {
    const { output } = await decisionSupportPrompt(input);
    if (!output) throw new Error('Falha ao obter recomendação da IA.');
    return output;
  }
);
