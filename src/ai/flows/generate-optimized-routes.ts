'use server';
/**
 * @fileOverview A Genkit flow for generating optimized routes and vehicle assignments for patient transportation.
 *
 * - generateOptimizedRoutes - A function that handles the route optimization process using AI.
 * - GenerateOptimizedRoutesInput - The input type for the generateOptimizedRoutes function.
 * - GenerateOptimizedRoutesOutput - The return type for the generateOptimizedRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schemas
const LocationSchema = z.object({
  lat: z.number().describe('Latitude of the location.'),
  lng: z.number().describe('Longitude of the location.'),
});

const AppointmentSchema = z.object({
  id: z.string().describe('Unique identifier for the appointment.'),
  patientId: z.string().describe('Identifier for the patient.'),
  pickupLocation: LocationSchema.describe("Patient's pickup location."),
  destinationUbsId: z.string().describe('ID of the destination health post (UBS).'),
  scheduledTime: z.string().describe('Scheduled time for the appointment (e.g., "HH:MM").'),
  companionCount: z.number().optional().describe('Number of companions accompanying the patient.'),
  specialNeeds: z.array(z.string()).optional().describe('List of special needs for the patient (e.g., "wheelchair", "oxygen").'),
});

const UbsSchema = z.object({
  id: z.string().describe('Unique identifier for the health post (UBS).'),
  name: z.string().describe('Name of the health post.'),
  location: LocationSchema.describe('Location of the health post.'),
});

const VehicleSchema = z.object({
  id: z.string().describe('Unique identifier for the vehicle.'),
  type: z.string().describe('Type of vehicle (e.g., "ambulance", "van").'),
  capacity: z.number().describe('Maximum patient capacity of the vehicle.'),
  currentLocation: LocationSchema.describe('Current location of the vehicle.'),
  available: z.boolean().describe('Availability status of the vehicle.'),
});

const DriverSchema = z.object({
  id: z.string().describe('Unique identifier for the driver.'),
  name: z.string().describe('Name of the driver.'),
  currentLocation: LocationSchema.describe('Current location of the driver.'),
  available: z.boolean().describe('Availability status of the driver.'),
});

const GenerateOptimizedRoutesInputSchema = z.object({
  appointments: z.array(AppointmentSchema).describe('List of approved patient appointments needing transportation.'),
  ubs: z.array(UbsSchema).describe('List of health posts (UBS) in the system.'),
  vehicles: z.array(VehicleSchema).describe('List of available vehicles.'),
  drivers: z.array(DriverSchema).describe('List of available drivers.'),
  enableAiAssistance: z.boolean().optional().default(true).describe('Whether the AI should actively assist in decision making, primarily by invoking the optimization tool.'),
});
export type GenerateOptimizedRoutesInput = z.infer<typeof GenerateOptimizedRoutesInputSchema>;

// Output Schemas
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
  unassignedAppointmentIds: z.array(z.string()).optional().describe('List of appointment IDs that could not be assigned to any route by the AI.'),
  optimizationSummary: z.string().optional().describe('A summary of the optimization results provided by the AI.'),
});
export type GenerateOptimizedRoutesOutput = z.infer<typeof GenerateOptimizedRoutesOutputSchema>;

// Genkit Tool: Simulates calling OpenRouter API for route optimization
const optimizeRoutesWithOpenRouter = ai.defineTool(
  {
    name: 'optimizeRoutesWithOpenRouter',
    description: 'Optimizes transportation routes and assigns vehicles and drivers based on patient appointments, vehicle availability, and driver assignments using an external optimization service.',
    inputSchema: z.object({
      appointments: z.array(AppointmentSchema),
      vehicles: z.array(VehicleSchema),
      drivers: z.array(DriverSchema),
      ubs: z.array(UbsSchema),
    }).describe('Input data required by the optimization tool.'),
    outputSchema: z.array(RouteAssignmentSchema).describe('Optimized route assignments returned by the tool.'),
  },
  async (input) => {
    // --- MOCK IMPLEMENTATION FOR ROUTE OPTIMIZATION ---
    console.log('Optimization tool called with input:', input);

    const availableVehicles = input.vehicles.filter(v => v.available);
    const availableDrivers = input.drivers.filter(d => d.available);
    const appointmentsToAssign = [...input.appointments];

    const assignments: z.infer<typeof RouteAssignmentSchema>[] = [];
    
    let vehicleIndex = 0;
    let driverIndex = 0;

    while (appointmentsToAssign.length > 0 && vehicleIndex < availableVehicles.length && driverIndex < availableDrivers.length) {
      const appointment = appointmentsToAssign.shift();
      if (appointment) {
        const vehicle = availableVehicles[vehicleIndex % availableVehicles.length];
        const driver = availableDrivers[driverIndex % availableDrivers.length];

        assignments.push({
          vehicleId: vehicle.id,
          driverId: driver.id,
          route: [appointment.id],
          estimatedDurationMinutes: 15 + Math.random() * 30,
          estimatedDistanceKm: 5 + Math.random() * 20,
          notes: `Atendimento otimizado para o agendamento ${appointment.id}.`
        });

        vehicleIndex++;
        driverIndex++;
      }
    }

    return assignments;
  }
);

const optimizeRoutesPrompt = ai.definePrompt({
  name: 'optimizeRoutesPrompt',
  tools: [optimizeRoutesWithOpenRouter],
  input: { schema: GenerateOptimizedRoutesInputSchema },
  output: { schema: GenerateOptimizedRoutesOutputSchema },
  prompt: `Você é um assistente inteligente de otimização de rotas para o sistema SGov FluxoSaúde.
Sua tarefa é utilizar os dados fornecidos para gerar as rotas de transporte mais eficientes e atribuir veículos e motoristas adequados para os agendamentos dos pacientes.

Siga estas instruções:
1. Chame a ferramenta 'optimizeRoutesWithOpenRouter', passando todos os 'appointments', 'vehicles', 'drivers' e 'ubs' do input para ela.
2. Com base nas atribuições retornadas pela ferramenta, identifique todos os IDs de agendamento que foram atribuídos a uma rota e quaisquer que não foram.
3. Forneça as atribuições de rota finais, a lista de IDs de agendamento não atribuídos e um breve resumo da otimização no formato solicitado.`,
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
    if (input.enableAiAssistance === false) {
      return {
        assignments: [],
        unassignedAppointmentIds: input.appointments.map(app => app.id),
        optimizationSummary: 'A assistência de IA para otimização de rotas está desativada. Nenhuma rota foi gerada.'
      };
    }

    // Call the prompt which orchestrates the tool call for optimization.
    const { output } = await optimizeRoutesPrompt(input);

    // Re-calculating unassigned appointments as a robust fallback/validation
    const assignedAppointmentIds = new Set(output?.assignments?.flatMap(assignment => assignment.route) || []);
    const allInputAppointmentIds = new Set(input.appointments.map(app => app.id));
    const computedUnassignedAppointmentIds = Array.from(allInputAppointmentIds).filter(id => !assignedAppointmentIds.has(id));

    return {
      assignments: output?.assignments || [],
      unassignedAppointmentIds: output?.unassignedAppointmentIds || computedUnassignedAppointmentIds,
      optimizationSummary: output?.optimizationSummary || 'Otimização de rotas concluída com assistência de IA.'
    };
  }
);