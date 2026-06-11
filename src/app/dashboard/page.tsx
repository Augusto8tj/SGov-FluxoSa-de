
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Ambulance, 
  Clock, 
  AlertCircle,
  MapPin,
  BrainCircuit,
  Zap,
  ArrowRight
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

const chartData = [
  { name: "Central", count: 24 },
  { name: "Sul", count: 18 },
  { name: "Lídice", count: 12 },
  { name: "Norte", count: 32 },
  { name: "Oeste", count: 15 },
];

export default function DashboardPage() {
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<SystemInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateSystemInsights({
        pendingRequests: 42,
        activeVehicles: 14,
        totalVehicles: 18,
        criticalPatientsCount: 5,
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
        description: "O modelo de IA está com alta demanda. Por favor, tente novamente em alguns instantes.",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Bem-vindo, Secretário</h2>
          <p className="text-sm text-muted-foreground">Visão geral do transporte sanitário hoje.</p>
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
          value="42" 
          icon={Clock} 
          description="Em análise"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Pacientes" 
          value="1.2k" 
          icon={Users} 
          description="Cadastrados"
        />
        <StatsCard 
          title="Frota Ativa" 
          value="14/18" 
          icon={Ambulance} 
          description="Veículos"
        />
        <StatsCard 
          title="UBS Ativas" 
          value="14" 
          icon={MapPin} 
          description="Unidades"
        />
      </div>

      {!isWithinWindow && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold text-xs sm:text-sm">Janela Encerrada</AlertTitle>
          <AlertDescription className="text-amber-700 text-[10px] sm:text-xs">
            Novos pedidos só entre 08:00 e 13:00. O sistema está em modo de roteirização.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Demanda por UBS</CardTitle>
            <CardDescription className="text-xs">Últimas 24h em Rio Claro.</CardDescription>
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
                    <Cell key={`cell-${index}`} fill={index === 3 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Atividades Recentes</CardTitle>
            <CardDescription className="text-xs">Histórico operacional.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {[
                { type: 'approval', user: 'Ricardo', text: 'Aprovou rota #042', time: '10 min' },
                { type: 'request', user: 'UBS Central', text: 'Novo: Maria Oliveira', time: '25 min' },
                { type: 'system', user: 'IA Engine', text: 'Gerou 5 rotas', time: '1h' },
                { type: 'completion', user: 'João', text: 'Viagem concluída: UBS Sul', time: '2h' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1.5 size-1.5 rounded-full shrink-0",
                    item.type === 'approval' ? "bg-emerald-500" : 
                    item.type === 'request' ? "bg-primary" : 
                    item.type === 'system' ? "bg-accent" : "bg-muted-foreground"
                  )} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-semibold leading-tight">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground">{item.user} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8">
              Ver Auditoria
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
