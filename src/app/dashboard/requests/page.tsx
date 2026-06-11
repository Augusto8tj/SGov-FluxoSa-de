
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
  ArrowRight
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
    destinationLocation: "Centro de Hemodiálise",
    requestedTime: "2024-05-20 07:30",
    urgencyLevel: "critical",
    status: "APPROVED",
    operatorId: "OP-01",
    createdAt: "2024-05-19 15:30"
  },
  {
    id: "REQ-003",
    patientId: "P-789",
    patientName: "Ana Julia Oliveira",
    ubsId: "UBS-03",
    pickupLocation: "UBS Norte",
    destinationLocation: "Clínica de Olhos",
    requestedTime: "2024-05-20 14:15",
    urgencyLevel: "low",
    status: "COMPLETED",
    operatorId: "OP-02",
    createdAt: "2024-05-19 10:00"
  }
];

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação Criada",
      description: "A solicitação foi enviada para análise da secretaria.",
    });
    setIsDialogOpen(false);
  };

  const filteredRequests = mockRequests.filter(req => 
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: TransportStatus) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
      case 'APPROVED': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aprovado</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Concluído</Badge>;
      case 'DENIED': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Recusado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-rose-600">Crítico</Badge>;
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge variant="default">Média</Badge>;
      case 'low': return <Badge variant="secondary">Baixa</Badge>;
      default: return <Badge>{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-muted-foreground">Gerencie e acompanhe as solicitações de transporte sanitário.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Solicitar Transporte</DialogTitle>
              <DialogDescription>
                Preencha os dados do paciente e do trajeto para solicitar o transporte.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">Maria Aparecida Silva</SelectItem>
                    <SelectItem value="p2">João Pedro Santos</SelectItem>
                    <SelectItem value="p3">Ana Julia Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ubs">UBS de Origem</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="u1">UBS Central</SelectItem>
                      <SelectItem value="u2">UBS Rio Claro</SelectItem>
                      <SelectItem value="u3">UBS Norte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgência</Label>
                  <Select required>
                    <SelectTrigger>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destino</Label>
                <Input id="destination" placeholder="Hospital, Clínica, etc." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Data e Hora</Label>
                <Input id="time" type="datetime-local" required />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Enviar Solicitação</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente ou ID..." 
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2 h-10">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 w-full md:w-[300px] h-10">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Ativos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Trajeto</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Urgência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {req.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-medium text-xs">
                          {req.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{req.patientName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{req.patientId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{req.pickupLocation}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{req.destinationLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{req.requestedTime.split(' ')[1]}</span>
                        <span className="text-[10px] text-muted-foreground">{req.requestedTime.split(' ')[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUrgencyBadge(req.urgencyLevel)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhuma solicitação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Janela de Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">13:00h</p>
            <p className="text-xs opacity-80 mt-1">Horário limite para pedidos de amanhã.</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Total Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">Aguardando análise técnica.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Taxa de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">94%</p>
            <p className="text-xs text-emerald-500 font-medium mt-1">+2% em relação ao mês anterior.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
