'use server';
/**
 * @fileOverview Fluxo otimizado para geração de rotas.
 * Focado em eficiência de tokens e resiliência de dados.
 */

import { aiService } from '@/services/ai-service';

export type GenerateOptimizedRoutesOutput = {
  assignments: Array<{ 
    vehicleId: string, 
    route: string[], 
    estimatedDurationMinutes: number, 
    estimatedDistanceKm: number, 
    notes: string 
  }>;
  optimizationSummary: string;
};

/**
 * Interface simplificada para economia de tokens na requisição de IA.
 */
interface MinifiedAppointment {
  id: string;
  pick: string;
  dest: string;
}

export async function generateOptimizedRoutes(input: { appointments: any[], vehicles: any[] }): Promise<GenerateOptimizedRoutesOutput> {
  try {
    // 1. Minificação do input para reduzir sobrecarga de tokens
    const minifiedApps: MinifiedAppointment[] = input.appointments.map(a => ({
      id: a.id.trim(),
      pick: a.pickupLocation,
      dest: a.destination
    }));

    const minifiedVehicles = input.vehicles
      .filter(v => v.available)
      .map(v => ({ id: v.id, cap: v.capacity }));

    const prompt = `TASK: Group appointments into vehicles efficiently.
RULES:
1. Use EXACT IDs from 'apps'.
2. Group by 'pick' and 'dest' proximity.
3. Respect vehicle 'cap' (capacity).
4. Output ONLY pure JSON.

DATA:
- apps: ${JSON.stringify(minifiedApps)}
- fleet: ${JSON.stringify(minifiedVehicles)}

JSON FORMAT: { "assignments": [{ "vehicleId", "route": [ids], "estimatedDurationMinutes", "estimatedDistanceKm", "notes" }], "optimizationSummary" }`;

    const schemaDescription = `{ assignments: Array<{ vehicleId: string, route: string[], estimatedDurationMinutes: number, estimatedDistanceKm: number, notes: string }>, optimizationSummary: string }`;

    const aiResult = await aiService.generate<GenerateOptimizedRoutesOutput>(
      prompt,
      schemaDescription
    );

    // 2. Validação e Limpeza Rigorosa
    if (aiResult.output?.assignments) {
      const validIds = new Set(input.appointments.map(a => a.id.trim()));
      
      const filteredAssignments = aiResult.output.assignments.map(assign => ({
        ...assign,
        // Limpeza de IDs contra "alucinações" ou erros de formatação (aspas/espaços)
        route: assign.route
          .map(id => String(id).replace(/['"]/g, '').trim())
          .filter(id => validIds.has(id))
      })).filter(assign => assign.route.length > 0);

      if (filteredAssignments.length > 0) {
        return {
          ...aiResult.output,
          assignments: filteredAssignments
        };
      }
    }

    throw new Error("IA_INVALID_RESPONSE");

  } catch (error) {
    console.warn("Optimizer: Acionando Fallback Local Eficiente.", error);
    
    return {
      assignments: smartDeterministicGrouping(input.appointments, input.vehicles),
      optimizationSummary: "Otimização concluída via processador local de contingência (Agrupamento Geográfico Municipal)."
    };
  }
}

/**
 * Algoritmo de Agrupamento Determinístico Geográfico (Fallback de Segurança).
 */
function smartDeterministicGrouping(appointments: any[], vehicles: any[]): any[] {
  const availableVehicles = vehicles.filter(v => v.available);
  if (availableVehicles.length === 0 || appointments.length === 0) return [];
    
  const assignments: any[] = [];
  const groups: Record<string, any[]> = {};

  // Agrupamento por chave geográfica
  appointments.forEach(app => {
    const key = `${app.pickupLocation}||${app.destination}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(app);
  });

  let vIdx = 0;
  Object.entries(groups).forEach(([key, apps]) => {
    const vehicle = availableVehicles[vIdx % availableVehicles.length];
    const capacity = vehicle.capacity || 1;
    
    for (let i = 0; i < apps.length; i += capacity) {
      const chunk = apps.slice(i, i + capacity);
      const currentVehicle = availableVehicles[vIdx % availableVehicles.length];
      
      assignments.push({
        vehicleId: currentVehicle.id,
        route: chunk.map(c => c.id),
        estimatedDurationMinutes: 30 + (chunk.length * 5),
        estimatedDistanceKm: 8.5,
        notes: `Agrupamento municipal automático por proximidade geográfica.`
      });
      vIdx++;
    }
  });
  
  return assignments;
}