
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  BrainCircuit, 
  Zap,
  AlertTriangle,
  History,
  MapPin,
  Loader2,
  Rocket,
  ClipboardPlus,
  Key,
  Check
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { summarizeUbsDemand, UbsDemandOutput } from "@/ai/flows/summarize-ubs-demand-flow";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { useAuth } from "@/hooks/use-auth";
import { TransportRequest } from "@/lib/types";

export default function UbsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiReport, setAiReport] = useState<UbsDemandOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Real Data States
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRealData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, pats] = await Promise.all([
        requestService.getRequests(),
        patientService.getPatients()
      ]);

      const ubsId = user?.unitId || "UBS-01";
      const myRequests = reqs.filter(r => r.ubsId === ubsId || r.operatorId === "UBS_MGR");
      
      setRequests(myRequests);
      setPatientCount(pats.length);
    } catch (error) {
      console.error("Erro ao carregar dados da UBS:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    
    checkTime();
    loadRealData();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [loadRealData]);

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    try {
      const pendingCount = requests.filter(r => r.status === 'PENDING').length;
      const urgentCount = requests.filter(r => r.urgencyLevel === 'critical' || r.urgencyLevel === 'high').length;

      const result = await summarizeUbsDemand({
        ubsName: "UBS Central",
        pendingRequests: pendingCount,
        urgentCases: urgentCount,
        commonDestinations: Array.from(new Set(requests.map(r => r.destinationLocation))).slice(0, 3)
      });
      setAiReport(result);
      toast({ title: "Análise Concluída", description: "Resumo estratégico gerado para sua unidade." });
    } catch {
      toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível gerar o resumo agora." });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedRequestsCount = requests.filter(r => r.status === 'APPROVED').length;
  const upcomingTrips = requests.filter(r => r.status === 'APPROVED' || r.status === 'PENDING').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Portal da Unidade</h2>
          <p className="text-muted-foreground">Gestão de transporte para a UBS Central - Rio Claro, RJ.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Janela de Agendamento</span>
            <div className="flex items-center gap-1.5">
              <div className={cn("size-2 rounded-full", isWithinWindow ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              <span className={cn("text-xs font-bold", isWithinWindow ? "text-emerald-600" : "text-rose-600")}>
                {isWithinWindow ? "SISTEMA ABERTO" : "SISTEMA FECHADO (08H-13H)"}
              </span>
            </div>
          </div>
          <Button asChild disabled={!isWithinWindow} className={cn("bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11", !isWithinWindow && "opacity-50 grayscale")}>
            <Link href={isWithinWindow ? "/ubs-portal/requests" : "#"} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {/* GUIA DE IMPLANTAÇÃO BETA (UBS) */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/50 shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-black uppercase text-indigo-700 tracking-tighter">Guia da Unidade: Início Real</CardTitle>
          </div>
          <CardDescription className="text-indigo-600/70 text-xs font-medium">Siga estes passos para os primeiros agendamentos reais da UBS.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/ubs-portal/patients" className="group">
              <div className={cn(
                "p-4 rounded-2xl border transition-all flex items-start gap-3",
                patientCount > 0 ? "bg-white border-indigo-100 opacity-60" : "bg-white border-indigo-200 shadow-md group-hover:border-indigo-400"
              )}>
                <div className={cn("p-2 rounded-xl shrink-0", patientCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-600 text-white")}>
                  {patientCount > 0 ? <Check className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest leading-none mb-1">Passo 1</p>
                  <p className="text-xs font-bold text-slate-800">Base de Cidadãos</p>
                  <p className="text-[10px] text-slate-500 mt-1">Cadastre os moradores da sua área (CNS).</p>
                </div>
              </div>
            </Link>

            <Link href={isWithinWindow ? "/ubs-portal/requests" : "#"} className={cn("group", !isWithinWindow && "pointer-events-none")}>
              <div className={cn(
                "p-4 rounded-2xl border transition-all flex items-start gap-3",
                requests.length > 0 ? "bg-white border-indigo-100 opacity-60" : "bg-white border-indigo-200 shadow-md group-hover:border-indigo-400",
                !isWithinWindow && "opacity-50 grayscale"
              )}>
                <div className={cn("p-2 rounded-xl shrink-0", requests.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-indigo-600 text-white")}>
                  {requests.length > 0 ? <Check className="h-4 w-4" /> : <ClipboardPlus className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest leading-none mb-1">Passo 2</p>
                  <p className="text-xs font-bold text-slate-800">Primeiros Pedidos</p>
                  <p className="text-[10px] text-slate-500 mt-1">Faça os agendamentos das 08h às 13h.</p>
                </div>
              </div>
            </Link>

            <Link href="/ubs-portal/manifests" className="group">
              <div className={cn(
                "p-4 rounded-2xl border transition-all flex items-start gap-3",
                requests.filter(r => r.status === 'APPROVED').length === 0 ? "opacity-50 grayscale pointer-events-none" : "bg-white border-indigo-200 shadow-md group-hover:border-indigo-400"
              )}>
                <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-widest leading-none mb-1">Passo 3</p>
                  <p className="text-xs font-bold text-slate-800">Entregar Códigos</p>
                  <p className="text-[10px] text-slate-500 mt-1">Forneça o código aos pacientes aprovados.</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {!isWithinWindow && (
        <Card className="bg-rose-50 border-rose-200 border-2 shadow-none">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-rose-800">Fora do Horário de Operação</p>
              <p className="text-sm text-rose-700">Novos agendamentos são permitidos apenas até as &quot;13:00&quot;. Contate a Secretaria para emergências críticas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Dados Reais...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard 
              title="Nossos Pedidos" 
              value={requests.length} 
              icon={ClipboardList} 
              description="Total na fila"
            />
            <StatsCard 
              title="Em Análise" 
              value={pendingRequestsCount} 
              icon={Clock} 
              description="Na Secretaria"
              className="border-b-4 border-b-amber-500"
            />
            <StatsCard 
              title="Confirmados" 
              value={approvedRequestsCount} 
              icon={CheckCircle2} 
              description="Aguardando Veículo"
              className="border-b-4 border-b-emerald-500"
            />
            <StatsCard 
              title="Nossa Base" 
              value={patientCount} 
              icon={Users} 
              description="Cidadãos Cadastrados"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <div className="md:col-span-4 space-y-6">
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Resumo Inteligente da Demanda</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-bold text-primary"
                    onClick={handleGenerateReport}
                    disabled={loadingAi}
                  >
                    {loadingAi ? "Analisando..." : "Gerar Análise"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {aiReport ? (
                    <div className="space-y-4 animate-in fade-in">
                      <p className="text-sm leading-relaxed text-slate-700">{aiReport.summary}</p>
                      <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-primary/10">
                        <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-primary">Dica: {aiReport.recommendation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground italic">Clique em &quot;Gerar Análise&quot; para entender a situação do transporte da unidade hoje.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Pacientes da Unidade</CardTitle>
                  <CardDescription>Gerencie o cadastro de cidadãos para agilizar pedidos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-4 h-16 rounded-xl border-dashed" asChild>
                    <Link href="/ubs-portal/patients">
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Base de Cidadãos</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Sincronizar CNS e Prontuário</p>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <Card className="border-none shadow-sm h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Próximos Embarques</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Pacientes da unidade com transporte agendado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {upcomingTrips.length > 0 ? (
                    upcomingTrips.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border">
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{item.patientName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-medium">
                            <MapPin className="h-3 w-3" /> {item.destinationLocation} &bull; {new Date(item.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-5 font-bold",
                          item.status === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                          item.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200"
                        )}>
                          {item.status === 'APPROVED' ? 'CONFIRMADO' : item.status === 'PENDING' ? 'EM ANÁLISE' : item.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-30 italic text-sm">
                      Sem embarques previstos.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
