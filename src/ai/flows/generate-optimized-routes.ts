'use server';
/**
 * @fileOverview Fluxo para geração de rotas otimizadas.
 * Utiliza IA para agrupar pacientes em veículos com base em localização e capacidade.
 */

import { aiService } from '@/services/ai-service';
import { z } from 'genkit';

const RouteAssignmentSchema = z.object({
  vehicleId: z.string(),
  route: z.array(z.string()).describe("Lista de IDs das solicitações/agendamentos"),
  estimatedDurationMinutes: z.number(),
  estimatedDistanceKm: z.number(),
  notes: z.string().describe("Explicação do porquê esse grupo foi formado"),
});

export type GenerateOptimizedRoutesOutput = {
  assignments: z.infer<typeof RouteAssignmentSchema>[];
  optimizationSummary: string;
};

export async function generateOptimizedRoutes(input: any): Promise<GenerateOptimizedRoutesOutput> {
  const prompt = `Você é o Coordenador de Logística de Saúde de Rio Claro - RJ.
Sua missão é distribuir os seguintes pacientes nos veículos disponíveis da forma mais eficiente possível.

DADOS DE ENTRADA:
- Pacientes (Pedidos): ${JSON.stringify(input.appointments)}
- Veículos Disponíveis: ${JSON.stringify(input.vehicles)}

REGRAS DE NEGÓCIO:
1. Agrupe pacientes que saem do mesmo distrito ou UBS para o mesmo destino.
2. Respeite a CAPACIDADE de cada veículo.
3. Priorize ambulâncias para casos que pareçam mais urgentes (distâncias longas ou termos clínicos).
4. Minimize a quilometragem total da frota.

Responda em Português do Brasil.`;

  const schemaDescription = `{ 
    assignments: Array<{ vehicleId: string, route: string[], estimatedDurationMinutes: number, estimatedDistanceKm: number, notes: string }>, 
    optimizationSummary: string 
  }`;

  const aiResult = await aiService.generate<GenerateOptimizedRoutesOutput>(
    prompt,
    schemaDescription
  );

  if (aiResult.output && aiResult.output.assignments) {
    return aiResult.output;
  }

  // Fallback Determinístico caso a IA falhe
  return {
    assignments: deterministicOptimization(input.appointments, input.vehicles),
    optimizationSummary: "Otimização concluída via processamento local de contingência."
  };
}

function deterministicOptimization(appointments: any[], vehicles: any[]) {
  const availableVehicles = vehicles.filter(v => v.available);
  const assignments: any[] = [];
  
  // Distribuição simples 1:1 para não travar o sistema
  appointments.forEach((app, idx) => {
    if (idx < availableVehicles.length) {
      assignments.push({
        vehicleId: availableVehicles[idx].id,
        route: [app.id],
        estimatedDurationMinutes: 30,
        estimatedDistanceKm: 15,
        notes: "Distribuição individual (Modo de Contingência)."
      });
    }
  });
  
  return assignments;
}
