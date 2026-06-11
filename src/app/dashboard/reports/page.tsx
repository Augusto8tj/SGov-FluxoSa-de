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
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { reportService } from "@/services/report-service";
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

  const filteredReports = reports.filter(r => 
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Relatórios de Campo</h2>
          <p className="text-muted-foreground">Feedbacks e ocorrências enviadas pelos condutores municipais.</p>
        </div>
        <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={loadReports}>
          <Clock className="h-4 w-4" /> Atualizar Lista
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por condutor ou palavra-chave..." 
            className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
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
                        !report.read ? "bg-primary/[0.03] font-bold" : "hover:bg-muted/10"
                      )}
                    >
                      <TableCell>
                        {!report.read ? (
                          <Badge className="bg-primary text-white border-none text-[8px] uppercase px-2 h-5">Novo</Badge>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-50" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {report.driverName[0]}
                          </div>
                          <span className="text-sm">{report.driverName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(report.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs truncate max-w-[300px] text-muted-foreground italic">
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