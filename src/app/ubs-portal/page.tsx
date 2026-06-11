"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  BrainCircuit, 
  Zap,
  ArrowRight
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { summarizeUbsDemand, UbsDemandOutput } from "@/ai/flows/summarize-ubs-demand-flow";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function UbsDashboard() {
  const [aiReport, setAiReport] = useState<UbsDemandOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-700">Olá, Gerente Márcia</h2>
          <p className="text-muted-foreground">Monitoramento de transporte para a UBS Central hoje.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            onClick={handleGenerateReport}
            disabled={loadingAi}
          >
            <BrainCircuit className={cn("h-4 w-4", loadingAi && "animate-pulse")} />
            {loadingAi ? "Analisando..." : "Resumo de IA da UBS"}
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/ubs-portal/requests" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {aiReport && (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/30 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <Zap className="h-4 w-4 fill-emerald-500" /> ANÁLISE DE DEMANDA DA UNIDADE
              </CardTitle>
              <Badge className={cn(
                aiReport.priorityLevel === 'high' ? 'bg-rose-100 text-rose-700' : 
                aiReport.priorityLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              )}>
                Atenção: {aiReport.priorityLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/90">{aiReport.summary}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white w-fit px-3 py-1 rounded-full shadow-sm border border-emerald-100">
              <ArrowRight className="h-3 w-3" /> Recomendação: {aiReport.recommendation}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Nossos Pedidos Hoje" 
          value="12" 
          icon={ClipboardList} 
          description="Total solicitado pela UBS"
          className="border-l-4 border-l-emerald-500"
        />
        <StatsCard 
          title="Aguardando Secretaria" 
          value="8" 
          icon={Clock} 
          description="Pedidos em análise"
          className="border-l-4 border-l-amber-500"
        />
        <StatsCard 
          title="Já Autorizados" 
          value="4" 
          icon={CheckCircle2} 
          description="Prontos para transporte"
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard 
          title="Pacientes da UBS" 
          value="342" 
          icon={Users} 
          description="Cadastrados na unidade"
          className="border-l-4 border-l-slate-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            <CardDescription>Ferramentas mais utilizadas pela gerência.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="justify-start gap-4 h-14" asChild>
              <Link href="/ubs-portal/requests">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Solicitar Transporte</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Para amanhã ou urgências</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-4 h-14" asChild>
              <Link href="/ubs-portal/patients">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Gerenciar Pacientes</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Atualização de CNS e comorbidades</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Status dos Próximos Transportes</CardTitle>
            <CardDescription>Pacientes da nossa unidade em rota.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Maria Aparecida Silva", destination: "Hospital Municipal", time: "09:00", status: "Em Rota" },
                { name: "João Pedro Santos", destination: "Hemodiálise", time: "10:30", status: "Confirmado" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.destination} • {item.time}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    item.status === 'Em Rota' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {item.status}
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
