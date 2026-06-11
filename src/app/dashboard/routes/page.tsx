"use client";

import { useState, useEffect } from "react";
import { 
  Ambulance, 
  User, 
  Zap, 
  Loader2, 
  Route as RouteIcon,
  Navigation,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateOptimizedRoutes, GenerateOptimizedRoutesOutput } from "@/ai/flows/generate-optimized-routes";

// Coordenadas reais de Rio Claro - RJ (Centro, Lídice, Passa Três)
const mockAppointments = [
  { id: "A1", patientId: "P1", pickupLocation: { lat: -22.7214, lng: -44.1322 }, destinationUbsId: "UBS1", scheduledTime: "08:00", companionCount: 1, specialNeeds: ["wheelchair"] },
  { id: "A2", patientId: "P2", pickupLocation: { lat: -22.7931, lng: -44.0244 }, destinationUbsId: "UBS1", scheduledTime: "08:30" }, // Passa Três
  { id: "A3", patientId: "P3", pickupLocation: { lat: -22.8455, lng: -44.2312 }, destinationUbsId: "UBS2", scheduledTime: "09:00", specialNeeds: ["oxygen"] }, // Lídice
];

const mockVehicles = [
  { id: "V1", type: "Ambulância", capacity: 2, currentLocation: { lat: -22.72, lng: -44.13 }, available: true },
  { id: "V2", type: "Van", capacity: 8, currentLocation: { lat: -22.725, lng: -44.135 }, available: true },
];

const mockDrivers = [
  { id: "D1", name: "Carlos Silva", currentLocation: { lat: -22.72, lng: -44.13 }, available: true },
  { id: "D2", name: "Marcos Pereira", currentLocation: { lat: -22.72, lng: -44.13 }, available: true },
];

export default function RoutesPage() {
  const [mounted, setMounted] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<GenerateOptimizedRoutesOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const data = await generateOptimizedRoutes({
        appointments: mockAppointments as any,
        vehicles: mockVehicles as any,
        drivers: mockDrivers as any,
        ubs: [
          { id: "UBS1", name: "UBS Central", location: { lat: -22.721, lng: -44.132 } },
          { id: "UBS2", name: "UBS Lídice", location: { lat: -22.845, lng: -44.231 } }
        ],
        enableAiAssistance: true
      });
      setResult(data);
      toast({ 
        title: "Otimização Concluída", 
        description: data.optimizationSummary || "Rotas geradas para a malha viária de Rio Claro - RJ." 
      });
    } catch (error: any) {
      console.error("Erro na otimização:", error);
      toast({ 
        title: "Erro na IA", 
        description: "Não foi possível conectar ao motor de inteligência artificial.", 
        variant: "destructive" 
      });
    } finally {
      setOptimizing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Otimizador de Rotas</h2>
          <p className="text-muted-foreground">Logística inteligente para Rio Claro - RJ.</p>
        </div>
        <Button 
          onClick={runOptimization} 
          disabled={optimizing}
          className="bg-primary hover:bg-primary/90 shadow-md h-11 px-8 gap-2"
        >
          {optimizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5 text-accent" />
          )}
          {optimizing ? "Processando..." : "Gerar Rotas Otimizadas"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recursos de Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Agendamentos
              </span>
              <Badge variant="secondary">{mockAppointments.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Ambulance className="h-4 w-4" /> Veículos
              </span>
              <Badge variant="secondary">{mockVehicles.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Motoristas
              </span>
              <Badge variant="secondary">{mockDrivers.length}</Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t mt-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">IA Gemini Flash Online</span>
            </div>
          </CardFooter>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {!result && !optimizing && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-muted/5">
              <div className="p-4 bg-accent/20 rounded-full mb-4">
                <RouteIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Pronto para Otimizar</h3>
              <p className="text-muted-foreground text-sm max-w-sm text-center">
                A IA calculará os melhores trajetos considerando a topografia de Rio Claro e os distritos de Lídice e Passa Três.
              </p>
            </Card>
          )}

          {optimizing && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-semibold animate-pulse">Consultando IA...</p>
                <p className="text-sm text-muted-foreground">Integrando dados geográficos e clínicos para roteirização.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {result.optimizationSummary && (
                <Card className="bg-primary/5 border-none shadow-sm">
                  <CardContent className="pt-6 flex gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary uppercase">Resumo da Inteligência Artificial</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.optimizationSummary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {result.assignments.map((assignment, idx) => (
                  <Card key={idx} className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-bold">ROTA #{idx + 1}</Badge>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Navigation className="h-3 w-3" /> {assignment.estimatedDistanceKm.toFixed(1)} km
                        </div>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {mockVehicles.find(v => v.id === assignment.vehicleId)?.type} - 
                        {mockDrivers.find(d => d.id === assignment.driverId)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-muted-foreground/30">
                        {assignment.route.map((appId, i) => {
                          const app = mockAppointments.find(a => a.id === appId);
                          return (
                            <div key={appId} className="relative">
                              <div className="absolute -left-[20px] top-1 size-3 rounded-full bg-primary ring-4 ring-white" />
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold">Parada {i + 1}: {appId}</p>
                                  <p className="text-xs text-muted-foreground">Paciente: {app?.patientId} • {app?.scheduledTime}</p>
                                </div>
                                {app?.specialNeeds && app.specialNeeds.length > 0 && (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">
                                    {app.specialNeeds[0].toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 py-3">
                      <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {assignment.notes}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
