
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ClipboardList, 
  CheckCircle2, 
  MoreVertical, 
  AlertCircle, 
  ArrowRight, 
  BrainCircuit, 
  Loader2, 
  Calendar,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TransportRequest, TransportStatus } from "@/lib/types";
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

const mockRequests: TransportRequest[] = [
  {
    id: "REQ-001",
    patientId: "P-123",
    patientName: "Maria Aparecida Silva",
    ubsId: "UBS-01",
    pickupLocation: "UBS Central",
    destinationLocation: "Hospital Municipal",
    requestedTime: "2024-05-20 09:00",
    urgencyLevel: "high",
    status: "PENDING",
    operatorId: "OP-01",
    createdAt: "2024-05-19 14:00"
  },
  {
    id: "REQ-002",
    patientId: "P-456",
    patientName: "João Pedro Santos",
    ubsId: "UBS-02",
    pickupLocation: "UBS Rio Claro",
    destinationLocation: "Hemodiálise",
    requestedTime: "2024-05-20 07:30",
    urgencyLevel: "critical",
    status: "APPROVED",
    operatorId: "OP-01",
    createdAt: "2024-05-19 15:30"
  }
];

const INITIAL_DESTINATIONS = [
  "Hospital Municipal Rio Claro",
  "Centro de Hemodiálise",
  "Santa Casa de Rio Claro",
  "UPA 24h Rio Claro",
  "Clínica de Especialidades",
  "Hospital de Lídice",
  "Centro de Reabilitação Municipal",
  "Laboratório Central",
  "Policlínica Leste"
];

export default function RequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estados controlados do formulário
  const [patientId, setPatientId] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [destination, setDestination] = useState("");
  const [urgency, setUrgency] = useState<string>("low");
  const [scheduledTime, setScheduledTime] = useState("");
  
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [recentDestinations, setRecentDestinations] = useState(INITIAL_DESTINATIONS);
  const [isClassifying, setIsClassifying] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        description: `Sugestão: ${result.suggestedUrgency.toUpperCase()}. ${result.reasoning}` 
      });
    } catch (error) {
      console.error("Erro na classificação IA", error);
      toast({ 
        variant: "destructive",
        title: "IA Indisponível", 
        description: "O serviço de triagem inteligente está temporariamente fora do ar." 
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleCreateOrUpdate = () => {
    if (!destination) {
      toast({ title: "Destino necessário", description: "Por favor, informe o local de destino.", variant: "destructive" });
      return;
    }

    if (destination && !recentDestinations.includes(destination)) {
      setRecentDestinations(prev => [destination, ...prev]);
    }

    if (editingRequest) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? {
        ...r,
        destinationLocation: destination,
        urgencyLevel: urgency as any,
        requestedTime: scheduledTime || r.requestedTime,
      } : r));
      toast({ title: "Agendamento Atualizado", description: "As alterações foram salvas com sucesso." });
    } else {
      const newReq: TransportRequest = {
        id: `REQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        patientId: patientId || "P-123",
        patientName: patientId === "p1" ? "Maria Aparecida Silva" : "João Pedro Santos",
        ubsId: "UBS-01",
        pickupLocation: "UBS Central",
        destinationLocation: destination,
        requestedTime: scheduledTime || "2024-05-20 08:00",
        urgencyLevel: urgency as any,
        status: "PENDING",
        operatorId: "OP-01",
        createdAt: new Date().toISOString()
      };
      setRequests(prev => [newReq, ...prev]);
      toast({ title: "Agendamento Criado", description: "O pedido foi encaminhado para análise da secretaria." });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Solicitação Removida",
      description: `O agendamento ${id} foi cancelado com sucesso.`,
      variant: "destructive"
    });
  };

  const handleEdit = (req: TransportRequest) => {
    setEditingRequest(req);
    setPatientId(req.patientId);
    setDestination(req.destinationLocation);
    setUrgency(req.urgencyLevel);
    setScheduledTime(req.requestedTime.replace(' ', 'T'));
    setIsDialogOpen(true);
  };

  const filteredRequests = requests.filter(req => 
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-rose-600 text-[10px] px-1.5 py-0 text-white border-none">Crítico</Badge>;
      case 'high': return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Alta</Badge>;
      case 'medium': return <Badge variant="default" className="text-[10px] px-1.5 py-0">Média</Badge>;
      case 'low': return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Baixa</Badge>;
      default: return <Badge className="text-[10px] px-1.5 py-0">{level}</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Logística de transporte sanitário municipal.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2 shadow-md h-10">
              <Plus className="h-4 w-4" /> Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] w-[95%] p-4 sm:p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">{editingRequest ? "Editar Pedido" : "Solicitar Transporte"}</DialogTitle>
              <DialogDescription className="text-xs">
                {editingRequest ? "Atualize os dados da solicitação selecionada." : "Preencha os dados e use a IA para triagem automática."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid gap-1.5">
                <Label htmlFor="patient" className="text-xs">Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o cidadão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">Maria Aparecida Silva</SelectItem>
                    <SelectItem value="p2">João Pedro Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="destination" className="text-xs">Destino</Label>
                <Input 
                  id="destination" 
                  list="destinations-list"
                  className="h-9 text-sm"
                  placeholder="Hospital, Clínica ou Prontuário" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <datalist id="destinations-list">
                  {recentDestinations.map((d, index) => (
                    <option key={`${d}-${index}`} value={d} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes" className="text-xs">Notas Clínicas</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[9px] gap-1 text-primary"
                    onClick={handleAiUrgency}
                    disabled={isClassifying}
                  >
                    {isClassifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                    Assistência IA
                  </Button>
                </div>
                <Textarea 
                  id="notes" 
                  className="text-sm min-h-[60px]"
                  placeholder="Relate a condição do paciente para triagem..." 
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="urgency" className="text-xs">Urgência</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className={cn("h-9 text-sm", urgency !== 'low' && "border-primary bg-primary/5")}>
                      <SelectValue placeholder="Nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="time" className="text-xs">Horário Desejado</Label>
                  <Input 
                    id="time" 
                    type="datetime-local" 
                    className="h-9 text-sm px-1 sm:px-3"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-2 sm:gap-0">
              <Button variant="ghost" className="flex-1 sm:flex-none h-9 text-sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1 sm:flex-none h-9 text-sm" onClick={handleCreateOrUpdate}>
                {editingRequest ? "Salvar Alterações" : "Enviar Pedido"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente ou protocolo..." 
            className="pl-10 h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] sm:text-xs uppercase font-bold py-3 px-4">Paciente</TableHead>
                <TableHead className="text-[10px] sm:text-xs uppercase font-bold py-3 px-4 hidden sm:table-cell">Trajeto</TableHead>
                <TableHead className="text-[10px] sm:text-xs uppercase font-bold py-3 px-4">Info</TableHead>
                <TableHead className="text-right text-[10px] sm:text-xs uppercase font-bold py-3 px-4">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/30">
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {req.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{req.patientName}</p>
                          <p className="text-[9px] text-muted-foreground sm:hidden truncate">{req.pickupLocation} → {req.destinationLocation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground truncate max-w-[80px]">{req.pickupLocation}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate max-w-[80px]">{req.destinationLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {getUrgencyBadge(req.urgencyLevel)}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {req.requestedTime.includes(' ') ? req.requestedTime.split(' ')[1] : req.requestedTime.split('T')[1]?.slice(0, 5)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => toast({ title: "Visualizar", description: `Abrindo detalhes de ${req.patientName}` })}>
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            handleEdit(req);
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-rose-600"
                            onSelect={() => handleDelete(req.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
