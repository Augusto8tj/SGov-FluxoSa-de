'use server';
/**
 * @fileOverview Fluxo otimizado para geração de rotas.
 * Focado em eficiência de tokens e resiliência de dados (Híbrido IA + Fallback Geográfico).
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
      pick: String(a.pickupLocation || 'UBS Local').trim(),
      dest: String(a.destination || 'Hospital').trim()
    }));

    const minifiedVehicles = input.vehicles
      .filter(v => v.available)
      .map(v => ({ id: v.id, cap: v.capacity }));

    if (minifiedApps.length === 0 || minifiedVehicles.length === 0) {
      throw new Error("EMPTY_DATA");
    }

    const prompt = `TASK: You are a senior logistics expert for Rio Claro city. Group sanitary transport appointments into available vehicles.
RULES:
1. Use EXACT IDs from 'apps' data. NEVER alter the ID string (e.g., REQ-001 must stay REQ-001).
2. Group by geographic proximity of 'pick' (origin) and 'dest' (destination).
3. Respect vehicle 'cap' (maximum capacity). Do not exceed it.
4. Output ONLY pure JSON. No markdown, no conversational text.

DATA:
- apps: ${JSON.stringify(minifiedApps)}
- fleet: ${JSON.stringify(minifiedVehicles)}

JSON SCHEMA: { "assignments": [{ "vehicleId": "V1", "route": ["REQ-001", "REQ-002"], "estimatedDurationMinutes": 30, "estimatedDistanceKm": 8.5, "notes": "Agrupamento por bairro." }], "optimizationSummary": "String" }`;

    const schemaDescription = `{ assignments: Array<{ vehicleId: string, route: string[], estimatedDurationMinutes: number, estimatedDistanceKm: number, notes: string }>, optimizationSummary: string }`;

    const aiResult = await aiService.generate<GenerateOptimizedRoutesOutput>(
      prompt,
      schemaDescription
    );

    // 2. Validação e Sanitização dos IDs de retorno
    if (aiResult.output?.assignments) {
      const validIds = new Set(input.appointments.map(a => String(a.id).trim()));
      
      const filteredAssignments = aiResult.output.assignments.map(assign => ({
        ...assign,
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
    console.warn("Optimizer: Acionando Fallback Local Determinístico.", error);
    
    return {
      assignments: smartDeterministicGrouping(input.appointments, input.vehicles),
      optimizationSummary: "Otimização concluída via processador geográfico de contingência (Agrupamento Municipal)."
    };
  }
}

/**
 * Algoritmo de Agrupamento Determinístico Geográfico (Fallback de Segurança).
 * Agrupa por Origem e Destino exatos.
 */
function smartDeterministicGrouping(appointments: any[], vehicles: any[]): any[] {
  const availableVehicles = vehicles.filter(v => v.available);
  if (availableVehicles.length === 0 || appointments.length === 0) return [];
    
  const assignments: any[] = [];
  const groups: Record<string, any[]> = {};

  appointments.forEach(app => {
    const pick = String(app.pickupLocation || 'Local').trim();
    const dest = String(app.destination || 'Hospital').trim();
    const key = `${pick}||${dest}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(app);
  });

  let vIdx = 0;
  Object.entries(groups).forEach(([key, apps]) => {
    const [origem] = key.split('||');
    
    for (let i = 0; i < apps.length; i += (availableVehicles[vIdx % availableVehicles.length].capacity || 1)) {
      const currentVehicle = availableVehicles[vIdx % availableVehicles.length];
      const capacity = currentVehicle.capacity || 1;
      const chunk = apps.slice(i, i + capacity);
      
      assignments.push({
        vehicleId: currentVehicle.id,
        route: chunk.map(c => String(c.id).trim()),
        estimatedDurationMinutes: 30 + (chunk.length * 5),
        estimatedDistanceKm: 8.5,
        notes: `Agrupamento automático por setor: ${origem}.`
      });
      vIdx++;
    }
  });
  
  return assignments;
}
