
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
  ShieldCheck
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
  DialogTrigger 
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
          {/* BOTÃO DO POP-UP DE IMPLANTAÇÃO */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-10 px-4 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest animate-in fade-in slide-in-from-right-4">
                <Rocket className="h-4 w-4" /> Missão: Teste Beta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-emerald-600 p-6 text-white">
                <DialogHeader className="text-left space-y-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2.5 rounded-2xl">
                      <Rocket className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter">Guia de Implantação</DialogTitle>
                      <DialogDescription className="text-emerald-100 text-[10px] uppercase font-bold tracking-widest">
                        Checklist Operacional Real & bull; Rio Claro
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-slate-50 transition-all hover:border-emerald-200">
                    <div className={cn("p-2 rounded-xl shrink-0 mt-1", unitCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-600 text-white")}>
                      {unitCount > 0 ? <Check className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400">Passo 1</p>
                      <p className="text-sm font-bold text-slate-800">Cadastrar Unidades Oficiais</p>
                      <p className="text-xs text-slate-500">Defina os postos de saúde (UBS) no menu de configurações.</p>
                      {unitCount === 0 && (
                        <Button variant="link" className="p-0 h-auto text-[10px] text-emerald-600 font-bold uppercase" asChild>
                          <Link href="/dashboard/ubs">Ir para cadastro <ChevronRight className="h-3 w-3" /></Link>
                        </Button>
                      )}
                    </div>
                    {unitCount > 0 && <Badge className="bg-emerald-500 text-white border-none text-[8px] uppercase">Concluído</Badge>}
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-slate-50 transition-all hover:border-emerald-200">
                    <div className={cn("p-2 rounded-xl shrink-0 mt-1", vehicleCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-600 text-white")}>
                      {vehicleCount > 0 ? <Check className="h-4 w-4" /> : <Ambulance className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400">Passo 2</p>
                      <p className="text-sm font-bold text-slate-800">Carga da Frota Municipal</p>
                      <p className="text-xs text-slate-500">Registre as viaturas com odômetro e placa oficial.</p>
                      {vehicleCount === 0 && (
                        <Button variant="link" className="p-0 h-auto text-[10px] text-emerald-600 font-bold uppercase" asChild>
                          <Link href="/dashboard/fleet">Ir para frota <ChevronRight className="h-3 w-3" /></Link>
                        </Button>
                      )}
                    </div>
                    {vehicleCount > 0 && <Badge className="bg-emerald-500 text-white border-none text-[8px] uppercase">Concluído</Badge>}
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl border bg-slate-50 transition-all hover:border-emerald-200">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0 mt-1">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400">Passo 3</p>
                      <p className="text-sm font-bold text-slate-800">Credenciar Condutores</p>
                      <p className="text-xs text-slate-500">Adicione os motoristas para que apareçam na roteirização.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                    <b>Dica Operacional:</b> Após cadastrar as bases, instrua as UBS a iniciarem os cadastros de cidadãos antes de gerar os primeiros pedidos reais.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-slate-50 flex justify-end">
                <Button className="rounded-xl font-black uppercase text-[10px] tracking-widest" asChild>
                  <Link href="/dashboard/help">Ver Manual Completo</Link>
                </Button>
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
