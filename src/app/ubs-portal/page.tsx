"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  BrainCircuit, 
  Zap,
  ArrowRight,
  AlertTriangle,
  History
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { summarizeUbsDemand, UbsDemandOutput } from "@/ai/flows/summarize-ubs-demand-flow";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function UbsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiReport, setAiReport] = useState<UbsDemandOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      // Janela de operação: 08:00 às 13:00
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    try {
      const result = await summarizeUbsDemand({
        ubsName: "UBS Central",
        pendingRequests: 8,
        urgentCases: 2,
        commonDestinations: ["Hospital Municipal", "Centro de Hemodiálise"]
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Olá, Gerente Márcia</h2>
          <p className="text-muted-foreground">Monitoramento de transporte para a UBS Central hoje.</p>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hidden sm:flex"
            onClick={handleGenerateReport}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4", loadingAi && "animate-pulse")} />
            {loadingAi ? "Analisando..." : "Resumo de IA"}
          </Button>
          <Button asChild disabled={!isWithinWindow} className={cn("bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20", !isWithinWindow && "opacity-50 grayscale")}>
            <Link href={isWithinWindow ? "/ubs-portal/requests" : "#"} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {!isWithinWindow && (
        <Card className="bg-rose-50 border-rose-200 border-2">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-rose-800">Fora do Horário de Operação</p>
              <p className="text-sm text-rose-700">Novos agendamentos são permitidos apenas entre **08:00 e 13:00**. Contate a Secretaria para emergências fora deste horário.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiReport && (
        <Card className="border-l-4 border-l-primary bg-primary/5 border-none shadow-sm animate-in slide-in-from-top-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <Zap className="h-4 w-4 fill-primary" /> INSIGHTS OPERACIONAIS DA UNIDADE
              </CardTitle>
              <Badge className={cn(
                aiReport.priorityLevel === 'high' ? 'bg-rose-100 text-rose-700' : 
                aiReport.priorityLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
              )}>
                Nível de Atenção: {aiReport.priorityLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/90 leading-relaxed">{aiReport.summary}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary bg-white dark:bg-slate-900 w-fit px-4 py-2 rounded-lg shadow-sm border border-primary/10">
              <ArrowRight className="h-4 w-4 shrink-0" /> Recomendação: {aiReport.recommendation}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Nossos Pedidos Hoje" 
          value="12" 
          icon={ClipboardList} 
          description="Enviados para Central"
        />
        <StatsCard 
          title="Aguardando Análise" 
          value="8" 
          icon={Clock} 
          description="Na Secretaria"
          className="border-b-4 border-b-amber-500"
        />
        <StatsCard 
          title="Já Autorizados" 
          value="4" 
          icon={CheckCircle2} 
          description="Aguardando Veículo"
          className="border-b-4 border-b-emerald-500"
        />
        <StatsCard 
          title="Pacientes na Base" 
          value="342" 
          icon={Users} 
          description="Fidelizados na UBS"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Gestão da Unidade</CardTitle>
            <CardDescription>Ferramentas exclusivas para o gerente de UBS.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-4 h-16 rounded-xl border-dashed" asChild disabled={!isWithinWindow}>
              <Link href={isWithinWindow ? "/ubs-portal/requests" : "#"}>
                <div className={cn("p-2 rounded-lg", isWithinWindow ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Solicitar Novo Transporte</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Liberado apenas até as 13h</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-4 h-16 rounded-xl border-dashed" asChild>
              <Link href="/ubs-portal/patients">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Base de Cidadãos</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Gerenciar CNS e Comorbidades</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Próximos em Rota</CardTitle>
              <CardDescription>Pacientes da nossa unidade saindo agora.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            <div className="space-y-4">
              {[
                { name: "Maria Aparecida Silva", destination: "Hospital Municipal", time: "09:00", status: "Confirmado" },
                { name: "João Pedro Santos", destination: "Hemodiálise", time: "10:30", status: "Em Rota" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.destination} &bull; {item.time}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-6",
                    item.status === 'Em Rota' ? "bg-primary/10 text-primary border-primary/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
