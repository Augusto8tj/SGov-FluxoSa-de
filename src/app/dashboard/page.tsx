
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
  Loader2
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
import { cn } from "@/lib/utils";
import { generateSystemInsights, SystemInsightsOutput } from "@/ai/flows/generate-system-insights-flow";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { vehicleService } from "@/services/vehicle-service";
import { ubsService } from "@/services/ubs-service";
import { TransportRequest } from "@/lib/types";
import Link from "next/link";

/**
 * @fileOverview Dashboard principal otimizado para carregamento instantâneo.
 * Removido o loader de tela cheia para permitir que a interface renderize enquanto os dados chegam.
 */
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<SystemInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Real Data States iniciados com valores vazios para evitar undefined errors
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
      setAiBriefing(result);
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-card shrink-0 h-9"
            onClick={handleGenerateBriefing}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            <span className="text-xs font-semibold">{loadingAi ? "Analisando..." : "Resumo da IA"}</span>
          </Button>
          <div className="shrink-0">
            {isWithinWindow ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1.5 h-9 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Janela Aberta
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1.5 h-9 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Janela Fechada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {aiBriefing && (
        <Card className="border-l-4 border-l-primary bg-primary/5 border-none shadow-sm animate-in fade-in slide-in-from-top-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-tighter">
                <Zap className="h-4 w-4 fill-primary shrink-0" /> Insights Estratégicos
              </CardTitle>
              <Badge className={cn(
                "text-[9px] sm:text-[10px]",
                aiBriefing.alertLevel === 'critical' ? 'bg-destructive/10 text-destructive' : 
                aiBriefing.alertLevel === 'warning' ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'
              )}>
                {aiBriefing.alertLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">{aiBriefing.briefing}</p>
            <div className="flex items-start sm:items-center gap-2 text-[10px] sm:text-xs font-bold text-primary bg-background w-full sm:w-fit px-3 py-2 rounded-lg border border-primary/10 shadow-sm">
              <ArrowRight className="h-3 w-3 mt-0.5 sm:mt-0 shrink-0" /> 
              <span>Prioridade: {aiBriefing.priorityAction}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
