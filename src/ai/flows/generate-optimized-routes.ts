'use server';
/**
 * @fileOverview Fluxo otimizado para geração de rotas.
 * Focado em eficiência de tokens e resiliência de dados (Híbrido IA + Fallback).
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

interface MinifiedAppointment {
  id: string;
  pick: string;
  dest: string;
}

export async function generateOptimizedRoutes(input: { appointments: any[], vehicles: any[] }): Promise<GenerateOptimizedRoutesOutput> {
  try {
    // 1. Preparação: Minificação rigorosa do input
    const minifiedApps: MinifiedAppointment[] = input.appointments.map(a => ({
      id: String(a.id).trim(),
      pick: a.pickupLocation,
      dest: a.destination
    }));

    const minifiedVehicles = input.vehicles
      .filter(v => v.available)
      .map(v => ({ id: v.id, cap: v.capacity }));

    if (minifiedApps.length === 0 || minifiedVehicles.length === 0) {
      throw new Error("EMPTY_DATA");
    }

    const prompt = `TASK: You are a logistics expert for Rio Claro city. Group appointments into vehicles efficiently.
RULES:
1. Use EXACT IDs from 'apps' data. NEVER change a digit.
2. Group by 'pick' (origin) and 'dest' proximity.
3. Respect vehicle 'cap' (maximum capacity).
4. Output ONLY pure JSON. No text, no markdown.

DATA:
- apps: ${JSON.stringify(minifiedApps)}
- fleet: ${JSON.stringify(minifiedVehicles)}

JSON SCHEMA: { "assignments": [{ "vehicleId", "route": [id1, id2], "estimatedDurationMinutes", "estimatedDistanceKm", "notes" }], "optimizationSummary" }`;

    const schemaDescription = `{ assignments: Array<{ vehicleId: string, route: string[], estimatedDurationMinutes: number, estimatedDistanceKm: number, notes: string }>, optimizationSummary: string }`;

    const aiResult = await aiService.generate<GenerateOptimizedRoutesOutput>(
      prompt,
      schemaDescription
    );

    // 2. Validação e Sanitização Rigorosa
    if (aiResult.output?.assignments) {
      const validIds = new Set(input.appointments.map(a => String(a.id).trim()));
      
      const filteredAssignments = aiResult.output.assignments.map(assign => ({
        ...assign,
        // Limpeza de IDs contra alucinações ou aspas extras do modelo
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
      optimizationSummary: "Otimização concluída via processador geográfico de contingência (Agrupamento Municipal)."
    };
  }
}

/**
 * Algoritmo de Agrupamento Determinístico Geográfico (Fallback de Segurança).
 * Agrupa por Origem e Destino exatos para maximizar a lógica da demonstração.
 */
function smartDeterministicGrouping(appointments: any[], vehicles: any[]): any[] {
  const availableVehicles = vehicles.filter(v => v.available);
  if (availableVehicles.length === 0 || appointments.length === 0) return [];
    
  const assignments: any[] = [];
  const groups: Record<string, any[]> = {};

  // Agrupamento por chave geográfica combinada (Chave: Origem||Destino)
  appointments.forEach(app => {
    const key = `${app.pickupLocation}||${app.destination}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(app);
  });

  let vIdx = 0;
  Object.entries(groups).forEach(([key, apps]) => {
    const vehicle = availableVehicles[vIdx % availableVehicles.length];
    const capacity = vehicle.capacity || 1;
    
    // Divide os pacientes do grupo em "pedaços" que cabem no veículo
    for (let i = 0; i < apps.length; i += capacity) {
      const chunk = apps.slice(i, i + capacity);
      const currentVehicle = availableVehicles[vIdx % availableVehicles.length];
      
      assignments.push({
        vehicleId: currentVehicle.id,
        route: chunk.map(c => String(c.id).trim()),
        estimatedDurationMinutes: 30 + (chunk.length * 5),
        estimatedDistanceKm: 8.5,
        notes: `Agrupamento automático por setor: ${key.split('||')[0]}.`
      });
      vIdx++;
    }
  });
  
  return assignments;
}
