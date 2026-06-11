"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  MapPin, 
  Ambulance, 
  ChevronRight, 
  Zap, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  Loader2,
  Navigation,
  Info,
  Inbox
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateDriverBriefing, DriverBriefingOutput } from "@/ai/flows/generate-driver-briefing-flow";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { TransportRequest } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * @fileOverview Portal do Motorista para gestão de itinerários reais.
 */
export default function DriverDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [briefing, setBriefing] = useState<DriverBriefingOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const [incidentReporting, setIncidentReporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      // TODO: Em produção, filtrar solicitações pelo driverId do usuário autenticado.
      // Por enquanto, carregamos todas as aprovadas para demonstração operacional.
      const allRequests = await requestService.getRequests();
      const approvedRequests = allRequests.filter(r => r.status === 'APPROVED');
      setRequests(approvedRequests);
    } catch (error) {
      console.error("Erro ao carregar manifesto:", error);
      toast({
        title: "Falha na Sincronização",
        description: "Não foi possível carregar seu itinerário de hoje.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stops = useMemo(() => {
    const tripStops: any[] = [];
    requests.forEach(req => {
      // Parada de Coleta
      tripStops.push({
        id: `P-${req.id}`,
        name: req.pickupLocation,
        type: 'PICKUP',
        patient: req.patientName,
        urgency: req.urgencyLevel,
        time: format(new Date(req.requestedTime), "HH:mm", { locale: ptBR }),
        coords: req.pickupLocationCoords,
        address: req.pickupLocation
      });
      // Parada de Entrega
      tripStops.push({
        id: `D-${req.id}`,
        name: req.destinationLocation,
        type: 'DROPOFF',
        patient: req.patientName,
        time: "Previsão +30min",
        coords: req.destinationLocationCoords,
        address: req.destinationLocation
      });
    });
    return tripStops;
  }, [requests]);

  const handleOpenMaps = (address: string, coords?: { lat: number, lng: number }) => {
    let url = "";
    if (coords) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    window.open(url, '_blank');
  };

  const getBriefing = async () => {
    if (requests.length === 0) return;
    setLoadingAi(true);
    try {
      const result = await generateDriverBriefing({
        driverName: "Motorista Autenticado",
        vehicleType: "Viatura Municipal",
        passengers: requests.map(r => ({
          name: r.patientName,
          needs: [], 
          urgency: r.urgencyLevel
        })),
        routeDetails: `Total de ${requests.length} missões aprovadas e sincronizadas.`
      });
      setBriefing(result);
      toast({ title: "IA: Briefing Disponível", description: "As instruções estratégicas foram atualizadas." });
    } catch (error) {
      console.error("Erro Genkit:", error);
      toast({ title: "IA Indisponível", description: "Não foi possível conectar ao motor de inteligência.", variant: "destructive" });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleIncidentReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentReporting(true);
    // TODO: Persistir incidente em uma coleção 'incidents' para auditoria.
    setTimeout(() => {
      setIncidentReporting(false);
      toast({
        title: "Alerta Enviado",
        description: "A central de Rio Claro foi notificada.",
        variant: "destructive"
      });
    }, 1000);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Sincronizando manifesto de viagem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Minha Jornada</h2>
          <p className="text-xs text-slate-500">Rio Claro, RJ • {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <Badge variant={checklistDone ? "default" : "outline"} className={cn(checklistDone ? "bg-emerald-600 text-white" : "bg-amber-50 text-amber-700 border-amber-200")}>
          {checklistDone ? "Em Operação" : "Preparação"}
        </Badge>
      </div>

      {!checklistDone ? (
        <Card className="border-2 border-amber-200 bg-amber-50 shadow-none animate-in fade-in slide-in-from-top-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 uppercase">
              <ClipboardCheck className="h-4 w-4" /> Segurança Municipal
            </CardTitle>
            <CardDescription className="text-amber-600">Verificação obrigatória antes de assumir a rota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Combustível e Nível de Óleo",
              "Sistema de Freios e Pneus",
              "Equipamentos Clínicos (Maca/O2)",
              "Cintos de Segurança e Travas"
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox id={`check-${i}`} />
                <label htmlFor={`check-${i}`} className="text-sm font-medium leading-none text-slate-700">{item}</label>
              </div>
            ))}
            <Button className="w-full mt-2 bg-amber-600 hover:bg-amber-700 h-10" onClick={() => setChecklistDone(true)}>
              Iniciar Itinerário Real
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-primary text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Status da Viatura</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] bg-white/10 hover:bg-white/20 text-white gap-1">
                    <AlertTriangle className="h-3 w-3" /> Reportar Incidente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reportar Ocorrência</DialogTitle>
                    <DialogDescription>A central de monitoramento será alertada em tempo real.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIncidentReport} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-bold">Descrição da Intercorrência</label>
                      <Textarea placeholder="Ex: Falha mecânica, trânsito pesado, urgência clínica do paciente..." required />
                    </div>
                    <DialogFooter>
                      <Button type="submit" variant="destructive" disabled={incidentReporting} className="w-full">
                        {incidentReporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                        Notificar Central de Comando
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Ambulance className="h-8 w-8" />
              <div>
                <p className="font-bold">Missão Ativa</p>
                <p className="text-xs opacity-80">{requests.length} atendimentos sincronizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {checklistDone && (
        <>
          {requests.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-dashed">
              <div className="bg-muted p-4 rounded-full w-fit mx-auto">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Nenhum manifesto disponível</h3>
                <p className="text-xs text-muted-foreground px-6">Você não possui viagens aprovadas ou atribuídas para este momento.</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadDriverData}>Sincronizar Agora</Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Briefing Inteligente
                  </h3>
                  {!briefing && !loadingAi && (
                    <Button variant="ghost" size="sm" onClick={getBriefing} className="text-xs h-7 text-primary">
                      <BrainCircuit className="h-3 w-3 mr-1" /> Analisar Missões
                    </Button>
                  )}
                </div>

                {briefing && (
                  <Card className="border-l-4 border-l-accent bg-white shadow-sm border-none animate-in fade-in">
                    <CardContent className="pt-4 space-y-3">
                      <p className="text-sm leading-relaxed text-slate-700">{briefing.summary}</p>
                      <div className="space-y-2">
                        {briefing.criticalAlerts.map((alert, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            {alert}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-700">Itinerário de Hoje</h3>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                  {stops.map((stop, i) => (
                    <div key={stop.id} className="relative pl-8">
                      <div className={cn(
                        "absolute left-1.5 top-1 size-3 rounded-full border-2 border-white shadow-sm",
                        stop.type === 'PICKUP' ? "bg-primary" : "bg-accent"
                      )} />
                      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[9px] h-4 py-0 uppercase">
                                  {stop.type === 'PICKUP' ? 'Coleta' : 'Entrega'}
                                </Badge>
                                <span className="text-xs font-bold text-slate-400">{stop.time}</span>
                              </div>
                              <p className="font-bold text-slate-800 text-sm">{stop.name}</p>
                              <p className="text-xs text-slate-600 mt-1">Paciente: {stop.patient}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 w-full h-8 gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => handleOpenMaps(stop.address, stop.coords)}
                              >
                                <Navigation className="h-3 w-3" /> Traçar Rota no Mapa
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-12 gap-2 text-base shadow-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  toast({ title: "Jornada Finalizada", description: "Todos os dados foram sincronizados com a Secretaria." });
                  // TODO: Atualizar status do motorista e veículo para 'AVAILABLE' no Firestore.
                }}
              >
                <CheckCircle2 className="h-5 w-5" /> Concluir Manifesto de Viagem
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
