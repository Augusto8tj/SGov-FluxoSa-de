
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BrainCircuit, 
  Loader2, 
  Edit,
  Trash2,
  Filter
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
      toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAiUrgency = async () => {
    if (!patientNotes || !destination) {
      toast({ title: "Incompleto", description: "Preencha destino e notas.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyUrgency({ patientNotes, destination });
      setUrgency(result.suggestedUrgency);
      toast({ title: "IA: Análise Concluída", description: `Urgência sugerida: ${result.suggestedUrgency.toUpperCase()}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "IA Indisponível" });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSave = async () => {
    if (!patientId || !destination) {
      toast({ title: "Erro", description: "Campos obrigatórios vazios.", variant: "destructive" });
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    const requestData = {
      patientId,
      patientName: patient?.name || "Desconhecido",
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
      toast({ title: "Sucesso", description: "Dados sincronizados com o banco." });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      loadData();
      toast({ title: "Removido", description: "Solicitação cancelada." });
    } catch (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const filteredRequests = requests.filter(req => 
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-destructive text-destructive-foreground">Crítico</Badge>;
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge className="bg-primary text-primary-foreground">Média</Badge>;
      default: return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-sm text-muted-foreground">Gestão de transporte sanitário.</p>
        </div>
        
        <Button onClick={() => { setEditingRequest(null); setIsDialogOpen(true); }} className="gap-2 shadow-md w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Pedido
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>{editingRequest ? "Editar Pedido" : "Solicitar Transporte"}</DialogTitle>
              <DialogDescription>Dados sincronizados em tempo real.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Cidadão</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destino</Label>
                <Input placeholder="Local de atendimento" className="h-11" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Notas Clínicas</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary font-bold" onClick={handleAiUrgency} disabled={isClassifying}>
                    {isClassifying ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <BrainCircuit className="h-3 w-3 mr-1" />} USAR IA
                  </Button>
                </div>
                <Textarea placeholder="Descreva a condição..." className="min-h-[100px]" value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Urgência</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Data/Hora</Label>
                  <Input type="datetime-local" className="h-11" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto">Salvar Registro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por paciente..." className="pl-10 h-11 bg-card border-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Sincronizando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[150px]">Paciente</TableHead>
                  <TableHead className="min-w-[120px]">Destino</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/10">
                    <TableCell className="font-medium">{req.patientName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{req.destinationLocation}</TableCell>
                    <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingRequest(req); setPatientId(req.patientId); setDestination(req.destinationLocation); setUrgency(req.urgencyLevel); setIsDialogOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(req.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
