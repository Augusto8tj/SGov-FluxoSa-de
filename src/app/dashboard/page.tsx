
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Ambulance, 
  Clock, 
  MapPin,
  BrainCircuit,
  Zap,
  ArrowRight,
  Loader2,
  Rocket,
  Building,
  UserCheck,
  Check,
  Info,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Lightbulb
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { generateSystemInsights, SystemInsightsOutput } from "@/ai/flows/generate-system-insights-flow";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { vehicleService } from "@/services/vehicle-service";
import { ubsService } from "@/services/ubs-service";
import { TransportRequest } from "@/lib/types";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiReport, setAiReport] = useState<SystemInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  
  // Real Data States
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [activeVehicleCount, setActiveVehicleCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [chartData, setChartData] = useState<{name: string, count: number}[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    checkTime();
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      const [reqs, pats, vehs, units] = await Promise.all([
        requestService.getRequests(),
        patientService.getPatients(),
        vehicleService.getVehicles(),
        ubsService.getUnits()
      ]);

      setRequests(reqs);
      setPatientCount(pats.length);
      setVehicleCount(vehs.length);
      setActiveVehicleCount(vehs.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_USE').length);
      setUnitCount(units.length);

      const groups: Record<string, number> = {};
      reqs.forEach(r => {
        const ubs = r.ubsId || "Geral";
        groups[ubs] = (groups[ubs] || 0) + 1;
      });
      const formattedChart = Object.entries(groups).map(([name, count]) => ({ name, count }));
      setChartData(formattedChart.length > 0 ? formattedChart : [{ name: "Sem Dados", count: 0 }]);

      // Ajusta o passo inicial do guia com base no progresso
      if (units.length > 0 && vehs.length === 0) setGuideStep(2);
      else if (units.length > 0 && vehs.length > 0) setGuideStep(3);

    } catch (error) {
      console.error("Erro ao carregar dashboard real:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setLoadingAi(true);
    try {
      const pendingCount = requests.filter(r => r.status === 'PENDING').length;
      const criticalCount = requests.filter(r => r.urgencyLevel === 'critical').length;

      const result = await generateSystemInsights({
        pendingRequests: pendingCount,
        activeVehicles: activeVehicleCount,
        totalVehicles: vehicleCount,
        criticalPatientsCount: criticalCount,
        currentHour: new Date().getHours()
      });
      setAiReport(result);
      toast({ title: "Resumo Atualizado", description: "IA gerou novos insights a partir dos dados do Firestore." });
    } catch {
      toast({ variant: "destructive", title: "IA: Falha na Conexão", description: "Verifique os limites da API." });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Central de Comando</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoramento em tempo real - Rio Claro, RJ.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* BOTÃO DE DICA - POP-UP DE IMPLANTAÇÃO */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg h-10 px-4 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest animate-in fade-in slide-in-from-right-4">
                <Lightbulb className="h-4 w-4" /> Dica de Implantação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-amber-500 p-6 text-white">
                <DialogHeader className="text-left space-y-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2.5 rounded-2xl">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter">Guia de Etapas</DialogTitle>
                      <DialogDescription className="text-amber-100 text-[10px] uppercase font-bold tracking-widest">
                        Passo {guideStep} de 3 & bull; Rio Claro
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-8 bg-white min-h-[350px] flex flex-col">
                
                {guideStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 1: AS BASES</Badge>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">Cadastrar Unidades Oficiais</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Para que as solicitações funcionem, você precisa definir os postos de saúde (UBS) e hospitais no sistema.
                      </p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", unitCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                      <div className={cn("p-3 rounded-xl shrink-0", unitCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                        {unitCount > 0 ? <Check className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{unitCount} Unidades registradas</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{unitCount > 0 ? "Passo Concluído" : "Ação Necessária"}</p>
                      </div>
                      {unitCount === 0 && (
                        <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild>
                          <Link href="/dashboard/ubs">Ir agora</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {guideStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 2: A FROTA</Badge>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">Carga da Frota Municipal</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Registre as viaturas, ambulâncias e vans. Informe o <b>odômetro inicial</b> para que a IA monitore a manutenção.
                      </p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", vehicleCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                      <div className={cn("p-3 rounded-xl shrink-0", vehicleCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                        {vehicleCount > 0 ? <Check className="h-5 w-5" /> : <Ambulance className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{vehicleCount} Veículos na base</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{vehicleCount > 0 ? "Passo Concluído" : "Ação Necessária"}</p>
                      </div>
                      {vehicleCount === 0 && (
                        <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild>
                          <Link href="/dashboard/fleet">Configurar</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {guideStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 3: EQUIPE</Badge>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">Credenciar Condutores</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Adicione os motoristas oficiais. Sem eles, o Otimizador de Rotas não terá para quem atribuir as missões.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl border bg-slate-50 flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">Controle de Condutores</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Menu: Motoristas</p>
                      </div>
                      <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild>
                        <Link href="/dashboard/settings?tab=drivers">Acessar</Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-6 border-t">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step} 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          step === guideStep ? "bg-amber-500 w-8" : "bg-slate-200 w-1.5"
                        )} 
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {guideStep > 1 && (
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold text-slate-400" onClick={() => setGuideStep(prev => prev - 1)}>
                        <ChevronLeft className="h-4 w-4" /> Anterior
                      </Button>
                    )}
                    {guideStep < 3 ? (
                      <Button size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold bg-amber-500 hover:bg-amber-600" onClick={() => setGuideStep(prev => prev + 1)}>
                        Próximo <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold bg-emerald-600 hover:bg-emerald-700" asChild>
                        <DialogTrigger asChild>
                          <span className="cursor-pointer">Entendido!</span>
                        </DialogTrigger>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-card shrink-0 h-10 rounded-xl"
            onClick={handleGenerateBriefing}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            <span className="text-xs font-semibold">{loadingAi ? "Analisando..." : "Resumo da IA"}</span>
          </Button>
          <div className="shrink-0">
            {isWithinWindow ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1.5 h-10 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Janela Aberta
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1.5 h-10 rounded-xl flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Janela Fechada
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Pendentes" value={pendingRequestsCount} icon={Clock} description="Aguardando" />
        <StatsCard title="Cidadãos" value={patientCount.toLocaleString('pt-BR')} icon={Users} description="Total Base" />
        <StatsCard title="Frota" value={`${activeVehicleCount}/${vehicleCount}`} icon={Ambulance} description="Veículos Ativos" />
        <StatsCard title="Unidades" value={unitCount} icon={MapPin} description="Pontos de Coleta" />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Fluxo por Unidade</CardTitle>
            <CardDescription className="text-xs">Demandas originadas por localidade.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] p-2 sm:p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Atividade Recente</CardTitle>
            <CardDescription className="text-xs">Últimos transportes gravados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : requests.length > 0 ? requests.slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1.5 size-1.5 rounded-full shrink-0",
                    item.status === 'APPROVED' ? "bg-emerald-500" : 
                    item.status === 'PENDING' ? "bg-amber-500" : "bg-slate-400"
                  )} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-semibold leading-tight">{item.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">{item.pickupLocation} → {item.destinationLocation}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">ID: {item.id.slice(-4)}</span>
                </div>
              )) : (
                <div className="text-center py-10 opacity-40 italic text-sm">Sem solicitações registradas.</div>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8 text-primary"
              asChild
            >
              <Link href="/dashboard/requests">
                Ver Fila Completa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-6 bg-primary/5 rounded-[2rem] border border-dashed border-primary/20 flex flex-col md:flex-row items-center gap-6 mx-1">
        <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center shrink-0">
          <Info className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Status da Operação</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-medium">
            O Teste Beta opera conectado ao Firestore oficial. Para suporte imediato sobre o motor híbrido de rotas ou cadastros de unidades, consulte o menu <b>Ajuda/Manual</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
