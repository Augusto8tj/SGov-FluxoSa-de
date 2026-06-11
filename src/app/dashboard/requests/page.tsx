
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ClipboardList, 
  MoreVertical, 
  BrainCircuit, 
  Loader2, 
  ArrowRight,
  Edit,
  Trash2,
  Eye
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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";

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

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedRequests, fetchedPatients] = await Promise.all([
        requestService.getRequests(),
        patientService.getPatients()
      ]);
      setRequests(fetchedRequests);
      setPatients(fetchedPatients);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro de Conexão", description: "Não foi possível carregar os dados do servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRequest(null);
    setPatientId("");
    setPatientNotes("");
    setDestination("");
    setUrgency("low");
    setScheduledTime("");
  };

  const handleAiUrgency = async () => {
    if (!patientNotes || !destination) {
      toast({ title: "Dados incompletos", description: "Preencha destino e notas para a análise.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyUrgency({ patientNotes, destination });
      setUrgency(result.suggestedUrgency);
      toast({ 
        title: "Triagem Concluída", 
        description: `IA sugere: ${result.suggestedUrgency.toUpperCase()}.` 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "IA Indisponível", description: "Falha na análise inteligente." });
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
      patientName: patient?.name || "Paciente Desconhecido",
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
        toast({ title: "Sucesso", description: "Agendamento atualizado." });
      } else {
        await requestService.addRequest(requestData as any);
        toast({ title: "Sucesso", description: "Agendamento criado com sucesso." });
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Não foi possível sincronizar com o banco de dados.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      toast({ title: "Removido", description: "Solicitação cancelada." });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover o registro.", variant: "destructive" });
    }
  };

  const handleEdit = (req: TransportRequest) => {
    setEditingRequest(req);
    setPatientId(req.patientId);
    setDestination(req.destinationLocation);
    setUrgency(req.urgencyLevel);
    setScheduledTime(req.requestedTime.includes('T') ? req.requestedTime : req.requestedTime.replace(' ', 'T'));
    setIsDialogOpen(true);
  };

  const filteredRequests = requests.filter(req => 
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-rose-600 text-white">Crítico</Badge>;
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge variant="default">Média</Badge>;
      default: return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-sm text-muted-foreground">Gestão de transporte sincronizada com o banco de dados.</p>
        </div>
        
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Novo Pedido
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingRequest ? "Editar Pedido" : "Solicitar Transporte"}</DialogTitle>
              <DialogDescription>Preencha os dados para processamento administrativo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Cidadão</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                    {patients.length === 0 && <SelectItem value="none" disabled>Nenhum paciente cadastrado</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino</Label>
                <Input placeholder="Hospital, Clínica ou UPA" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Notas Clínicas</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={handleAiUrgency} disabled={isClassifying}>
                    {isClassifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />} IA
                  </Button>
                </div>
                <Textarea placeholder="Condição do paciente..." value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Urgência</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger><SelectValue placeholder="Nível" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Horário</Label>
                  <Input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar no Banco</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por paciente ou protocolo..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Sincronizando com Firebase...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.patientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="truncate max-w-[150px]">{req.destinationLocation}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(req)}><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-600" onSelect={() => handleDelete(req.id)}><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Nenhum registro encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
