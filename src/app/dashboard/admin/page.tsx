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
  AlertTriangle,
  History,
  Loader2 as LoaderIcon
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
import { cn } from "@/lib/utils";

const initialRequests = [
  { id: "REQ-001", patient: "Maria Souza", ubs: "UBS Rio Claro", priority: "high", details: "Diabetes, Hipertensão. Requer maca.", status: "PENDING", time: "14:30" },
  { id: "REQ-002", patient: "José Santos", ubs: "UBS Central", priority: "medium", priorityLabel: "Médio", details: "Acompanhamento renal.", status: "PENDING", time: "15:00" },
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
      const maskedName = req.patient.split(' ')[0];
      const partialId = req.id.split('-').pop() || "000";

      const result = await provideDecisionSupportForApprovals({
        requestId: `#${partialId}`,
        patientMaskedName: maskedName,
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
      toast({ title: "Análise Segura Concluída", description: `Dados de ${maskedName} processados com sigilo.` });
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
          <p className="text-muted-foreground text-sm">Gestão estratégica e aprovações com proteção de dados.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-2">
            <BrainCircuit className={aiEnabled ? "text-primary animate-pulse h-5 w-5" : "text-muted-foreground h-5 w-5"} />
            <div className="grid gap-0.5 text-left">
              <Label htmlFor="ai-toggle" className="text-sm font-semibold">IA com Sigilo</Label>
              <p className="text-[10px] text-muted-foreground uppercase">Dados Pseudonimizados</p>
            </div>
          </div>
          <Switch 
            id="ai-toggle" 
            checked={aiEnabled} 
            onCheckedChange={setAiEnabled}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Pendentes" value={requests.length} icon={Zap} description="Aguardando Análise" />
        <StatsCard title="Processados" value="124" icon={CheckCircle} description="Hoje" />
        <StatsCard title="Em Rota" value="8" icon={Zap} description="Veículos" />
        <StatsCard title="Alertas" value="2" icon={AlertTriangle} description="Prioridade Crítica" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
            <div>
              <CardTitle className="text-lg">Solicitações Aguardando</CardTitle>
              <CardDescription className="text-xs">Triagem técnica para a malha municipal.</CardDescription>
            </div>
            <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground space-y-2">
                <CheckCircle className="h-10 w-10 mx-auto opacity-20" />
                <p>Nenhuma solicitação pendente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>IA</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{req.patient}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{req.id} • {req.ubs}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.priority === 'high' ? 'destructive' : req.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                            {req.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {aiEnabled ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 gap-2 border-primary/20 text-[10px] font-bold"
                              onClick={() => handleAiAnalysis(req)}
                              disabled={loading === req.id}
                            >
                              {loading === req.id ? <LoaderIcon className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />}
                              ANALISAR
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">OFF</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleAction(req.id, 'DENY')}><X className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleAction(req.id, 'APPROVE')}><Check className="h-4 w-4" /></Button>
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
          <Card className="border-none shadow-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="bg-primary text-primary-foreground pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-lg">Decisões Apoiadas</CardTitle>
              </div>
              <CardDescription className="text-primary-foreground/80 text-xs italic">Relatórios gerados com proteção de dados sensíveis.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto">
              {Object.keys(analysis).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <History className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-bold uppercase">Nenhuma análise no cache</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(analysis).map(([id, result]) => (
                    <div key={id} className="border-b pb-6 last:border-0 last:pb-0 animate-in fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded">#{id.split('-').pop()}</span>
                        <Badge className={
                          result.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                          result.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }>
                          {result.suggestedAction.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-relaxed mb-4">{result.recommendation}</p>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fatores Analisados</p>
                        {result.criticalFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                            <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
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
