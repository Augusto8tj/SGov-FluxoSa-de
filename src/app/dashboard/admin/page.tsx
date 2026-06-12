
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle, 
  Zap,
  Filter,
  Check,
  X,
  AlertTriangle,
  History,
  Loader2 as LoaderIcon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { provideDecisionSupportForApprovals, ProvideDecisionSupportOutput } from "@/ai/flows/provide-decision-support-for-approvals";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { requestService } from "@/services/request-service";
import { TransportRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import React from "react";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, ProvideDecisionSupportOutput>>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadPendingRequests = useCallback(async () => {
    setLoadingData(true);
    try {
      const all = await requestService.getRequests();
      // Mostramos apenas o que precisa de decisão (PENDING)
      setRequests(all.filter(r => r.status === 'PENDING'));
    } catch {
      toast({ title: "Erro", description: "Falha ao sincronizar pedidos pendentes.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadPendingRequests();
  }, [loadPendingRequests]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleAiAnalysis = async (req: TransportRequest) => {
    if (!aiEnabled) return;
    
    setLoadingAi(req.id);
    try {
      const maskedName = req.patientName.split(' ')[0];

      const result = await provideDecisionSupportForApprovals({
        requestId: req.id,
        patientMaskedName: maskedName,
        patientDetails: req.aiRecommendation || "Condição padrão de transporte sanitário.",
        pickupLocation: req.pickupLocation,
        destinationLocation: req.destinationLocation,
        urgencyLevel: req.urgencyLevel,
        availableVehiclesSummary: "Frota operacional com 4 viaturas ativas."
      });
      
      setAnalysis(prev => ({ ...prev, [req.id]: result }));
      
      // Expande automaticamente ao concluir a análise
      const newExpanded = new Set(expandedIds);
      newExpanded.add(req.id);
      setExpandedIds(newExpanded);

      toast({ title: "Análise IA Concluída", description: `Parecer gerado para o pedido de ${maskedName}.` });
    } catch {
      toast({ title: "Erro na IA", description: "Não foi possível processar a análise agora.", variant: "destructive" });
    } finally {
      setLoadingAi(null);
    }
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'DENIED') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    try {
      await requestService.updateRequest(id, { 
        status: action,
        updatedAt: new Date().toISOString() 
      });
      
      setRequests(prev => prev.filter(r => r.id !== id));
      
      if (action === 'APPROVED') {
        toast({ title: "Solicitação Aprovada", description: `O pedido de ${req.patientName} foi enviado para a logística.` });
      } else {
        toast({ title: "Solicitação Negada", description: `O pedido de ${req.patientName} foi recusado.`, variant: "destructive" });
      }
      
      if (analysis[id]) {
        const newAnalysis = { ...analysis };
        delete newAnalysis[id];
        setAnalysis(newAnalysis);
      }
      
      const newExpanded = new Set(expandedIds);
      newExpanded.delete(id);
      setExpandedIds(newExpanded);

    } catch {
      toast({ title: "Erro na Ação", description: "Não foi possível atualizar o status no banco de dados.", variant: "destructive" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" /> Painel de Comando
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Central de aprovação estratégica e triagem inteligente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="h-10 sm:h-11 rounded-xl gap-2 flex-1 sm:flex-none" onClick={loadPendingRequests}>
            <RefreshCw className={cn("h-4 w-4", loadingData && "animate-spin")} /> <span className="hidden xs:inline">Atualizar</span>
          </Button>
          <div className="flex items-center space-x-3 sm:space-x-4 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-xl shadow-sm border flex-1 sm:flex-none justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <BrainCircuit className={aiEnabled ? "text-primary animate-pulse h-4 w-4 sm:h-5 sm:w-5" : "text-muted-foreground h-4 w-4 sm:h-5 sm:w-5"} />
              <div className="grid gap-0">
                <Label htmlFor="ai-toggle" className="text-[10px] sm:text-sm font-semibold leading-none">IA com Sigilo</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter hidden xs:block">Protocolo LGPD</p>
              </div>
            </div>
            <Switch 
              id="ai-toggle" 
              checked={aiEnabled} 
              onCheckedChange={setAiEnabled}
              className="scale-90"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Pendentes" value={requests.length} icon={Zap} description="Aguardando Triagem" />
        <StatsCard title="Taxa Aprovação" value="92%" icon={CheckCircle} description="Média Mensal" />
        <StatsCard title="IA Ativa" value="SIM" icon={BrainCircuit} description="Nvidia Nemotron" className="hidden xs:flex" />
        <StatsCard title="Alertas" value={requests.filter(r => r.urgencyLevel === 'critical').length} icon={AlertTriangle} description="Críticos" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl sm:rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 p-4 sm:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg">Solicitações Pendentes</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Triagem técnica para a malha viária municipal.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Filter className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="py-20 text-center space-y-3">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sincronizando com as UBS...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground space-y-2">
              <div className="bg-emerald-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <CheckCircle className="h-8 w-8" />
              </div>
              <p className="font-bold">Tudo em dia!</p>
              <p className="text-xs">Nenhuma solicitação pendente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold h-10 py-0">Paciente / UBS</TableHead>
                    <TableHead className="font-bold h-10 py-0 hidden sm:table-cell">Prioridade</TableHead>
                    <TableHead className="font-bold h-10 py-0 hidden md:table-cell">Suporte IA</TableHead>
                    <TableHead className="text-right font-bold h-10 py-0">Decisão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <React.Fragment key={req.id}>
                      <TableRow 
                        className={cn(
                          "transition-colors group",
                          expandedIds.has(req.id) ? "bg-primary/[0.02] border-b-0" : "hover:bg-muted/5 border-b"
                        )}
                      >
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">{req.patientName}</span>
                              <Badge className="sm:hidden text-[8px] h-4 uppercase font-black px-1.5" variant={req.urgencyLevel === 'critical' ? 'destructive' : 'default'}>
                                {req.urgencyLevel}
                              </Badge>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black mt-0.5">
                              {req.ubsId} &bull; {req.pickupLocation}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="hidden sm:table-cell">
                          <Badge 
                            variant={req.urgencyLevel === 'critical' ? 'destructive' : req.urgencyLevel === 'high' ? 'destructive' : 'default'} 
                            className={cn(
                              "text-[10px] font-black uppercase px-3",
                              req.urgencyLevel === 'critical' && "animate-pulse"
                            )}
                          >
                            {req.urgencyLevel.toUpperCase()}
                          </Badge>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {aiEnabled ? (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant={analysis[req.id] ? "secondary" : "outline"} 
                                size="sm" 
                                className={cn(
                                  "h-8 gap-2 border-primary/20 text-[9px] font-black uppercase rounded-lg shadow-sm transition-all",
                                  analysis[req.id] && "bg-primary/10 text-primary border-primary/30"
                                )}
                                onClick={() => handleAiAnalysis(req)}
                                disabled={loadingAi === req.id}
                              >
                                {loadingAi === req.id ? (
                                  <LoaderIcon className="h-3 w-3 animate-spin" />
                                ) : (
                                  <BrainCircuit className={cn("h-3.5 w-3.5", analysis[req.id] ? "text-primary" : "text-muted-foreground")} />
                                )}
                                {analysis[req.id] ? "RE-ANALISAR" : "ANALISAR"}
                              </Button>
                              {analysis[req.id] && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                  onClick={() => toggleExpand(req.id)}
                                >
                                  {expandedIds.has(req.id) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  {expandedIds.has(req.id) ? "OCULTAR" : "DETALHES"}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground italic font-bold">IA DESATIVADA</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 sm:gap-3">
                            <Button 
                              size="icon" 
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 transition-all active:scale-90" 
                              onClick={() => handleAction(req.id, 'DENIED')}
                              title="Negar Pedido"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                            <Button 
                              size="icon" 
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 transition-all active:scale-90" 
                              onClick={() => handleAction(req.id, 'APPROVED')}
                              title="Aprovar Pedido"
                            >
                              <Check className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Parecer IA em Linha Integrada */}
                      {expandedIds.has(req.id) && analysis[req.id] && (
                        <TableRow className="bg-primary/[0.02] border-b-2 border-primary/10">
                          <TableCell colSpan={4} className="p-0">
                            <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="max-w-5xl mx-auto bg-white rounded-[2rem] border border-primary/10 shadow-xl overflow-hidden">
                                <div className="p-5 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
                                  {/* Coluna de Diagnóstico IA */}
                                  <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <BrainCircuit className="h-6 w-6" />
                                      </div>
                                      <div>
                                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] leading-none">Parecer Técnico</h4>
                                        <Badge className={cn(
                                          "mt-1.5 text-[9px] font-black uppercase h-5 px-3 border-none",
                                          analysis[req.id]?.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                                          analysis[req.id]?.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                        )}>
                                          Ação Sugerida: {analysis[req.id]?.suggestedAction.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="bg-primary/[0.03] p-5 rounded-3xl border border-primary/5 italic relative">
                                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-2 text-[9px] font-bold text-primary uppercase tracking-widest">IA: Recomendação Estratégica</div>
                                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        &quot;{analysis[req.id]?.recommendation}&quot;
                                      </p>
                                    </div>
                                  </div>

                                  {/* Coluna de Variáveis de Escopo */}
                                  <div className="w-full md:w-[320px] space-y-3">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-2 px-1">
                                      <Activity className="h-3.5 w-3.5 text-primary" /> Variáveis de Escopo Analisadas
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {analysis[req.id]?.criticalFactors.map((factor, idx) => (
                                        <div key={idx} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 font-bold hover:bg-white hover:border-primary/20 transition-all group">
                                          <div className="size-2 rounded-full bg-primary/40 group-hover:scale-125 group-hover:bg-primary transition-all shrink-0" />
                                          <span className="truncate">{factor}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-slate-50 px-8 py-3 flex items-center gap-2 border-t">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Sigilo Rio Claro Ativo &bull; Nvidia Nemotron Nano</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 sm:p-6 bg-blue-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-dashed border-blue-200 flex flex-col md:flex-row items-center gap-4 sm:gap-6 mx-1">
        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-[1rem] sm:rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-base sm:text-lg text-blue-800 uppercase tracking-tighter">Fluxo de Triagem Aumentada</h4>
          <p className="text-[11px] sm:text-sm text-blue-600 leading-relaxed max-w-2xl font-medium">
            O Painel de Comando exibe pareceres que cruzam o histórico do paciente e o destino para sugerir a melhor conduta. Os dados são pseudonimizados antes do envio para a nuvem de processamento.
          </p>
        </div>
        <ArrowRight className="h-6 w-6 text-blue-300 hidden md:block" />
      </div>
    </div>
  );
}
