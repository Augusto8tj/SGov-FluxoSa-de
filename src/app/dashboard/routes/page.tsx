
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Ambulance, 
  User, 
  Zap, 
  Loader2, 
  Route as RouteIcon,
  Navigation,
  CheckCircle2,
  Send,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateOptimizedRoutes, GenerateOptimizedRoutesOutput } from "@/ai/flows/generate-optimized-routes";
import { requestService } from "@/services/request-service";
import { vehicleService } from "@/services/vehicle-service";
import { TransportRequest, Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RoutesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [committing, setCommitting] = useState(false);
  
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [result, setResult] = useState<GenerateOptimizedRoutesOutput | null>(null);
  
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, vehs] = await Promise.all([
        requestService.getRequests(),
        vehicleService.getVehicles()
      ]);
      
      // Filtra apenas pedidos aprovados que ainda não possuem manifesto
      const pendingManifest = reqs.filter(r => r.status === 'APPROVED' && !r.manifestId);
      setRequests(pendingManifest);
      setVehicles(vehs.filter(v => v.status === 'AVAILABLE'));
    } catch {
      toast({ title: "Erro de Carga", description: "Não foi possível carregar dados reais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const runOptimization = async () => {
    if (requests.length === 0) {
      toast({ title: "Sem Demanda", description: "Não há pedidos aprovados aguardando manifesto." });
      return;
    }

    setOptimizing(true);
    try {
      // Prepara dados para o fluxo
      const appointments = requests.map(r => ({
        id: r.id,
        patientId: r.patientName,
        pickupLocation: r.pickupLocation,
        destination: r.destinationLocation
      }));

      const drivers = [
        { id: "D1", name: "Carlos Silva", available: true },
        { id: "D2", name: "Marcos Pereira", available: true },
        { id: "D3", name: "Ana Cláudia", available: true },
      ];

      const data = await generateOptimizedRoutes({
        appointments,
        vehicles: vehicles.map(v => ({ id: v.id, type: v.type, capacity: v.capacity, available: true })),
        drivers,
        ubs: [],
        enableAiAssistance: true
      });
      
      setResult(data);
      toast({ 
        title: "Otimização Concluída", 
        description: "Rotas geradas para a malha viária de Rio Claro." 
      });
    } catch (error: any) {
      toast({ 
        title: "Erro na IA", 
        description: "Falha ao processar roteirização inteligente.", 
        variant: "destructive" 
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleCommitManifestos = async () => {
    if (!result) return;
    setCommitting(true);
    try {
      // Enriquecer atribuições com nomes legíveis para o Firestore
      const assignments = result.assignments.map(a => ({
        ...a,
        vehicleType: vehicles.find(v => v.id === a.vehicleId)?.type || "Viatura Municipal",
        driverName: "Plantão Logística" // Simulando busca de motorista
      }));

      await requestService.createManifestBatch(assignments);
      
      toast({ title: "Manifestos Criados", description: "Os motoristas foram notificados via aplicativo." });
      setResult(null);
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na Gravação", description: error.message, variant: "destructive" });
    } finally {
      setCommitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Otimizador de Rotas</h2>
          <p className="text-muted-foreground">Converta pedidos autorizados em manifestos de viagem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="h-11 rounded-xl">Recarregar</Button>
          <Button 
            onClick={runOptimization} 
            disabled={optimizing || requests.length === 0}
            className="bg-primary hover:bg-primary/90 shadow-md h-11 px-8 gap-2 rounded-xl"
          >
            {optimizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-accent" />}
            {optimizing ? "Processando..." : "Otimizar Logística"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Fila de Espera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Aprovados sem Rota
              </span>
              <Badge variant={requests.length > 0 ? "default" : "secondary"}>{requests.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Ambulance className="h-4 w-4" /> Viaturas Livres
              </span>
              <Badge variant="secondary">{vehicles.length}</Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t mt-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Algoritmo Rio Claro v1.1</span>
            </div>
          </CardFooter>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {!result && !optimizing && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2.5rem]">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <RouteIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Aguardando Planejamento</h3>
              <p className="text-muted-foreground text-xs max-w-xs text-center mt-1">
                Selecione "Otimizar Logística" para agrupar os pacientes por distrito e veículo.
              </p>
            </Card>
          )}

          {optimizing && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-black uppercase tracking-tighter animate-pulse">Calculando Eficiência...</p>
                <p className="text-sm text-muted-foreground">Cruzando dados de geolocalização e urgência clínica.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <Zap className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest opacity-80">Proposta de Escala Logística</p>
                      <p className="text-sm font-medium leading-relaxed">{result.optimizationSummary}</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-white text-primary hover:bg-slate-100 h-12 px-6 gap-2 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg"
                    onClick={handleCommitManifestos}
                    disabled={committing}
                  >
                    {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {committing ? "Gravando..." : "Gerar e Enviar Manifestos"}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {result.assignments.map((assignment, idx) => (
                  <Card key={idx} className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary rounded-2xl bg-card">
                    <CardHeader className="pb-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-black uppercase">ROTA #{idx + 1}</Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                          <Navigation className="h-3 w-3" /> {assignment.estimatedDistanceKm.toFixed(1)} km
                        </div>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2 mt-2">
                        <Ambulance className="h-5 w-5 text-primary" />
                        {vehicles.find(v => v.id === assignment.vehicleId)?.type || "Viatura"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-muted">
                        {assignment.route.map((appId, i) => {
                          const req = requests.find(r => r.id === appId);
                          return (
                            <div key={appId} className="relative">
                              <div className="absolute -left-[20px] top-1 size-3 rounded-full bg-primary ring-4 ring-white" />
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold text-slate-700">{req?.patientName || `Solicitação ${appId}`}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Destino: {req?.destinationLocation || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 py-3 border-t">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Planejamento Técnico Validado
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 rounded-2xl border border-dashed border-amber-200 flex items-center gap-4">
        <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-amber-700">Atenção ao Confirmar</p>
          <p className="text-[11px] text-amber-600 leading-tight">Ao clicar em "Gerar e Enviar", as solicitações serão atualizadas no banco de dados e os motoristas receberão a missão em seus dispositivos.</p>
        </div>
      </div>
    </div>
  );
}
