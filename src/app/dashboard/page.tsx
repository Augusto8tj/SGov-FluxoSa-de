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

const chartData = [
  { name: "UBS Central", count: 24 },
  { name: "UBS Rio Claro", count: 18 },
  { name: "UBS Sul", count: 12 },
  { name: "UBS Norte", count: 32 },
  { name: "UBS Oeste", count: 15 },
];

export default function DashboardPage() {
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<SystemInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

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
    } catch (error) {
      console.error("Erro ao gerar briefing", error);
    } finally {
      setLoadingAi(null as any);
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Bem-vindo, Secretário</h2>
          <p className="text-muted-foreground">Visão geral do sistema de transporte sanitário hoje.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-white"
            onClick={handleGenerateBriefing}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            {loadingAi ? "Analisando..." : "Briefing de IA"}
          </Button>
          {isWithinWindow ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1">
              <Clock className="w-3 h-3 mr-1" /> Janela Aberta (08h-13h)
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-3 py-1">
              <Clock className="w-3 h-3 mr-1" /> Janela Fechada
            </Badge>
          )}
        </div>
      </div>

      {aiBriefing && (
        <Card className="border-l-4 border-l-primary bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <Zap className="h-4 w-4 fill-primary" /> INSIGHTS ESTRATÉGICOS DA IA
              </CardTitle>
              <Badge className={cn(
                aiBriefing.alertLevel === 'critical' ? 'bg-rose-100 text-rose-700' : 
                aiBriefing.alertLevel === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              )}>
                Alerta: {aiBriefing.alertLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground/90">{aiBriefing.briefing}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary bg-white w-fit px-3 py-1 rounded-full shadow-sm">
              <ArrowRight className="h-3 w-3" /> Ação Prioritária: {aiBriefing.priorityAction}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Pedidos Pendentes" 
          value="42" 
          icon={Clock} 
          description="Aguardando aprovação"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Total de Pacientes" 
          value="1,284" 
          icon={Users} 
          description="Cadastrados no sistema"
        />
        <StatsCard 
          title="Frota Ativa" 
          value="14/18" 
          icon={Ambulance} 
          description="Veículos em operação"
        />
        <StatsCard 
          title="UBS Ativas" 
          value="14" 
          icon={MapPin} 
          description="Pontos de coleta operacionais"
        />
      </div>

      {!isWithinWindow && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold">Janela de Agendamento Encerrada</AlertTitle>
          <AlertDescription className="text-amber-700">
            Novos pedidos só podem ser realizados entre 08:00 e 13:00. O sistema está em modo de análise e roteirização.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Demanda por UBS</CardTitle>
            <CardDescription>Número de pedidos autorizados nas últimas 24h.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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
          <CardHeader>
            <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'approval', user: 'Sec. Ricardo', text: 'Aprovou rota otimizada #042', time: '10 min ago' },
                { type: 'request', user: 'UBS Central', text: 'Novo pedido: Maria Oliveira', time: '25 min ago' },
                { type: 'system', user: 'AI Engine', text: 'Gerou 5 sugestões de rotas', time: '1h ago' },
                { type: 'completion', user: 'Motorista João', text: 'Viagem concluída: UBS Sul', time: '2h ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 size-2 rounded-full",
                    item.type === 'approval' ? "bg-emerald-500" : 
                    item.type === 'request' ? "bg-primary" : 
                    item.type === 'system' ? "bg-accent" : "bg-muted-foreground"
                  )} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.user} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs font-semibold uppercase tracking-wider h-9">
              Ver Auditoria Completa
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
