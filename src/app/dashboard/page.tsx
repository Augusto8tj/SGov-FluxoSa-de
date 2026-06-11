
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
      setError("Não foi possível carregar os dados operacionais.");
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de KPIs
  const kpis = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const critical = requests.filter(r => r.urgencyLevel === 'critical').length;
    const activeVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const totalVehicles = vehicles.length;
    
    // Contagem de UBS únicas baseada nos pedidos
    const ubsSet = new Set(requests.map(r => r.ubsId || 'UBS Central'));
    const ubsCount = ubsSet.size || 1;

    return { pending, critical, activeVehicles, totalVehicles, ubsCount };
  }, [requests, vehicles]);

  // Dados do Gráfico (Agrupado por UBS)
  const chartData = useMemo(() => {
    const groups: Record<string, number> = {};
    requests.forEach(req => {
      const ubsName = req.pickupLocation || 'Outros';
      groups[ubsName] = (groups[ubsName] || 0) + 1;
    });

    const data = Object.entries(groups).map(([name, count]) => ({
      name: name.replace('UBS ', '').split(' ')[0], // Nome curto
      fullName: name,
      count
    }));

    // Fallback se não houver dados
    if (data.length === 0) {
      return [{ name: "Sem Dados", count: 0 }];
    }

    return data.sort((a, b) => b.count - a.count).slice(0, 5);
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
        description: "Insights gerados com sucesso pela assistência de IA.",
      });
    } catch (error) {
      console.error("Erro ao gerar briefing", error);
      toast({
        variant: "destructive",
        title: "IA Temporariamente Indisponível",
        description: "O modelo de IA está com alta demanda.",
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
        <p className="text-sm text-muted-foreground font-medium">Sincronizando central de comando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro Operacional</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Bem-vindo, Secretário</h2>
          <p className="text-sm text-muted-foreground">Visão geral do transporte sanitário hoje em Rio Claro - RJ.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-white shrink-0"
            onClick={handleGenerateBriefing}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            <span className="hidden xs:inline">{loadingAi ? "Analisando..." : "Briefing de IA"}</span>
            <span className="xs:hidden">IA</span>
          </Button>
          <div className="shrink-0">
            {isWithinWindow ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-2 sm:px-3 py-1 text-[10px] sm:text-xs">
                <Clock className="w-3 h-3 mr-1" /> Janela Aberta (08h-13h)
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs">
                <Clock className="w-3 h-3 mr-1" /> Janela Fechada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {aiBriefing && (
        <Card className="border-l-4 border-l-primary bg-primary/5 border-none shadow-sm animate-in fade-in slide-in-from-top-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                <Zap className="h-4 w-4 fill-primary shrink-0" /> INSIGHTS ESTRATÉGICOS
              </CardTitle>
              <Badge className={cn(
                "text-[9px] sm:text-[10px]",
                aiBriefing.alertLevel === 'critical' ? 'bg-rose-100 text-rose-700' : 
                aiBriefing.alertLevel === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              )}>
                {aiBriefing.alertLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">{aiBriefing.briefing}</p>
            <div className="flex items-start sm:items-center gap-2 text-[10px] sm:text-xs font-bold text-primary bg-white w-full sm:w-fit px-3 py-2 rounded-lg sm:rounded-full shadow-sm">
              <ArrowRight className="h-3 w-3 mt-0.5 sm:mt-0 shrink-0" /> 
              <span>Ação Prioritária: {aiBriefing.priorityAction}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Pendentes" 
          value={kpis.pending.toString()} 
          icon={Clock} 
          description="Em análise"
        />
        <StatsCard 
          title="Pacientes" 
          value={patients.length >= 1000 ? `${(patients.length / 1000).toFixed(1)}k` : patients.length.toString()} 
          icon={Users} 
          description="Cadastrados"
        />
        <StatsCard 
          title="Frota Ativa" 
          value={`${kpis.activeVehicles}/${kpis.totalVehicles}`} 
          icon={Ambulance} 
          description="Veículos"
        />
        <StatsCard 
          title="UBS Ativas" 
          value={kpis.ubsCount.toString()} 
          icon={MapPin} 
          description="Unidades"
        />
      </div>

      {!isWithinWindow && requests.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold text-xs sm:text-sm">Janela Encerrada</AlertTitle>
          <AlertDescription className="text-amber-700 text-[10px] sm:text-xs">
            Novos pedidos só entre 08:00 e 13:00. O sistema está processando a demanda atual.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Demanda por UBS</CardTitle>
            <CardDescription className="text-xs">Volume de solicitações por unidade de origem.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Atividades Recentes</CardTitle>
            <CardDescription className="text-xs">Últimos eventos do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {requests.length > 0 ? (
                requests.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1.5 size-1.5 rounded-full shrink-0",
                      item.status === 'APPROVED' ? "bg-emerald-500" : 
                      item.status === 'PENDING' ? "bg-primary" : "bg-muted-foreground"
                    )} />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-semibold leading-tight">
                        {item.status === 'PENDING' ? 'Novo pedido:' : 'Pedido:'} {item.patientName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.pickupLocation} → {item.destinationLocation} • {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR }) : 'agora'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  Nenhuma atividade registrada hoje.
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8" onClick={() => loadDashboardData()}>
              Sincronizar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
