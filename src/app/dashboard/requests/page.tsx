
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BrainCircuit, 
  Loader2, 
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  FileText,
  User,
  Ambulance,
  Navigation,
  Activity,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TransportRequest, Patient, TransportStatus } from "@/lib/types";
import { classifyUrgency } from "@/ai/flows/classify-urgency-flow";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form State
  const [patientId, setPatientId] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [destination, setDestination] = useState("");
  const [urgency, setUrgency] = useState<string>("low");
  const [scheduledTime, setScheduledTime] = useState("");
  
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedRequests, fetchedPatients] = await Promise.all([
        requestService.getRequests(),
        patientService.getPatients()
      ]);
      setRequests(fetchedRequests);
      setPatients(fetchedPatients);
    } catch (error: any) {
      toast({ title: "Aviso", description: "Falha na sincronização. Verifique a conexão.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Recupera o pedido atual para visualização do painel técnico
  const viewingRequest = requests.find(r => r.id === viewingRequestId);

  const handleAiUrgency = async () => {
    if (!patientNotes || !destination) {
      toast({ title: "Incompleto", description: "Preencha destino e notas para a IA analisar.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyUrgency({ patientNotes, destination });
      setUrgency(result.suggestedUrgency);
      toast({ 
        title: "IA: Análise Concluída", 
        description: `Urgência sugerida: ${result.suggestedUrgency.toUpperCase()}.` 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "IA Indisponível", description: "Não foi possível conectar ao motor Genkit." });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: TransportStatus) => {
    try {
      const updateData: Partial<TransportRequest> = { status };
      if (status === 'APPROVED') {
        updateData.driverId = "Carlos Silva (D1)";
        updateData.vehicleId = "Ambulância (V1)";
        updateData.assignedAt = new Date().toISOString();
        updateData.manifestId = `MAN-${id.split('-').pop()}`;
      }

      await requestService.updateRequest(id, updateData);
      toast({ title: "Status Atualizado", description: `Pedido definido como ${status}.` });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao mudar status.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!patientId || !destination) {
      toast({ title: "Erro", description: "Paciente e Destino são obrigatórios.", variant: "destructive" });
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    const requestData = {
      patientId,
      patientName: patient?.name || "Paciente",
      ubsId: editingRequest?.ubsId || "UBS-01",
      pickupLocation: editingRequest?.pickupLocation || "UBS Central",
      destinationLocation: destination,
      requestedTime: scheduledTime || new Date().toISOString(),
      urgencyLevel: urgency as any,
      status: editingRequest?.status || "PENDING",
      operatorId: "ADMIN",
    };

    try {
      if (editingRequest) {
        await requestService.updateRequest(editingRequest.id, requestData);
      } else {
        await requestService.addRequest(requestData as any);
      }
      setIsDialogOpen(false);
      loadData();
      toast({ title: "Sucesso", description: "Solicitação processada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao gravar solicitação.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      loadData();
      toast({ title: "Removido", description: "Solicitação cancelada." });
    } catch (error: any) {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  };

  const openTechnicalPanel = (req: TransportRequest) => {
    setViewingRequestId(req.id);
    setIsViewDialogOpen(true);
  };

  const filteredRequests = requests.filter(req => 
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-destructive text-destructive-foreground animate-pulse">Crítico</Badge>;
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge className="bg-primary text-primary-foreground">Média</Badge>;
      default: return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1"><CheckCircle2 className="h-3 w-3" /> Aprovado</Badge>;
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 gap-1">Concluído</Badge>;
      case 'DENIED': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 gap-1"><XCircle className="h-3 w-3" /> Negado</Badge>;
      case 'CANCELLED': return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/10 gap-1">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-sm text-muted-foreground">Logística e autorização de transporte municipal.</p>
        </div>
        
        <Button onClick={() => { 
          setEditingRequest(null); 
          setPatientId("");
          setDestination("");
          setPatientNotes("");
          setScheduledTime(new Date().toISOString().slice(0, 16));
          setIsDialogOpen(true); 
        }} className="gap-2 shadow-md w-full sm:w-auto h-11">
          <Plus className="h-4 w-4" /> Novo Pedido
        </Button>

        {/* Dialog Novo/Edição */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {editingRequest ? "Editar Pedido" : "Solicitar Transporte Sanitário"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do paciente e o destino para análise da secretaria.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Cidadão / Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient" className="h-11">
                    <SelectValue placeholder="Selecione o paciente cadastrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dest">Destino do Transporte</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dest"
                    placeholder="Ex: Hospital Municipal..." 
                    className="pl-10 h-11" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">Notas Clínicas</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-primary font-bold gap-1" 
                    onClick={handleAiUrgency} 
                    disabled={isClassifying}
                  >
                    {isClassifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />} 
                    CLASSIFICAR IA
                  </Button>
                </div>
                <Textarea 
                  id="notes"
                  placeholder="Condição do paciente..." 
                  className="min-h-[100px] text-sm" 
                  value={patientNotes} 
                  onChange={(e) => setPatientNotes(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgência</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger id="urgency" className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Data e Hora</Label>
                  <Input id="time" type="datetime-local" className="h-11" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary shadow-lg shadow-primary/20">
                {editingRequest ? "Salvar" : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Painel Técnico: Dialog Visualização de Detalhes */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-slate-50">
            {viewingRequest ? (
              <div className="flex flex-col h-full">
                <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-10">
                    <Activity className="h-32 w-32" />
                  </div>
                  <DialogHeader className="space-y-0 text-left relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-2.5 rounded-2xl">
                        <ClipboardList className="h-7 w-7" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Painel Técnico</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase font-bold text-primary-foreground/80 tracking-widest">Protocolo: {viewingRequest.id}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="mt-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                        {viewingRequest.patientName[0]}
                      </div>
                      <span className="text-2xl font-black">{viewingRequest.patientName}</span>
                    </div>
                    {getStatusBadge(viewingRequest.status)}
                  </div>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh] no-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-none shadow-sm bg-white flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Horário Agendado</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Clock className="h-4 w-4 text-primary" />
                        {new Date(viewingRequest.requestedTime).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </Card>
                    <Card className="p-4 border-none shadow-sm bg-white flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Prioridade Clínica</p>
                      <div className="flex items-center gap-2">
                        {getUrgencyBadge(viewingRequest.urgencyLevel)}
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" /> Roteirização do Trajeto
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                      <div className="flex items-start gap-4 relative">
                        <div className="mt-1 size-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10 shrink-0">
                          <div className="size-2 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-primary uppercase tracking-tighter leading-none">Origem (Coleta)</p>
                          <p className="text-sm font-bold text-slate-700">{viewingRequest.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative">
                        <div className="mt-1 size-6 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center z-10 shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter leading-none">Destino (Desembarque)</p>
                          <p className="text-sm font-bold text-slate-700">{viewingRequest.destinationLocation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Manifesto / Logística */}
                  <div className="space-y-3 animate-in slide-in-from-bottom-2">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 px-1">
                      <ShieldCheck className="h-4 w-4" /> Logística do Manifesto
                    </h4>
                    
                    {viewingRequest.status === 'APPROVED' || viewingRequest.status === 'COMPLETED' ? (
                      <div className="bg-emerald-600 rounded-3xl p-5 space-y-5 shadow-xl shadow-emerald-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-2xl text-white">
                              <Ambulance className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-emerald-100 uppercase tracking-tighter leading-none">Viatura Atribuída</p>
                              <p className="text-base font-black text-white">{viewingRequest.vehicleId || "Viatura Local"}</p>
                            </div>
                          </div>
                          <Badge className="bg-white text-emerald-600 border-none font-black text-[10px] h-6 px-3">{viewingRequest.manifestId}</Badge>
                        </div>
                        <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                          <div className="bg-white/20 p-2.5 rounded-2xl text-white">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-emerald-100 uppercase tracking-tighter leading-none">Condutor Responsável</p>
                            <p className="text-base font-black text-white">{viewingRequest.driverId || "Plantão Logística"}</p>
                          </div>
                        </div>
                      </div>
                    ) : viewingRequest.status === 'PENDING' ? (
                      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-2">
                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Activity className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Aguardando Atribuição<br/>de Manifesto</p>
                        <p className="text-[10px] text-slate-400">O painel de logística será preenchido<br/>após a aprovação da secretaria.</p>
                      </div>
                    ) : (
                      <div className="bg-slate-200/50 rounded-3xl p-6 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Solicitação {viewingRequest.status === 'DENIED' ? 'Negada' : 'Cancelada'}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Unidade Solicitante</p>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-primary" /> {viewingRequest.ubsId} - Sistema Municipal de Rio Claro
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white border-t flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-500" onClick={() => setIsViewDialogOpen(false)}>Fechar Painel</Button>
                  {viewingRequest.status === 'PENDING' && (
                    <Button className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100" onClick={() => {
                      handleStatusUpdate(viewingRequest.id, 'APPROVED');
                      setIsViewDialogOpen(false);
                    }}>Aprovar e Atribuir</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Carregando Ficha Técnica...</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por paciente ou destino..." 
          className="pl-10 h-12 bg-card border-none shadow-sm" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Sincronizando agendamentos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-none">
                  <TableHead className="min-w-[180px] font-bold">Paciente</TableHead>
                  <TableHead className="min-w-[150px] font-bold">Destino / Horário</TableHead>
                  <TableHead className="font-bold">Prioridade</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Painel / Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{req.patientName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{req.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                          <MapPin className="h-3 w-3 text-primary/60 shrink-0" />
                          <span className="truncate max-w-[140px]">{req.destinationLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(req.requestedTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                          onClick={() => openTechnicalPanel(req)}
                          title="Ver Painel Técnico"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                            <DropdownMenuItem onClick={() => openTechnicalPanel(req)} className="gap-2 cursor-pointer">
                              <Activity className="h-4 w-4" /> Abrir Ficha Técnica
                            </DropdownMenuItem>
                            
                            {req.status === 'PENDING' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600">
                                  <Check className="h-4 w-4" /> Aprovar Pedido
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'DENIED')} className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600">
                                  <X className="h-4 w-4" /> Negar Pedido
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { 
                              setEditingRequest(req); 
                              setPatientId(req.patientId); 
                              setDestination(req.destinationLocation); 
                              setUrgency(req.urgencyLevel); 
                              setScheduledTime(req.requestedTime.slice(0, 16));
                              setIsDialogOpen(true); 
                            }} className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4" /> Editar Dados
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem className="text-destructive focus:text-destructive gap-2 cursor-pointer" onClick={() => handleDelete(req.id)}>
                              <Trash2 className="h-4 w-4" /> Excluir Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-none bg-primary/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">Aguardando Triagem</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'PENDING').length}</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-emerald-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-emerald-600">Em Rota / Aprovados</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'APPROVED').length}</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-rose-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Cancelados</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'DENIED' || r.status === 'CANCELLED').length}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
