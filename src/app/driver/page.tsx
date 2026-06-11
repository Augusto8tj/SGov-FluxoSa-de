"use client";

import { useState, useEffect } from "react";
import { 
  Ambulance, 
  Zap, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Navigation,
  MessageSquare,
  LogOut,
  Heart,
  Star
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

const MOCK_MISSION = [
  { id: "S1", name: "UBS Lídice", type: 'PICKUP', patient: "Benedito Silva", time: "08:00", address: "Distrito de Lídice, Rio Claro - RJ" },
  { id: "S2", name: "Hospital Municipal", type: 'DROPOFF', patient: "Benedito Silva", time: "08:45", address: "Centro, Rio Claro - RJ" },
  { id: "S3", name: "UBS Central", type: 'PICKUP', patient: "Maria de Fátima", time: "09:30", address: "Av. Principal, Centro" },
  { id: "S4", name: "Clínica Hemodiálise", type: 'DROPOFF', patient: "Maria de Fátima", time: "10:00", address: "Bairro do Sul" },
];

export default function DriverDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<DriverBriefingOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [missionComplete, setMissionComplete] = useState(false);
  
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleOpenMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const getBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateDriverBriefing({
        driverName: "Carlos Alberto",
        vehicleType: "Ambulância Municipal",
        passengers: [
          { name: "Benedito Silva", needs: ["Maca", "Oxigênio"], urgency: "crítica" },
          { name: "Maria de Fátima", needs: ["Acompanhante"], urgency: "alta" }
        ],
        routeDetails: "Itinerário entre Lídice e Centro com 4 paradas planejadas."
      });
      setBriefing(result);
      toast({ title: "Briefing Gerado", description: "Instruções da IA atualizadas." });
    } catch {
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFinalizeMission = () => {
    setIsFeedbackOpen(false);
    setMissionComplete(true);
    toast({ 
      title: "Jornada Encerrada", 
      description: "Seu feedback foi enviado para a Central de Logística." 
    });
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Sincronizando jornada do motorista...</p>
      </div>
    );
  }

  if (missionComplete) {
    return (
      <div className="space-y-8 py-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-primary text-white p-6 rounded-full shadow-2xl">
              <CheckCircle2 className="h-16 w-16" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Missão Cumprida!</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Seu trabalho hoje garantiu o acesso à saúde para cidadãos de Rio Claro.
            </p>
          </div>

          <Card className="w-full border-none bg-accent/20 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center gap-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <Star className="h-5 w-5 fill-primary text-primary" />
                <Star className="h-5 w-5 fill-primary text-primary" />
                <Star className="h-5 w-5 fill-primary text-primary" />
                <Star className="h-5 w-5 fill-primary text-primary" />
              </div>
              <p className="text-sm font-semibold text-primary italic">
                &quot;Excelente conduta. Informações sincronizadas com sucesso.&quot;
              </p>
            </CardContent>
          </Card>

          <div className="w-full pt-4 space-y-4">
            <Button 
              className="w-full h-14 text-lg font-bold gap-2 shadow-xl shadow-primary/20"
              onClick={() => window.location.reload()}
            >
              <Ambulance className="h-5 w-5" /> Nova Jornada
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-muted-foreground font-semibold gap-2 border-none"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" /> Sair do Sistema
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-black pt-6">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> PMRC &bull; Saúde & Ordem Pública
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Minha Jornada</h2>
          <p className="text-xs text-slate-500">Rio Claro, RJ &bull; {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <Badge variant={checklistDone ? "default" : "outline"} className={cn(checklistDone ? "bg-emerald-600 text-white" : "bg-accent/20 text-primary border-primary/20")}>
          {checklistDone ? "Em Rota" : "Preparação"}
        </Badge>
      </div>

      {!checklistDone ? (
        <Card className="border-2 border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase">
              <ClipboardCheck className="h-4 w-4" /> Segurança Municipal
            </CardTitle>
            <CardDescription className="text-primary/70">Verificação obrigatória da viatura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Combustível e Nível de Óleo",
              "Sistema de Freios e Pneus",
              "Equipamentos Clínicos (O2/Maca)",
              "Cintos de Segurança"
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox id={`check-${i}`} />
                <label htmlFor={`check-${i}`} className="text-sm font-medium leading-none text-slate-700">{item}</label>
              </div>
            ))}
            <Button className="w-full mt-2 h-10 shadow-lg" onClick={() => setChecklistDone(true)}>
              Iniciar Manifesto de Viagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Ambulance className="h-8 w-8" />
                <div>
                  <p className="font-bold">Viatura Operacional</p>
                  <p className="text-xs opacity-80">4 paradas sincronizadas com a central</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Briefing da IA
              </h3>
              {!briefing && (
                <Button variant="ghost" size="sm" onClick={getBriefing} disabled={loadingAi} className="text-xs h-7 text-primary">
                  {loadingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 mr-1" />} Analisar Itinerário
                </Button>
              )}
            </div>

            {briefing && (
              <Card className="border-l-4 border-l-primary bg-white shadow-sm border-none animate-in fade-in">
                <CardContent className="pt-4 space-y-3">
                  <p className="text-sm leading-relaxed text-slate-700">{briefing.summary}</p>
                  <div className="space-y-2">
                    {briefing.criticalAlerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
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
            <h3 className="font-bold text-slate-700">Manifesto de Paradas</h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {MOCK_MISSION.map((stop) => (
                <div key={stop.id} className="relative pl-8">
                  <div className={cn(
                    "absolute left-1.5 top-1 size-3 rounded-full border-2 border-white shadow-sm",
                    stop.type === 'PICKUP' ? "bg-primary" : "bg-primary/40"
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
                            onClick={() => handleOpenMaps(stop.address)}
                          >
                            <Navigation className="h-3 w-3" /> Abrir no Mapa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-14 gap-2 text-base shadow-xl bg-primary hover:bg-primary/90 mt-4"
              >
                <CheckCircle2 className="h-5 w-5" /> Finalizar Manifesto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Relatório de Viagem
                </DialogTitle>
                <DialogDescription>
                  Alguma observação relevante para a chefia sobre os pacientes ou o trajeto?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea 
                  placeholder="Ex: Paciente Benedito teve leve tontura, trajeto com obras na via principal..."
                  className="min-h-[120px] focus:ring-primary"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button 
                  className="w-full h-12 text-base font-bold shadow-lg" 
                  onClick={handleFinalizeMission}
                >
                  Enviar e Encerrar Turno
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
