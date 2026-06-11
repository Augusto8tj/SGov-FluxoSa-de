'use server';
/**
 * @fileOverview Fluxo Genkit para suporte à decisão com fallback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideDecisionSupportInputSchema = z.object({
  requestId: z.string(),
  patientMaskedName: z.string(),
  patientDetails: z.string(),
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
  recommendation: z.string(),
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
  prompt: `Analise a solicitação de transporte para a Secretaria de Saúde.`,
});

const provideDecisionSupportFlow = ai.defineFlow(
  {
    name: 'provideDecisionSupportFlow',
    inputSchema: ProvideDecisionSupportInputSchema,
    outputSchema: ProvideDecisionSupportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await decisionSupportPrompt(input);
      if (!output) throw new Error('AI Error');
      return output;
    } catch (error) {
      console.warn("AI Decision Support failed, using fallback:", error);
      return {
        recommendation: "Solicitação aguardando triagem manual. Os dados sugerem viabilidade logística para o trajeto solicitado.",
        criticalFactors: ["Disponibilidade de Viatura", "Urgência Declarada: " + input.urgencyLevel.toUpperCase()],
        suggestedAction: input.urgencyLevel === 'critical' ? 'approve' : 'escalate'
      };
    }
  }
);