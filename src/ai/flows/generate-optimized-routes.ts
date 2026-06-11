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
// In a real application, this tool would make an actual API call to an external service like OpenRouter
// or a custom optimization engine. For this example, we provide a mock implementation.
const optimizeRoutesWithOpenRouter = ai.defineTool(
  {
    name: 'optimizeRoutesWithOpenRouter',
    description: 'Optimizes transportation routes and assigns vehicles and drivers based on patient appointments, vehicle availability, and driver assignments using an external optimization service (e.g., OpenRouter API).',
    inputSchema: z.object({
      appointments: z.array(AppointmentSchema),
      vehicles: z.array(VehicleSchema),
      drivers: z.array(DriverSchema),
      ubs: z.array(UbsSchema),
    }).describe('Input data required by the OpenRouter optimization API.'),
    outputSchema: z.array(RouteAssignmentSchema).describe('Optimized route assignments returned by the OpenRouter API.'),
  },
  async (input) => {
    // --- MOCK IMPLEMENTATION FOR OPENROUTER API CALL ---
    console.log('Mock OpenRouter API called with input:', input);

    const availableVehicles = input.vehicles.filter(v => v.available);
    const availableDrivers = input.drivers.filter(d => d.available);
    const appointmentsToAssign = [...input.appointments]; // Create a mutable copy

    const assignments: z.infer<typeof RouteAssignmentSchema>[] = [];
    
    let vehicleIndex = 0;
    let driverIndex = 0;

    // Simple mock assignment logic: assign one appointment per available vehicle/driver pair
    while (appointmentsToAssign.length > 0 && vehicleIndex < availableVehicles.length && driverIndex < availableDrivers.length) {
      const appointment = appointmentsToAssign.shift(); // Take the first appointment
      if (appointment) {
        const vehicle = availableVehicles[vehicleIndex % availableVehicles.length]; // Cycle through vehicles
        const driver = availableDrivers[driverIndex % availableDrivers.length]; // Cycle through drivers

        assignments.push({
          vehicleId: vehicle.id,
          driverId: driver.id,
          route: [appointment.id], // Assign only this one appointment for simplicity in mock
          estimatedDurationMinutes: 15 + Math.random() * 30, // Random duration
          estimatedDistanceKm: 5 + Math.random() * 20, // Random distance
          notes: `Mock assignment for appointment ${appointment.id}.`
        });

        vehicleIndex++;
        driverIndex++;
      }
    }

    return assignments;
    // --- END MOCK IMPLEMENTATION ---
  }
);

const optimizeRoutesPrompt = ai.definePrompt({
  name: 'optimizeRoutesPrompt',
  tools: [optimizeRoutesWithOpenRouter],
  input: { schema: GenerateOptimizedRoutesInputSchema },
  output: { schema: GenerateOptimizedRoutesOutputSchema },
  prompt: `You are an intelligent route optimization assistant for the SGov FluxoSaúde system.\nYour task is to utilize the provided data to generate the most efficient transportation routes and assign suitable vehicles and drivers for patient appointments.\n\n1. Call the 'optimizeRoutesWithOpenRouter' tool, passing all 'appointments', 'vehicles', 'drivers', and 'ubs' from the input to it.\n2. Based on the assignments returned by the tool, identify all appointment IDs that were assigned to a route and any that were not.\n3. Provide the final route assignments, the list of unassigned appointment IDs, and a brief optimization summary in the 'GenerateOptimizedRoutesOutputSchema' format.\n\nExample of tool call:\n{{call optimizeRoutesWithOpenRouter appointments=appointments vehicles=vehicles drivers=drivers ubs=ubs}}`,
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
    // If AI assistance is explicitly disabled, bypass the AI and return a predefined response.
    if (input.enableAiAssistance === false) {
      return {
        assignments: [],
        unassignedAppointmentIds: input.appointments.map(app => app.id),
        optimizationSummary: 'AI assistance for route optimization is currently disabled. No routes were generated by AI.'
      };
    }

    // Call the prompt which orchestrates the tool call for optimization.
    const { output } = await optimizeRoutesPrompt(input);

    // The LLM's output directly adheres to GenerateOptimizedRoutesOutputSchema.
    // However, if the LLM fails to populate unassignedAppointmentIds or optimizationSummary
    // or if the tool call failed, we should have fallbacks.
    // The prompt explicitly instructs the LLM to handle unassigned IDs.

    // Re-calculating unassigned appointments as a robust fallback/validation
    const assignedAppointmentIds = new Set(output?.assignments?.flatMap(assignment => assignment.route) || []);
    const allInputAppointmentIds = new Set(input.appointments.map(app => app.id));
    const computedUnassignedAppointmentIds = Array.from(allInputAppointmentIds).filter(id => !assignedAppointmentIds.has(id));

    return {
      assignments: output?.assignments || [],
      unassignedAppointmentIds: output?.unassignedAppointmentIds || computedUnassignedAppointmentIds,
      optimizationSummary: output?.optimizationSummary || 'Route optimization completed using AI assistance. Please review the generated assignments.'
    };
  }
);
