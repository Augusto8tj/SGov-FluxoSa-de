"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  MessageSquare, 
  User, 
  Clock, 
  Ambulance, 
  CheckCircle2, 
  Loader2, 
  Search,
  Filter,
  Eye,
  AlertCircle,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Check,
  History,
  TrendingUp,
  LayoutList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { reportService } from "@/services/report-service";
import { analyzeFieldReports, FieldAnalysisOutput } from "@/ai/flows/analyze-field-reports-flow";
import { DriverReport } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DriverReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<DriverReport | null>(null);
  
  // IA States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<FieldAnalysisOutput | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<FieldAnalysisOutput[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar relatórios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadReports();
  }, [loadReports]);

  const handleMarkAsRead = async (report: DriverReport) => {
    if (report.read) return;
    try {
      await reportService.markAsRead(report.id);
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, read: true } : r));
    } catch {
      // Silencioso
    }
  };

  const handleAiAnalysis = async () => {
    const unreadReports = reports.filter(r => !r.read);
    if (unreadReports.length === 0) {
      toast({ title: "Tudo em ordem", description: "Não há novos relatórios para análise." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFieldReports(unreadReports);
      setLastAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev]);
      
      // Marcar lidos após análise
      const unreadIds = unreadReports.map(r => r.id);
      await reportService.markManyAsRead(unreadIds);
      
      setReports(prev => prev.map(r => unreadIds.includes(r.id) ? { ...r, read: true } : r));
      
      toast({ 
        title: "Triagem Concluída", 
        description: `IA analisou ${unreadReports.length} relatos novos.` 
      });
    } catch {
      toast({ title: "Falha na IA", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTask = (task: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(task)) {
      newSet.delete(task);
    } else {
      newSet.add(task);
    }
    setCompletedTasks(newSet);
  };

  const filteredReports = reports.filter(r => 
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <MessageSquare className="h-8 w-8" /> Relatórios de Campo
          </h2>
          <p className="text-muted-foreground text-sm">Monitoramento e inteligência operacional em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className={cn(
              "gap-2 h-11 px-6 rounded-xl shadow-lg transition-all",
              reports.some(r => !r.read) ? "bg-primary animate-pulse" : "bg-muted-foreground/20 text-muted-foreground"
            )}
            onClick={handleAiAnalysis}
            disabled={isAnalyzing || !reports.some(r => !r.read)}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Triagem IA {reports.filter(r => !r.read).length > 0 && `(${reports.filter(r => !r.read).length})`}
          </Button>
          <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={loadReports}>
            <Clock className="h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      {lastAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="lg:col-span-2 border-none shadow-xl bg-primary text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="h-32 w-32" /></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 fill-white" />
                  <CardTitle className="text-lg font-black uppercase tracking-tighter">Briefing IA de Decisão</CardTitle>
                </div>
                <Badge className={cn(
                  "font-black text-[10px] uppercase border-none px-3",
                  lastAnalysis.priorityLevel === 'critical' ? 'bg-rose-500 text-white' : 'bg-white/20 text-white'
                )}>
                  Prioridade: {lastAnalysis.priorityLevel}
                </Badge>
              </div>
              <CardDescription className="text-white/70 text-xs mt-1">Resumo estratégico para o Gabinete do Secretário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium leading-relaxed bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                &quot;{lastAnalysis.executiveSummary}&quot;
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded">
                <ShieldCheck className="h-3 w-3" /> Protocolo Nvidia Nemotron Nano
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-[2rem] bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xs uppercase text-muted-foreground font-black tracking-widest flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-primary" /> Checklist de Providências
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {lastAnalysis.recommendedActions.map((action, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                      completedTasks.has(action.task) ? "bg-emerald-50 border-emerald-100 opacity-60" : "bg-slate-50 border-slate-100 hover:bg-white"
                    )}
                    onClick={() => toggleTask(action.task)}
                  >
                    <Checkbox checked={completedTasks.has(action.task)} className="mt-1" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{action.task}</p>
                      <p className="text-[9px] font-black text-primary uppercase tracking-tighter">{action.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por condutor ou palavra-chave..." 
                className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Relatórios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Condutor</TableHead>
                      <TableHead className="font-bold">Data/Hora</TableHead>
                      <TableHead className="font-bold">Resumo do Relato</TableHead>
                      <TableHead className="text-right font-bold">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <TableRow 
                          key={report.id} 
                          className={cn(
                            "group transition-colors",
                            !report.read ? "bg-primary/[0.03] font-bold" : "hover:bg-muted/10 opacity-70"
                          )}
                        >
                          <TableCell>
                            {!report.read ? (
                              <Badge className="bg-primary text-white border-none text-[8px] uppercase px-2 h-5 animate-bounce">Novo</Badge>
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-50" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                                {report.driverName[0]}
                              </div>
                              <span className="text-sm">{report.driverName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {format(new Date(report.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <p className="text-xs truncate max-w-[250px] text-muted-foreground italic">
                              &quot;{report.content}&quot;
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-primary font-bold text-[10px] uppercase h-8 rounded-lg"
                              onClick={() => {
                                setSelectedReport(report);
                                handleMarkAsRead(report);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" /> Abrir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                          Nenhum relatório de campo encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-md rounded-2xl bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs uppercase text-muted-foreground font-black tracking-widest flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisHistory.length > 0 ? (
                analysisHistory.map((hist, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-xl space-y-1 group hover:bg-primary/5 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-primary">Análise #{analysisHistory.length - i}</span>
                      <span className="text-[8px] text-muted-foreground font-bold">HOJE</span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-600 line-clamp-2 italic">&quot;{hist.executiveSummary}&quot;</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-20">
                  <BrainCircuit className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem Histórico</p>
                </div>
              )}
              <Button variant="outline" className="w-full h-10 rounded-xl border-dashed border-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Ver Todas Análises
              </Button>
            </CardContent>
          </Card>

          <div className="p-5 bg-blue-50 rounded-3xl border border-dashed border-blue-200">
            <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Suporte à Decisão</h4>
            <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
              A IA agrupa relatos por padrões mecânicos, comportamentais ou logísticos, permitindo que o Secretário visualize gargalos operacionais antes que virem crises.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedReport && (
            <div className="flex flex-col">
              <div className="bg-primary p-6 text-primary-foreground">
                <DialogHeader className="space-y-0 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2.5 rounded-2xl">
                      <MessageSquare className="h-7 w-7" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black tracking-tight leading-none uppercase">
                        Relato de Campo
                      </DialogTitle>
                      <DialogDescription className="text-[10px] uppercase font-bold opacity-80 mt-1 tracking-widest text-primary-foreground">
                        Feedback de Operação &bull; Rio Claro
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-bold">{selectedReport.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-80">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(selectedReport.timestamp), "eeee, HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 bg-white">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <AlertCircle className="h-4 w-4 text-primary" /> Conteúdo do Relatório
                  </h4>
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 italic text-sm text-slate-700 leading-relaxed shadow-inner min-h-[120px]">
                    &quot;{selectedReport.content}&quot;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-col gap-1 border">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Viatura</p>
                    <div className="flex items-center gap-2">
                      <Ambulance className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-slate-700 uppercase">{selectedReport.vehicleId || "Não Informada"}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-col gap-1 border">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Triagem</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 uppercase">Recebido</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t">
                <Button className="w-full rounded-2xl h-12 font-black uppercase text-xs tracking-widest shadow-lg" onClick={() => setSelectedReport(null)}>
                  Ciente e Arquivar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
