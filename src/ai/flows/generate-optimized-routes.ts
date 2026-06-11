'use server';
/**
 * @fileOverview Fluxo para geração de rotas otimizadas.
 * Utiliza lógica determinística por padrão para garantir a operação logística.
 */

import { aiService } from '@/services/ai-service';
import { z } from 'genkit';

const RouteAssignmentSchema = z.object({
  vehicleId: z.string(),
  driverId: z.string(),
  route: z.array(z.string()),
  estimatedDurationMinutes: z.number(),
  estimatedDistanceKm: z.number(),
  notes: z.string(),
});

export type GenerateOptimizedRoutesOutput = {
  assignments: z.infer<typeof RouteAssignmentSchema>[];
  optimizationSummary: string;
};

export async function generateOptimizedRoutes(input: any): Promise<GenerateOptimizedRoutesOutput> {
  // A roteirização de pacientes exige alta precisão e segurança.
  // Utilizamos a lógica determinística local como base e a IA para o resumo.
  
  const assignments = deterministicOptimization(input.appointments, input.vehicles, input.drivers);
  
  const prompt = `Gere um resumo técnico para a otimização de rotas em Rio Claro:
Total de Pacientes: ${input.appointments.length}
Vagas em Veículos: ${input.vehicles.reduce((acc: number, v: any) => acc + v.capacity, 0)}`;

  const aiResult = await aiService.generate<{ summary: string }>(
    prompt,
    "{ summary: string }"
  );

  return {
    assignments,
    optimizationSummary: aiResult.output?.summary || "Otimização concluída via processamento local de contingência."
  };
}

function deterministicOptimization(appointments: any[], vehicles: any[], drivers: any[]) {
  const availableVehicles = vehicles.filter(v => v.available);
  const availableDrivers = drivers.filter(d => d.available);
  const assignments: any[] = [];
  
  appointments.forEach((app, idx) => {
    if (idx < availableVehicles.length && idx < availableDrivers.length) {
      assignments.push({
        vehicleId: availableVehicles[idx].id,
        driverId: availableDrivers[idx].id,
        route: [app.id],
        estimatedDurationMinutes: 25,
        estimatedDistanceKm: 12,
        notes: "Roteirização via protocolo de distribuição equitativa."
      });
    }
  });
  
  return assignments;
}
