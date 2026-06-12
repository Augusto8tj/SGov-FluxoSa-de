
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
  AlertTriangle,
  History,
  MapPin
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

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard 
          title="Nossos Pedidos" 
          value="12" 
          icon={ClipboardList} 
          description="Total na fila"
        />
        <StatsCard 
          title="Em Análise" 
          value="8" 
          icon={Clock} 
          description="Na Secretaria"
          className="border-b-4 border-b-amber-500"
        />
        <StatsCard 
          title="Confirmados" 
          value="4" 
          icon={CheckCircle2} 
          description="Aguardando Veículo"
          className="border-b-4 border-b-emerald-500"
        />
        <StatsCard 
          title="Nossa Base" 
          value="342" 
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
              {[
                { name: "Maria Aparecida Silva", destination: "Hospital Municipal", time: "09:00", status: "Confirmado" },
                { name: "João Pedro Santos", destination: "Hemodiálise", time: "10:30", status: "A caminho" },
                { name: "Tereza Souza", destination: "UBS Central", time: "11:15", status: "Aguardando" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-medium">
                      <MapPin className="h-3 w-3" /> {item.destination} &bull; {item.time}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[9px] h-5 font-bold",
                    item.status === 'Confirmado' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                    item.status === 'A caminho' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
