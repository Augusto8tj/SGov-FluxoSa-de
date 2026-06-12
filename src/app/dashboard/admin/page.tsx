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
  AlertCircle
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
                    <TableHead className="text-right font-bold h-10 py-0">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/5 transition-colors border-b last:border-0 group">
                      <TableCell className="align-top py-4 min-w-[200px] sm:min-w-0">
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
                        
                        {/* Accordion de Parecer IA Móvel/Desktop */}
                        <Collapsible open={expandedIds.has(req.id)} onOpenChange={() => toggleExpand(req.id)}>
                          <CollapsibleContent>
                            <div className="mt-4 p-3 sm:p-4 bg-primary/[0.03] rounded-2xl border border-primary/10 shadow-inner animate-in slide-in-from-top-2 duration-300">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                  <BrainCircuit className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mr-auto">Parecer Técnico</span>
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase h-5",
                                  analysis[req.id]?.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                                  analysis[req.id]?.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                )}>
                                  IA: {analysis[req.id]?.suggestedAction.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-xs font-medium text-slate-600 italic leading-relaxed mb-3 border-l-2 border-primary/20 pl-3">
                                "{analysis[req.id]?.recommendation}"
                              </p>
                              <div className="space-y-2">
                                <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-1">
                                  <AlertCircle className="h-2.5 w-2.5" /> Variáveis de Escopo:
                                </p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {analysis[req.id]?.criticalFactors.map((factor, idx) => (
                                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-slate-100 text-[9px] sm:text-[10px] text-slate-500 font-bold shadow-sm whitespace-nowrap">
                                      <div className="size-1 rounded-full bg-primary" /> {factor}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        {/* Botão Analisar para Mobile */}
                        {aiEnabled && !analysis[req.id] && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="md:hidden h-7 mt-2 text-[9px] font-black uppercase text-primary gap-1 px-0 hover:bg-transparent"
                            onClick={() => handleAiAnalysis(req)}
                            disabled={loadingAi === req.id}
                          >
                            {loadingAi === req.id ? <LoaderIcon className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />}
                            Solicitar Parecer IA
                          </Button>
                        )}
                        {analysis[req.id] && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="md:hidden h-6 mt-1 text-[8px] font-bold text-muted-foreground px-0"
                            onClick={() => toggleExpand(req.id)}
                          >
                            {expandedIds.has(req.id) ? "Recolher Detalhes" : "Ver Parecer IA"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-4 hidden sm:table-cell">
                        <Badge 
                          variant={req.urgencyLevel === 'critical' ? 'destructive' : req.urgencyLevel === 'high' ? 'destructive' : 'default'} 
                          className={cn(
                            "text-[10px] font-black uppercase",
                            req.urgencyLevel === 'critical' && "animate-pulse"
                          )}
                        >
                          {req.urgencyLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-4 hidden md:table-cell">
                        {aiEnabled ? (
                          <div className="flex flex-col gap-2">
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
                                className="h-6 text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors justify-start px-1"
                                onClick={() => toggleExpand(req.id)}
                              >
                                {expandedIds.has(req.id) ? (
                                  <><ChevronUp className="h-3 w-3 mr-1" /> OCULTAR</>
                                ) : (
                                  <><ChevronDown className="h-3 w-3 mr-1" /> DETALHES</>
                                )}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-muted-foreground italic font-bold">OFF-LINE</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right align-top py-4">
                        <div className="flex justify-end gap-2 sm:gap-3">
                          <Button 
                            size="icon" 
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 transition-all active:scale-90" 
                            onClick={() => handleAction(req.id, 'DENIED')}
                            title="Negar Pedido"
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 transition-all active:scale-90" 
                            onClick={() => handleAction(req.id, 'APPROVED')}
                            title="Aprovar Pedido"
                          >
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 sm:p-6 bg-blue-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-dashed border-blue-200 flex flex-col md:flex-row items-center gap-4 sm:gap-6 mx-1">
        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-[1rem] sm:rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-base sm:text-lg text-blue-800 uppercase tracking-tighter">Triagem Técnica Aumentada</h4>
          <p className="text-[11px] sm:text-sm text-blue-600 leading-relaxed max-w-2xl font-medium">
            O Painel de Comando exibe pareceres que cruzam o histórico do paciente e o destino para sugerir a melhor conduta. Em dispositivos móveis, os pareceres aparecem sob demanda para otimizar a visualização.
          </p>
        </div>
        <CheckCircle className="h-6 w-6 text-blue-300 hidden md:block" />
      </div>
    </div>
  );
}
