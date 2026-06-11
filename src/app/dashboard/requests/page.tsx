
"use client";

import { useState } from "react";
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
  Calendar 
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

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientNotes, setPatientNotes] = useState("");
  const [destination, setDestination] = useState("");
  const [suggestedUrgency, setSuggestedUrgency] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();

  const handleAiUrgency = async () => {
    if (!patientNotes || !destination) {
      toast({ title: "Dados incompletos", description: "Preencha destino e notas.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyUrgency({ patientNotes, destination });
      setSuggestedUrgency(result.suggestedUrgency);
      toast({ title: "Análise concluída", description: result.reasoning });
    } catch (error) {
      toast({ title: "Erro na IA", description: "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setIsClassifying(false);
    }
  };

  const filteredRequests = mockRequests.filter(req => 
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Logística de transporte sanitário.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2 shadow-md h-10">
              <Plus className="h-4 w-4" /> Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] w-[95%] p-4 sm:p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Solicitar Transporte</DialogTitle>
              <DialogDescription className="text-xs">Preencha os dados e use a IA para triagem.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid gap-1.5">
                <Label htmlFor="patient" className="text-xs">Paciente</Label>
                <Select>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione" />
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
                  className="h-9 text-sm"
                  placeholder="Hospital, Clínica, etc." 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
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
                  placeholder="Relate a condição do paciente..." 
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="urgency" className="text-xs">Urgência</Label>
                  <Select defaultValue={suggestedUrgency || undefined}>
                    <SelectTrigger className={cn("h-9 text-sm", suggestedUrgency && "border-primary bg-primary/5")}>
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
                  <Label htmlFor="time" className="text-xs">Horário</Label>
                  <Input id="time" type="datetime-local" className="h-9 text-sm px-1 sm:px-3" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-2 sm:gap-0">
              <Button variant="ghost" className="flex-1 sm:flex-none h-9 text-sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1 sm:flex-none h-9 text-sm" onClick={() => setIsDialogOpen(false)}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar paciente..." 
            className="pl-10 h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px] h-9">
              <TabsTrigger value="all" className="text-[10px] sm:text-xs">Todos</TabsTrigger>
              <TabsTrigger value="pending" className="text-[10px] sm:text-xs">Pendentes</TabsTrigger>
              <TabsTrigger value="approved" className="text-[10px] sm:text-xs">Ativos</TabsTrigger>
            </TabsList>
          </Tabs>
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
              {filteredRequests.map((req) => (
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
                      <span className="text-[10px] text-muted-foreground font-mono">{req.requestedTime.split(' ')[1]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Janela Limite</span>
          </div>
          <p className="text-xl font-bold">13:00h</p>
          <p className="text-[9px] opacity-80">Para agendamentos de amanhã.</p>
        </Card>
        
        <Card className="border-none shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Pendentes</span>
          </div>
          <p className="text-xl font-bold">12</p>
          <p className="text-[9px] text-muted-foreground">Aguardando secretaria.</p>
        </Card>

        <Card className="border-none shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1 text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Eficiência</span>
          </div>
          <p className="text-xl font-bold">94%</p>
          <p className="text-[9px] text-emerald-500 font-bold">+2% este mês.</p>
        </Card>
      </div>
    </div>
  );
}
