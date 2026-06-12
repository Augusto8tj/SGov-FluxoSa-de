
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
  RefreshCw
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

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, ProvideDecisionSupportOutput>>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
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

  const handleAiAnalysis = async (req: TransportRequest) => {
    if (!aiEnabled) return;
    
    setLoadingAi(req.id);
    try {
      // Pseudonimização para LGPD: enviamos apenas o primeiro nome
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
      
      // Remove da lista local de pendentes
      setRequests(prev => prev.filter(r => r.id !== id));
      
      if (action === 'APPROVED') {
        toast({ title: "Solicitação Aprovada", description: `O pedido de ${req.patientName} foi enviado para a logística.` });
      } else {
        toast({ title: "Solicitação Negada", description: `O pedido de ${req.patientName} foi recusado.`, variant: "destructive" });
      }
      
      // Limpa análise do cache
      if (analysis[id]) {
        const newAnalysis = { ...analysis };
        delete newAnalysis[id];
        setAnalysis(newAnalysis);
      }
    } catch {
      toast({ title: "Erro na Ação", description: "Não foi possível atualizar o status no banco de dados.", variant: "destructive" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" /> Painel de Comando
          </h2>
          <p className="text-muted-foreground text-sm">Central de aprovação estratégica e triagem inteligente.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-11 rounded-xl gap-2" onClick={loadPendingRequests}>
            <RefreshCw className={cn("h-4 w-4", loadingData && "animate-spin")} /> Atualizar
          </Button>
          <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-2">
              <BrainCircuit className={aiEnabled ? "text-primary animate-pulse h-5 w-5" : "text-muted-foreground h-5 w-5"} />
              <div className="grid gap-0.5 text-left">
                <Label htmlFor="ai-toggle" className="text-sm font-semibold leading-none">IA com Sigilo</Label>
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Protocolo LGPD</p>
              </div>
            </div>
            <Switch 
              id="ai-toggle" 
              checked={aiEnabled} 
              onCheckedChange={setAiEnabled}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Pendentes" value={requests.length} icon={Zap} description="Aguardando Triagem" />
        <StatsCard title="Taxa Aprovação" value="92%" icon={CheckCircle} description="Média Mensal" trend={{ value: 4, isPositive: true }} />
        <StatsCard title="IA Ativa" value="SIM" icon={BrainCircuit} description="Nvidia Nemotron" />
        <StatsCard title="Alertas" value={requests.filter(r => r.urgencyLevel === 'critical').length} icon={AlertTriangle} description="Prioridade Crítica" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-card rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
            <div>
              <CardTitle className="text-lg">Solicitações Aguardando Decisão</CardTitle>
              <CardDescription className="text-xs">Triagem técnica para a malha viária municipal.</CardDescription>
            </div>
            <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingData ? (
              <div className="py-20 text-center space-y-3">
                <LoaderIcon className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Sincronizando com as UBS...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground space-y-2">
                <div className="bg-emerald-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="font-bold">Tudo em dia!</p>
                <p className="text-xs">Nenhuma solicitação pendente de aprovação.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="font-bold">Paciente / UBS</TableHead>
                      <TableHead className="font-bold">Prioridade</TableHead>
                      <TableHead className="font-bold">Suporte IA</TableHead>
                      <TableHead className="text-right font-bold">Decisão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-800">{req.patientName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black">{req.ubsId} &bull; {req.pickupLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          {aiEnabled ? (
                            <Button 
                              variant={analysis[req.id] ? "secondary" : "outline"} 
                              size="sm" 
                              className={cn(
                                "h-8 gap-2 border-primary/20 text-[9px] font-black uppercase rounded-lg",
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
                              {analysis[req.id] ? "REVISAR ANÁLISE" : "ANALISAR"}
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic font-bold">OFF-LINE</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-3">
                            <Button 
                              size="icon" 
                              className="h-10 w-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 transition-all active:scale-90" 
                              onClick={() => handleAction(req.id, 'DENIED')}
                              title="Negar Pedido"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                            <Button 
                              size="icon" 
                              className="h-10 w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 transition-all active:scale-90" 
                              onClick={() => handleAction(req.id, 'APPROVED')}
                              title="Aprovar Pedido"
                            >
                              <Check className="h-5 w-5" />
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

        <div className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden flex flex-col h-full bg-card rounded-2xl">
            <CardHeader className="bg-primary text-primary-foreground pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-lg">Pareceres Gerados</CardTitle>
              </div>
              <CardDescription className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-widest">IA & Apoio à Decisão</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[600px] no-scrollbar">
              {Object.keys(analysis).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="bg-muted p-4 rounded-3xl mb-4">
                    <History className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhuma análise no cache</p>
                  <p className="text-[9px] mt-2 max-w-[180px]">Clique em "Analisar" em um pedido para ver as recomendações da IA.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(analysis).map(([id, result]) => {
                    const req = requests.find(r => r.id === id);
                    return (
                      <div key={id} className="border-b pb-6 last:border-0 last:pb-0 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Pedido #{id.split('-').pop()}</span>
                            <span className="text-xs font-bold text-slate-700">{req?.patientName.split(' ')[0]}</span>
                          </div>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase px-2 h-5 border-none",
                            result.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                            result.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          )}>
                            {result.suggestedAction.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl italic">
                          &quot;{result.recommendation}&quot;
                        </p>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-amber-500" /> Fatores Críticos Analisados
                          </p>
                          {result.criticalFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-500 bg-muted/20 p-2 rounded-lg border border-slate-100">
                              <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="font-medium leading-tight">{factor}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase rounded-lg border-rose-100 text-rose-600 hover:bg-rose-50" onClick={() => handleAction(id, 'DENIED')}>Negar</Button>
                          <Button size="sm" className="h-8 text-[9px] font-black uppercase rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100" onClick={() => handleAction(id, 'APPROVED')}>Aprovar</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-dashed border-blue-200 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-xl flex items-center justify-center shrink-0">
          <BrainCircuit className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-blue-800 uppercase tracking-tighter">Fluxo de Aprovação Responsável</h4>
          <p className="text-sm text-blue-600 leading-relaxed max-w-2xl mt-1 font-medium">
            O Painel de Comando prioriza pedidos críticos. Após sua aprovação aqui, a solicitação entra automaticamente na fila do <b>Otimizador de Rotas</b> para ser agrupada e atribuída a um condutor municipal.
          </p>
        </div>
        <CheckCircle className="h-6 w-6 text-blue-300 hidden md:block" />
      </div>
    </div>
  );
}
