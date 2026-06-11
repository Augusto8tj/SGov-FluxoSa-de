
"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Ambulance, 
  Clock, 
  AlertCircle,
  MapPin,
  BrainCircuit,
  Zap,
  ArrowRight,
  Loader2,
  Inbox
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { generateSystemInsights, SystemInsightsOutput } from "@/ai/flows/generate-system-insights-flow";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { vehicleService } from "@/services/vehicle-service";
import { TransportRequest, Patient, Vehicle } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<SystemInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    
    checkTime();
    const timer = setInterval(checkTime, 60000);
    loadDashboardData();
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqData, patData, vehData] = await Promise.all([
        requestService.getRequests(),
        patientService.getPatients(),
        vehicleService.getVehicles()
      ]);
      setRequests(reqData);
      setPatients(patData);
      setVehicles(vehData);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Não foi possível sincronizar os dados operacionais.");
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const critical = requests.filter(r => r.urgencyLevel === 'critical').length;
    const activeVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const totalVehicles = vehicles.length;
    const ubsSet = new Set(requests.map(r => r.ubsId || 'UBS Central'));
    const ubsCount = ubsSet.size || 0;

    return { pending, critical, activeVehicles, totalVehicles, ubsCount };
  }, [requests, vehicles]);

  const chartData = useMemo(() => {
    if (requests.length === 0) return [];

    const groups: Record<string, number> = {};
    requests.forEach(req => {
      const ubsName = req.pickupLocation || 'Outros';
      groups[ubsName] = (groups[ubsName] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([name, count]) => ({
        name: name.replace('UBS ', '').split(' ')[0],
        fullName: name,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [requests]);

  const handleGenerateBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateSystemInsights({
        pendingRequests: kpis.pending,
        activeVehicles: kpis.activeVehicles,
        totalVehicles: kpis.totalVehicles,
        criticalPatientsCount: kpis.critical,
        currentHour: new Date().getHours()
      });
      setAiBriefing(result);
      toast({
        title: "Briefing Atualizado",
        description: "Insights gerados com sucesso pela IA.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "IA Indisponível",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Central de Comando</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoramento em tempo real - Rio Claro, RJ.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-card shrink-0 h-9"
            onClick={handleGenerateReport || handleGenerateBriefing}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            <span className="text-xs font-semibold">{loadingAi ? "Analisando..." : "Briefing de IA"}</span>
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
        <StatsCard 
          title="Pendentes" 
          value={kpis.pending} 
          icon={Clock} 
          description="Aguardando"
        />
        <StatsCard 
          title="Cidadãos" 
          value={patients.length} 
          icon={Users} 
          description="Total Base"
        />
        <StatsCard 
          title="Operacionais" 
          value={`${kpis.activeVehicles}/${kpis.totalVehicles}`} 
          icon={Ambulance} 
          description="Frota Pronta"
        />
        <StatsCard 
          title="Unidades" 
          value={kpis.ubsCount} 
          icon={MapPin} 
          description="Atendimento"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Fluxo por UBS</CardTitle>
            <CardDescription className="text-xs">Demandas originadas por unidade de saúde.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] p-2 sm:p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '8px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Inbox className="h-10 w-10 opacity-20" />
                <p className="text-xs font-medium">Sem dados para exibição gráfica.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Histórico Local</CardTitle>
            <CardDescription className="text-xs">Últimas solicitações processadas.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {requests.length > 0 ? (
                requests.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1.5 size-1.5 rounded-full shrink-0",
                      item.status === 'APPROVED' ? "bg-primary" : 
                      item.status === 'PENDING' ? "bg-accent" : "bg-muted-foreground"
                    )} />
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <p className="text-xs font-semibold leading-tight truncate">
                        {item.patientName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.pickupLocation} → {item.destinationLocation}
                      </p>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap mt-0.5">
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: false, locale: ptBR }) : 'agora'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Inbox className="h-8 w-8 mx-auto opacity-20" />
                  <p className="text-xs font-medium">Nenhuma atividade recente.</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8 text-primary" onClick={() => loadDashboardData()}>
              Sincronizar Dados
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
