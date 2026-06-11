
"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Ambulance, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench,
  MoreVertical,
  Filter
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/lib/types";

const mockVehicles: (Vehicle & { status: 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE' })[] = [
  { id: "V-001", type: "Ambulância", licensePlate: "ABC-1234", capacity: 2, available: true, status: 'AVAILABLE' },
  { id: "V-002", type: "Van", licensePlate: "XYZ-5678", capacity: 12, available: false, status: 'IN_USE' },
  { id: "V-003", type: "Sedan", licensePlate: "KJH-9012", capacity: 4, available: false, status: 'MAINTENANCE' },
  { id: "V-004", type: "Acessível", licensePlate: "LMN-3456", capacity: 1, available: true, status: 'AVAILABLE' },
];

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredVehicles = mockVehicles.filter(v => 
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Disponível</Badge>;
      case 'IN_USE': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Em Rota</Badge>;
      case 'MAINTENANCE': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Manutenção</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Gestão de Frota</h2>
          <p className="text-muted-foreground">Controle e manutenção dos veículos de transporte sanitário.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Veículo</DialogTitle>
              <DialogDescription>Adicione um novo veículo à frota municipal.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="plate">Placa</Label>
                <Input id="plate" placeholder="AAA-0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amb">Ambulância</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="acc">Acessível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cap">Capacidade (Pacientes)</Label>
                  <Input id="cap" type="number" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast({ title: "Veículo Cadastrado", description: "O veículo foi adicionado com sucesso." })}>Salvar Veículo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Ambulance className="h-4 w-4 text-primary" /> Frota Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">18</p>
            <p className="text-[10px] text-muted-foreground mt-1">Veículos registrados</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">14</p>
            <p className="text-[10px] text-muted-foreground mt-1">Prontos para serviço</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" /> Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4</p>
            <p className="text-[10px] text-muted-foreground mt-1">Em revisão técnica</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por placa ou modelo..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Ambulance className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{vehicle.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.capacity} {vehicle.capacity === 1 ? 'Vaga' : 'Vagas'}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
