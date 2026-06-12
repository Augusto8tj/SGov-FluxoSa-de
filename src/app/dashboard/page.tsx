
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
import Link from "next/link";

// Dados Mock para Demonstração (Rio Claro - RJ)
const MOCK_REQUESTS = [
  { id: "1", patientName: "Benedito Silva", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Municipal", status: "PENDING", urgencyLevel: "critical", createdAt: new Date().toISOString() },
  { id: "2", patientName: "Maria de Fátima", pickupLocation: "UBS Central", destinationLocation: "Centro de Hemodiálise", status: "APPROVED", urgencyLevel: "high", createdAt: new Date().toISOString() },
  { id: "3", patientName: "José Bonifácio", pickupLocation: "UBS Passa Três", destinationLocation: "UBS Central", status: "PENDING", urgencyLevel: "medium", createdAt: new Date().toISOString() },
  { id: "4", patientName: "Ana Cláudia", pickupLocation: "UBS Lídice", destinationLocation: "Hospital Regional", status: "COMPLETED", urgencyLevel: "low", createdAt: new Date().toISOString() },
  { id: "5", patientName: "Wilson Oliveira", pickupLocation: "UBS Central", destinationLocation: "Clínica Ortopédica", status: "APPROVED", urgencyLevel: "medium", createdAt: new Date().toISOString() },
];

const MOCK_CHART = [
  { name: "Lídice", count: 18 },
  { name: "Central", count: 32 },
  { name: "Passa Três", count: 12 },
  { name: "S. Eliza", count: 8 },
  { name: "Rural", count: 5 },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(false); // Carregamento instantâneo para demonstração
  }, []);

  const handleGenerateBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateSystemInsights({
        pendingRequests: 32,
        activeVehicles: 8,
        totalVehicles: 12,
        criticalPatientsCount: 5,
        currentHour: new Date().getHours()
      });
      setAiBriefing(result);
      toast({ title: "Briefing Atualizado", description: "IA gerou novos insights estratégicos." });
    } catch {
      toast({ variant: "destructive", title: "IA: Falha na Conexão", description: "Verificando chaves de API..." });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Sincronizando painel governamental...</p>
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-card shrink-0 h-9"
            onClick={handleGenerateBriefing}
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
        <StatsCard title="Pendentes" value="32" icon={Clock} description="Aguardando" />
        <StatsCard title="Cidadãos" value="1.240" icon={Users} description="Total Base" />
        <StatsCard title="Frota" value="8/12" icon={Ambulance} description="Veículos Ativos" />
        <StatsCard title="Unidades" value="5" icon={MapPin} description="Pontos de Coleta" />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Fluxo por Distrito</CardTitle>
            <CardDescription className="text-xs">Demandas originadas por localidade.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {MOCK_CHART.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Atividade Recente</CardTitle>
            <CardDescription className="text-xs">Últimos transportes da malha viária.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_REQUESTS.map((item, i) => (
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
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">há {i+2} min</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8 text-primary"
              asChild
            >
              <Link href="/dashboard/requests">
                Ver Histórico Completo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
