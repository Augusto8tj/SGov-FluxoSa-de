"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle, 
  Zap,
  Filter,
  Check,
  X,
  AlertTriangle
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

const initialRequests = [
  { id: "REQ-001", patient: "Maria Souza", ubs: "UBS Rio Claro", priority: "high", details: "Diabetes, Hipertensão. Requer maca.", status: "PENDING", time: "14:30" },
  { id: "REQ-002", patient: "José Santos", ubs: "UBS Central", priority: "medium", details: "Acompanhamento renal.", status: "PENDING", time: "15:00" },
  { id: "REQ-003", patient: "Ana Oliveira", ubs: "UBS Norte", priority: "low", details: "Exames de rotina.", status: "PENDING", time: "16:15" },
];

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [requests, setRequests] = useState(initialRequests);
  const [analysis, setAnalysis] = useState<Record<string, ProvideDecisionSupportOutput>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAiAnalysis = async (req: typeof initialRequests[0]) => {
    if (!aiEnabled) return;
    
    setLoading(req.id);
    try {
      const result = await provideDecisionSupportForApprovals({
        requestId: req.id,
        patientName: req.patient,
        patientDetails: req.details,
        needsCompanion: true,
        pickupLocation: req.ubs,
        destinationLocation: "Hospital Municipal Rio Claro",
        requestedTime: "2024-05-20 " + req.time,
        urgencyLevel: req.priority as any,
        availableVehiclesSummary: "3 ambulâncias, 2 vans",
        availableDriversSummary: "5 motoristas ativos",
        conflictingRequestsSummary: "Nenhum conflito crítico detectado"
      });
      setAnalysis(prev => ({ ...prev, [req.id]: result }));
      toast({ title: "Análise concluída", description: `Recomendação gerada para ${req.patient}.` });
    } catch {
      toast({ title: "Erro na análise", description: "Não foi possível obter suporte da IA agora.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleAction = (id: string, action: 'APPROVE' | 'DENY') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    setRequests(prev => prev.filter(r => r.id !== id));
    if (action === 'APPROVE') {
      toast({ title: "Solicitação Aprovada", description: `O transporte para ${req.patient} foi escalado.` });
    } else {
      toast({ title: "Solicitação Negada", description: `O pedido de ${req.patient} foi recusado.`, variant: "destructive" });
    }
    
    if (analysis[id]) {
      const newAnalysis = { ...analysis };
      delete newAnalysis[id];
      setAnalysis(newAnalysis);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Painel de Comando</h2>
          <p className="text-muted-foreground">Avaliação e aprovação centralizada de transportes.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <BrainCircuit className={aiEnabled ? "text-primary animate-pulse" : "text-muted-foreground"} />
            <div className="grid gap-0.5 text-left">
              <Label htmlFor="ai-toggle" className="text-sm font-semibold">Assistente de IA</Label>
              <p className="text-[10px] text-muted-foreground uppercase">Decisões baseadas em dados</p>
            </div>
          </div>
          <Switch 
            id="ai-toggle" 
            checked={aiEnabled} 
            onCheckedChange={setAiEnabled}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Solicitações Aguardando</CardTitle>
              <CardDescription>Existem {requests.length} pedidos pendentes para hoje.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => toast({ title: "Filtros", description: "Opções de filtragem por UBS e Prioridade ativadas." })}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground space-y-2">
                <CheckCircle className="h-10 w-10 mx-auto opacity-20" />
                <p>Todas as solicitações foram processadas.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>UBS / Origem</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Ações de IA</TableHead>
                    <TableHead className="text-right">Aprovar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <div>
                          {req.patient}
                          <p className="text-[10px] text-muted-foreground">{req.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{req.ubs}</TableCell>
                      <TableCell>
                        <Badge variant={req.priority === 'high' ? 'destructive' : req.priority === 'medium' ? 'default' : 'secondary'}>
                          {req.priority === 'high' ? 'ALTA' : req.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {aiEnabled ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-2 border-primary/20 hover:bg-primary/5"
                            onClick={() => handleAiAnalysis(req)}
                            disabled={loading === req.id}
                          >
                            <Zap className={loading === req.id ? "h-3 w-3 animate-spin" : "h-3 w-3 text-primary"} />
                            Analisar
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">IA desativada</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleAction(req.id, 'DENY')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleAction(req.id, 'APPROVE')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground pb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                <CardTitle className="text-lg">Decisões Apoiadas</CardTitle>
              </div>
              <CardDescription className="text-primary-foreground/80">Insights da IA sobre os pedidos selecionados.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {Object.keys(analysis).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma análise disponível.</p>
                  <p className="text-xs text-muted-foreground mt-1">Execute a IA em uma solicitação ao lado.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(analysis).map(([id, result]) => (
                    <div key={id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{id}</span>
                        <Badge className={
                          result.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                          result.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }>
                          {result.suggestedAction === 'approve' ? 'APROVAR' : result.suggestedAction === 'deny' ? 'RECUSAR' : 'ESCALAR'}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-3 font-medium">{result.recommendation}</p>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Fatores Críticos</p>
                        {result.criticalFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
