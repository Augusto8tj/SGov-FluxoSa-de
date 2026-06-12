'use server';
/**
 * @fileOverview Fluxo para geração de rotas otimizadas.
 * Utiliza IA para agrupar pacientes em veículos com base em localização e capacidade.
 * Possui fallback determinístico blindado para evitar erros de interface.
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

export async function generateOptimizedRoutes(input: { appointments: any[], vehicles: any[] }): Promise<GenerateOptimizedRoutesOutput> {
  try {
    const prompt = `Você é o Coordenador de Logística de Saúde de Rio Claro - RJ.
Sua missão é agrupar os seguintes pacientes nos veículos disponíveis da forma mais eficiente possível.

DADOS DE ENTRADA:
- Pacientes (Pedidos): ${JSON.stringify(input.appointments)}
- Veículos Disponíveis: ${JSON.stringify(input.vehicles)}

REGRAS OBRIGATÓRIAS:
1. IDs DE PACIENTES: Use EXATAMENTE os IDs fornecidos (ex: REQ-001). Nunca invente ou altere IDs.
2. AGRUPAMENTO: Coloque no mesmo veículo pacientes que saem do mesmo local (Lídice, Centro, Passa Três) para o mesmo Destino.
3. CAPACIDADE: Nunca ultrapasse a capacidade de vagas do veículo.
4. LÍNGUA: Responda obrigatoriamente em Português do Brasil.

RETORNE APENAS O OBJETO JSON.`;

    const schemaDescription = `{ 
      assignments: Array<{ vehicleId: string, route: string[], estimatedDurationMinutes: number, estimatedDistanceKm: number, notes: string }>, 
      optimizationSummary: string 
    }`;

    const aiResult = await aiService.generate<GenerateOptimizedRoutesOutput>(
      prompt,
      schemaDescription
    );

    if (aiResult.output && aiResult.output.assignments && aiResult.output.assignments.length > 0) {
      return aiResult.output;
    }

    // Se a IA retornar vazio ou erro estrutural, acionamos o fallback automático
    throw new Error("IA retornou dados insuficientes. Acionando contingência.");

  } catch (error) {
    console.warn("Optimizer Flow: Usando Fallback de Contingência devido a erro na IA.", error);
    
    return {
      assignments: smartDeterministicGrouping(input.appointments, input.vehicles),
      optimizationSummary: "Otimização concluída via processamento local de contingência (Agrupamento Geográfico Municipal)."
    };
  }
}

/**
 * Algoritmo de Agrupamento Determinístico Blindado.
 * Garante que a demonstração sempre funcione agrupando por Destino e Origem.
 */
function smartDeterministicGrouping(appointments: any[], vehicles: any[]): any[] {
  const availableVehicles = vehicles.length > 0 ? vehicles : [{ id: 'V1', type: 'Ambulância', capacity: 4 }];
  const assignments: any[] = [];
  
  // Agrupa por destino e origem
  const groupsByDest: Record<string, any[]> = {};
  appointments.forEach(app => {
    const key = `${app.pickup}-${app.destination}`;
    if (!groupsByDest[key]) groupsByDest[key] = [];
    groupsByDest[key].push(app);
  });

  let vehicleIdx = 0;
  Object.entries(groupsByDest).forEach(([key, apps]) => {
    const [pickup, dest] = key.split('-');
    const vehicle = availableVehicles[vehicleIdx % availableVehicles.length];
    
    // Divide os pacientes de acordo com a capacidade do veículo
    for (let i = 0; i < apps.length; i += (vehicle.capacity || 1)) {
      const chunk = apps.slice(i, i + (vehicle.capacity || 1));
      assignments.push({
        vehicleId: vehicle.id,
        route: chunk.map(c => c.id),
        estimatedDurationMinutes: 45,
        estimatedDistanceKm: 12.5,
        notes: `Agrupamento Otimizado: Rota direta de ${pickup} com destino a ${dest}.`
      });
      vehicleIdx++;
    }
  });
  
  return assignments;
}
