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
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
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
import { TransportRequest, Patient } from "@/lib/types";
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

// Dados Mock para Simulação de Dia Normal
const MOCK_REQUESTS: TransportRequest[] = [
  { 
    id: "REQ-2024-001", 
    patientId: "P1", 
    patientName: "Benedito Silva", 
    ubsId: "UBS-03", 
    pickupLocation: "UBS Lídice", 
    destinationLocation: "Hospital Municipal Rio Claro", 
    urgencyLevel: "critical", 
    status: "APPROVED", 
    requestedTime: "2024-05-20T08:00:00Z", 
    operatorId: "ADMIN",
    createdAt: "2024-05-19T14:30:00Z"
  },
  { 
    id: "REQ-2024-002", 
    patientId: "P2", 
    patientName: "Maria de Fátima", 
    ubsId: "UBS-01", 
    pickupLocation: "UBS Central", 
    destinationLocation: "Centro de Hemodiálise", 
    urgencyLevel: "high", 
    status: "APPROVED", 
    requestedTime: "2024-05-20T09:30:00Z", 
    operatorId: "UBS_MGR",
    createdAt: "2024-05-19T16:00:00Z"
  },
  { 
    id: "REQ-2024-003", 
    patientId: "P3", 
    patientName: "José Bonifácio", 
    ubsId: "UBS-02", 
    pickupLocation: "UBS Passa Três", 
    destinationLocation: "Hospital Regional", 
    urgencyLevel: "medium", 
    status: "PENDING", 
    requestedTime: "2024-05-20T11:00:00Z", 
    operatorId: "UBS_MGR",
    createdAt: "2024-05-20T07:15:00Z"
  },
  { 
    id: "REQ-2024-004", 
    patientId: "P4", 
    patientName: "Ana Cláudia", 
    ubsId: "UBS-03", 
    pickupLocation: "UBS Lídice", 
    destinationLocation: "UBS Central - Exames", 
    urgencyLevel: "low", 
    status: "COMPLETED", 
    requestedTime: "2024-05-20T07:00:00Z", 
    operatorId: "UBS_MGR",
    createdAt: "2024-05-19T10:00:00Z"
  },
  { 
    id: "REQ-2024-005", 
    patientId: "P5", 
    patientName: "Wilson Oliveira", 
    ubsId: "UBS-01", 
    pickupLocation: "UBS Central", 
    destinationLocation: "Clínica Ortopédica", 
    urgencyLevel: "medium", 
    status: "PENDING", 
    requestedTime: "2024-05-20T14:00:00Z", 
    operatorId: "ADMIN",
    createdAt: "2024-05-20T08:45:00Z"
  },
  { 
    id: "REQ-2024-006", 
    patientId: "P6", 
    patientName: "Tereza Cristina", 
    ubsId: "UBS-03", 
    pickupLocation: "UBS Lídice", 
    destinationLocation: "Santa Casa de Rio Claro", 
    urgencyLevel: "high", 
    status: "DENIED", 
    requestedTime: "2024-05-20T10:00:00Z", 
    operatorId: "ADMIN",
    createdAt: "2024-05-20T09:00:00Z"
  }
];

export default function RequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [patientId, setPatientId] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [destination, setDestination] = useState("");
  const [urgency, setUrgency] = useState<string>("low");
  const [scheduledTime, setScheduledTime] = useState("");
  
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Tenta buscar do Firebase, mas usa MOCK para demonstração se estiver vazio ou falhar
      let fetchedRequests: TransportRequest[] = [];
      try {
        fetchedRequests = await requestService.getRequests();
      } catch {
        console.warn("Firebase offline ou erro, usando MOCKS");
      }

      const fetchedPatients = await patientService.getPatients();
      
      // Se não houver requests no Firebase, usa os Mocks para a apresentação
      setRequests(fetchedRequests.length > 0 ? fetchedRequests : MOCK_REQUESTS);
      setPatients(fetchedPatients);
    } catch {
      toast({ title: "Aviso", description: "Carregando dados de demonstração local.", variant: "default" });
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

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
        description: `Urgência sugerida: ${result.suggestedUrgency.toUpperCase()}. Justificativa: ${result.reasoning.substring(0, 50)}...` 
      });
    } catch {
      toast({ variant: "destructive", title: "IA Indisponível", description: "Verifique sua conexão com o Genkit." });
    } finally {
      setIsClassifying(false);
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
      patientName: patient?.name || "Paciente Demo",
      ubsId: "UBS-01",
      pickupLocation: "UBS Central",
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
      toast({ title: "Sucesso", description: "Solicitação sincronizada com o banco de dados." });
    } catch {
      // Fallback local se o Firebase falhar na gravação
      const newReq = { ...requestData, id: `REQ-NEW-${Math.random()}`, createdAt: new Date().toISOString() } as TransportRequest;
      setRequests(prev => [newReq, ...prev]);
      setIsDialogOpen(false);
      toast({ title: "Modo Demo", description: "Registro adicionado localmente." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      loadData();
      toast({ title: "Removido", description: "Solicitação cancelada." });
    } catch {
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: "Removido (Demo)", description: "Solicitação removida localmente." });
    }
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
                    {patients.length > 0 ? (
                      patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                    ) : (
                      <SelectItem value="demo" disabled>Carregando pacientes...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dest">Destino do Transporte</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dest"
                    placeholder="Ex: Hospital Municipal, Clínica de Hemodiálise..." 
                    className="pl-10 h-11" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">Notas Clínicas / Motivo</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-primary font-bold gap-1 hover:bg-primary/10" 
                    onClick={handleAiUrgency} 
                    disabled={isClassifying}
                  >
                    {isClassifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />} 
                    CLASSIFICAR COM IA
                  </Button>
                </div>
                <Textarea 
                  id="notes"
                  placeholder="Descreva a condição do paciente e necessidades especiais (maca, oxigênio, etc)..." 
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
                      <SelectItem value="low">Baixa (Rotina)</SelectItem>
                      <SelectItem value="medium">Média (Acompanhamento)</SelectItem>
                      <SelectItem value="high">Alta (Urgente)</SelectItem>
                      <SelectItem value="critical">Crítica (Emergência)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Data e Hora Prevista</Label>
                  <Input 
                    id="time"
                    type="datetime-local" 
                    className="h-11" 
                    value={scheduledTime} 
                    onChange={(e) => setScheduledTime(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto bg-primary shadow-lg shadow-primary/20">
                {editingRequest ? "Salvar Alterações" : "Confirmar Solicitação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente ou destino..." 
            className="pl-10 h-12 bg-card border-none shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 bg-card border-none shadow-sm"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <BrainCircuit className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Sincronizando agendamentos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="min-w-[180px] font-bold">Paciente</TableHead>
                  <TableHead className="min-w-[150px] font-bold">Destino / Horário</TableHead>
                  <TableHead className="font-bold">Prioridade</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{req.patientName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{req.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                            <MapPin className="h-3 w-3 text-primary/60 shrink-0" />
                            <span className="truncate max-w-[140px]">{req.destinationLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            {new Date(req.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                            {new Date(req.requestedTime).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => { 
                              setEditingRequest(req); 
                              setPatientId(req.patientId); 
                              setDestination(req.destinationLocation); 
                              setUrgency(req.urgencyLevel); 
                              setScheduledTime(req.requestedTime.slice(0, 16));
                              setIsDialogOpen(true); 
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar Solicitação
                            </DropdownMenuItem>
                            {req.status === 'PENDING' && (
                              <DropdownMenuItem className="text-emerald-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar Transporte
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(req.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Cancelar Pedido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Filter className="h-10 w-10 opacity-20 mb-2" />
                        <p className="font-semibold">Nenhuma solicitação encontrada.</p>
                        <p className="text-xs">Tente ajustar seus filtros de busca.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
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
            <p className="text-xs font-bold uppercase text-primary">Aguardando IA</p>
            <p className="text-xl font-black">5</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-emerald-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-emerald-600">Prontos para Rota</p>
            <p className="text-xl font-black">12</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-rose-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Cancelados / Negados</p>
            <p className="text-xl font-black">3</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
