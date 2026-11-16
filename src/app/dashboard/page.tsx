
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Users, 
  Ambulance, 
  Clock, 
  MapPin,
  BrainCircuit,
  Loader2,
  Info
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
import { generateSystemInsights } from "@/ai/flows/generate-system-insights-flow";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { vehicleService } from "@/services/vehicle-service";
import { ubsService } from "@/services/ubs-service";
import { TransportRequest } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Real Data States
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [activeVehicleCount, setActiveVehicleCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);

  const { toast } = useToast();

  const loadRealData = useCallback(async () => {
    // Carregamento paralelo agressivo para maior velocidade
    setLoading(true);
    
    // Dispara todas as buscas simultaneamente e atualiza o estado conforme chegam
    Promise.allSettled([
      requestService.getRequests().then(setRequests),
      patientService.getPatients().then(p => setPatientCount(p.length)),
      vehicleService.getVehicles().then(v => {
        setVehicleCount(v.length);
        setActiveVehicleCount(v.filter(x => x.status === 'AVAILABLE' || x.status === 'IN_USE').length);
      }),
      ubsService.getUnits().then(u => setUnitCount(u.length))
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setIsWithinWindow(hour >= 8 && hour < 13);
    loadRealData();
  }, [loadRealData]);

  const chartData = useMemo(() => {
    if (requests.length === 0) return [{ name: "Sem Dados", count: 0 }];
    const groups: Record<string, number> = {};
    requests.forEach(r => {
      const ubs = r.ubsId || "Geral";
      groups[ubs] = (groups[ubs] || 0) + 1;
    });
    return Object.entries(groups).map(([name, count]) => ({ name, count }));
  }, [requests]);

  const pendingRequestsCount = useMemo(() => 
    requests.filter(r => r.status === 'PENDING').length, 
  [requests]);

  const recentActivity = useMemo(() => 
    requests.slice(0, 5),
  [requests]);

  const handleGenerateBriefing = async () => {
    setLoadingAi(true);
    try {
      const criticalCount = requests.filter(r => r.urgencyLevel === 'critical').length;
      await generateSystemInsights({
        pendingRequests: pendingRequestsCount,
        activeVehicles: activeVehicleCount,
        totalVehicles: vehicleCount,
        criticalPatientsCount: criticalCount,
        currentHour: new Date().getHours()
      });
      toast({ title: "Resumo Atualizado" });
    } catch {
      toast({ variant: "destructive", title: "IA: Falha na Conexão" });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Central de Comando</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoramento em tempo real - Rio Claro, RJ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-10 rounded-xl" onClick={handleGenerateBriefing} disabled={loadingAi}>
            <BrainCircuit className={cn("h-4 w-4 text-primary", loadingAi && "animate-pulse")} />
            <span className="text-xs font-semibold">{loadingAi ? "Analisando..." : "Resumo da IA"}</span>
          </Button>
          <div className="shrink-0">
            <Badge variant={isWithinWindow ? "default" : "destructive"} className="px-3 py-1.5 h-10 rounded-xl flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Janela {isWithinWindow ? "Aberta" : "Fechada"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Pendentes" value={loading ? "..." : pendingRequestsCount} icon={Clock} description="Aguardando" />
        <StatsCard title="Cidadãos" value={loading ? "..." : patientCount.toLocaleString('pt-BR')} icon={Users} description="Total Base" />
        <StatsCard title="Frota" value={loading ? "..." : `${activeVehicleCount}/${vehicleCount}`} icon={Ambulance} description="Veículos Ativos" />
        <StatsCard title="Unidades" value={loading ? "..." : unitCount} icon={MapPin} description="Pontos de Coleta" />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Fluxo por Unidade</CardTitle>
            <CardDescription className="text-xs">Demandas originadas por localidade.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px] p-2 sm:p-6">
            {loading && requests.length === 0 ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
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
              {loading && requests.length === 0 ? (
                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : recentActivity.length > 0 ? recentActivity.map((item) => (
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
            <Button variant="ghost" className="w-full mt-6 text-[10px] font-bold uppercase tracking-wider h-8 text-primary" asChild>
              <Link href="/dashboard/requests">Ver Fila Completa</Link>
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
            O sistema utiliza um motor assíncrono para garantir fluidez máxima. Dados em tempo real sincronizados com o Firestore municipal.
          </p>
        </div>
      </div>
    </div>
  );
}
