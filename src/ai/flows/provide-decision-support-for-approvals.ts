'use server';
/**
 * @fileOverview This file implements a Genkit flow to provide AI-generated decision support
 * for patient transport requests, assisting the Secretary of Health in making informed approvals.
 *
 * - provideDecisionSupportForApprovals - A function that processes a patient transport request
 *   and returns AI-generated recommendations and critical factors.
 * - ProvideDecisionSupportInput - The input type for the provideDecisionSupportForApprovals function.
 * - ProvideDecisionSupportOutput - The return type for the provideDecisionSupportForApprovals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideDecisionSupportInputSchema = z.object({
  requestId: z.string().describe('Unique identifier for the transport request.'),
  patientName: z.string().describe('Name of the patient.'),
  patientDetails: z.string().describe('Detailed medical history and comorbidities of the patient.'),
  needsCompanion: z.boolean().describe('Whether the patient requires a companion during transport.'),
  pickupLocation: z.string().describe('Full address for patient pickup.'),
  destinationLocation: z.string().describe('Full address for patient destination.'),
  requestedTime: z.string().describe('Requested date and time for the transport (e.g., "YYYY-MM-DD HH:MM").'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Perceived urgency of the transport request.'),
  availableVehiclesSummary: z.string().describe('A summary of currently available vehicles (e.g., "2 ambulances, 3 sedans, 1 wheelchair-accessible van").'),
  availableDriversSummary: z.string().describe('A summary of currently available drivers (e.g., "5 drivers available for 8 hours").'),
  conflictingRequestsSummary: z.string().describe('A summary of potential conflicting transport requests or routes (e.g., "One high-priority request for same time, same area").'),
});
export type ProvideDecisionSupportInput = z.infer<typeof ProvideDecisionSupportInputSchema>;

const ProvideDecisionSupportOutputSchema = z.object({
  recommendation: z.string().describe('A concise recommendation for approval or refusal, including reasoning.'),
  criticalFactors: z.array(z.string()).describe('List of critical factors considered for the recommendation (e.g., "High urgency due to comorbidity", "Potential conflict with another critical request").'),
  suggestedAction: z.enum(['approve', 'deny', 'escalate', 'needs_more_info']).describe('The recommended action for the Secretary of Health.'),
});
export type ProvideDecisionSupportOutput = z.infer<typeof ProvideDecisionSupportOutputSchema>;

export async function provideDecisionSupportForApprovals(input: ProvideDecisionSupportInput): Promise<ProvideDecisionSupportOutput> {
  return provideDecisionSupportFlow(input);
}

const decisionSupportPrompt = ai.definePrompt({
  name: 'decisionSupportPrompt',
  input: { schema: ProvideDecisionSupportInputSchema },
  output: { schema: ProvideDecisionSupportOutputSchema },
  prompt: `You are an intelligent assistant to the Secretary of Health for the SGov FluxoSaúde system. Your task is to analyze patient transport requests and provide a clear, concise recommendation for approval or refusal, highlighting critical factors.

Analyze the following patient transport request:

Request ID: {{{requestId}}}
Patient Name: {{{patientName}}}
Patient Details: {{{patientDetails}}}
Needs Companion: {{#if needsCompanion}}Yes{{else}}No{{/if}}
Pickup Location: {{{pickupLocation}}}
Destination Location: {{{destinationLocation}}}
Requested Time: {{{requestedTime}}}
Urgency Level: {{{urgencyLevel}}}

Consider the following resource availability and potential conflicts:
Available Vehicles: {{{availableVehiclesSummary}}}
Available Drivers: {{{availableDriversSummary}}}
Conflicting Requests: {{{conflictingRequestsSummary}}}

Based on all the information provided, generate a recommendation, list the critical factors influencing your decision, and suggest a clear action for the Secretary of Health. Focus on urgency, patient needs, resource availability, and potential conflicts.`,
});

const provideDecisionSupportFlow = ai.defineFlow(
  {
    name: 'provideDecisionSupportFlow',
    inputSchema: ProvideDecisionSupportInputSchema,
    outputSchema: ProvideDecisionSupportOutputSchema,
  },
  async (input) => {
    const { output } = await decisionSupportPrompt(input);
    if (!output) {
      throw new Error('Failed to get a recommendation from the AI.');
    }
    return output;
  }
);
