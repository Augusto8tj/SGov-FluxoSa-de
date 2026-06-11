'use server';
/**
 * @fileOverview A Genkit flow for generating optimized routes and vehicle assignments for patient transportation.
 * Includes a deterministic fallback logic to handle AI rate limits or exhaustion errors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AppointmentSchema = z.object({
  id: z.string().describe('Unique identifier for the appointment.'),
  patientId: z.string().describe('Identifier for the patient.'),
  pickupLocation: z.object({
    lat: z.number().describe('Latitude of the pickup point.'),
    lng: z.number().describe('Longitude of the pickup point.'),
  }).describe("Patient's pickup location."),
  destinationUbsId: z.string().describe('ID of the destination health post (UBS).'),
  scheduledTime: z.string().describe('Scheduled time for the appointment (e.g., "HH:MM").'),
  companionCount: z.number().optional().describe('Number of companions accompanying the patient.'),
  specialNeeds: z.array(z.string()).optional().describe('List of special needs for the patient (e.g., "wheelchair", "oxygen").'),
});

const UbsSchema = z.object({
  id: z.string().describe('Unique identifier for the health post (UBS).'),
  name: z.string().describe('Name of the health post.'),
  location: z.object({
    lat: z.number().describe('Latitude of the UBS.'),
    lng: z.number().describe('Longitude of the UBS.'),
  }).describe('Location of the health post.'),
});

const VehicleSchema = z.object({
  id: z.string().describe('Unique identifier for the vehicle.'),
  type: z.string().describe('Type of vehicle (e.g., "ambulance", "van").'),
  capacity: z.number().describe('Maximum patient capacity of the vehicle.'),
  currentLocation: z.object({
    lat: z.number().describe('Latitude of current position.'),
    lng: z.number().describe('Longitude of current position.'),
  }).describe('Current location of the vehicle.'),
  available: z.boolean().describe('Availability status of the vehicle.'),
});

const DriverSchema = z.object({
  id: z.string().describe('Unique identifier for the driver.'),
  name: z.string().describe('Name of the driver.'),
  currentLocation: z.object({
    lat: z.number().describe('Latitude of driver position.'),
    lng: z.number().describe('Longitude of driver position.'),
  }).describe('Current location of the driver.'),
  available: z.boolean().describe('Availability status of the driver.'),
});

const GenerateOptimizedRoutesInputSchema = z.object({
  appointments: z.array(AppointmentSchema).describe('List of approved patient appointments needing transportation.'),
  ubs: z.array(UbsSchema).describe('List of health posts (UBS) in the system.'),
  vehicles: z.array(VehicleSchema).describe('List of available vehicles.'),
  drivers: z.array(DriverSchema).describe('List of available drivers.'),
  enableAiAssistance: z.boolean().optional().default(true).describe('Whether the AI should actively assist in decision making.'),
});
export type GenerateOptimizedRoutesInput = z.infer<typeof GenerateOptimizedRoutesInputSchema>;

const RouteAssignmentSchema = z.object({
  vehicleId: z.string().describe('ID of the assigned vehicle.'),
  driverId: z.string().describe('ID of the assigned driver.'),
  route: z.array(z.string()).describe('Ordered list of appointment IDs for this route.'),
  estimatedDurationMinutes: z.number().describe('Estimated duration of the route in minutes.'),
  estimatedDistanceKm: z.number().describe('Estimated distance of the route in kilometers.'),
  notes: z.string().optional().describe('Additional notes or details about the route assignment.'),
});

const GenerateOptimizedRoutesOutputSchema = z.object({
  assignments: z.array(RouteAssignmentSchema).describe('Optimized route assignments for vehicles and drivers.'),
  unassignedAppointmentIds: z.array(z.string()).optional().describe('List of appointment IDs that could not be assigned.'),
  optimizationSummary: z.string().optional().describe('A summary of the optimization results provided by the AI.'),
});
export type GenerateOptimizedRoutesOutput = z.infer<typeof GenerateOptimizedRoutesOutputSchema>;

const optimizeRoutesWithOpenRouter = ai.defineTool(
  {
    name: 'optimizeRoutesWithOpenRouter',
    description: 'Optimizes transportation routes based on availability.',
    inputSchema: z.object({
      appointments: z.array(AppointmentSchema),
      vehicles: z.array(VehicleSchema),
      drivers: z.array(DriverSchema),
      ubs: z.array(UbsSchema),
    }),
    outputSchema: z.array(RouteAssignmentSchema),
  },
  async (input) => {
    return deterministicOptimization(input.appointments, input.vehicles, input.drivers);
  }
);

function deterministicOptimization(appointments: any[], vehicles: any[], drivers: any[]) {
  const availableVehicles = vehicles.filter(v => v.available);
  const availableDrivers = drivers.filter(d => d.available);
  const appointmentsToAssign = [...appointments];
  const assignments: any[] = [];
  
  let vIdx = 0;
  let dIdx = 0;

  while (appointmentsToAssign.length > 0 && vIdx < availableVehicles.length && dIdx < availableDrivers.length) {
    const app = appointmentsToAssign.shift();
    if (app) {
      const vehicle = availableVehicles[vIdx % availableVehicles.length];
      const driver = availableDrivers[dIdx % availableDrivers.length];
      assignments.push({
        vehicleId: vehicle.id,
        driverId: driver.id,
        route: [app.id],
        estimatedDurationMinutes: 25,
        estimatedDistanceKm: 12,
        notes: `Roteirização básica para o paciente ${app.patientId}.`
      });
      vIdx++;
      dIdx++;
    }
  }
  return assignments;
}

const optimizeRoutesPrompt = ai.definePrompt({
  name: 'optimizeRoutesPrompt',
  tools: [optimizeRoutesWithOpenRouter],
  input: { schema: GenerateOptimizedRoutesInputSchema },
  output: { schema: GenerateOptimizedRoutesOutputSchema },
  prompt: `Você é um assistente inteligente de otimização de rotas para o sistema SGov FluxoSaúde.
Utilize a ferramenta 'optimizeRoutesWithOpenRouter' para calcular a melhor distribuição de pacientes.`,
});

export async function generateOptimizedRoutes(input: GenerateOptimizedRoutesInput): Promise<GenerateOptimizedRoutesOutput> {
  return generateOptimizedRoutesFlow(input);
}

const generateOptimizedRoutesFlow = ai.defineFlow(
  {
    name: 'generateOptimizedRoutesFlow',
    inputSchema: GenerateOptimizedRoutesInputSchema,
    outputSchema: GenerateOptimizedRoutesOutputSchema,
  },
  async (input) => {
    try {
      if (input.enableAiAssistance === false) throw new Error('AI Disabled');

      const { output } = await optimizeRoutesPrompt(input);
      
      const assignedIds = new Set(output?.assignments?.flatMap(a => a.route) || []);
      const unassigned = input.appointments.filter(a => !assignedIds.has(a.id)).map(a => a.id);

      return {
        assignments: output?.assignments || [],
        unassignedAppointmentIds: output?.unassignedAppointmentIds || unassigned,
        optimizationSummary: output?.optimizationSummary || 'Otimização concluída com sucesso.'
      };
    } catch (error) {
      console.warn("AI Route Optimization failed, using deterministic fallback:", error);
      const fallbackAssignments = deterministicOptimization(input.appointments, input.vehicles, input.drivers);
      const assignedIds = new Set(fallbackAssignments.flatMap(a => a.route));
      
      return {
        assignments: fallbackAssignments,
        unassignedAppointmentIds: input.appointments.filter(a => !assignedIds.has(a.id)).map(a => a.id),
        optimizationSummary: 'Processamento local ativo. O motor de IA está temporariamente indisponível ou em limite de cota.'
      };
    }
  }
);