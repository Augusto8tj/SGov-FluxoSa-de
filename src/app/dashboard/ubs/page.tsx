
"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Hospital, 
  MapPin, 
  Phone, 
  ChevronRight,
  Activity,
  ArrowUpRight,
  MoreVertical
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
import { useToast } from "@/hooks/use-toast";
import { UBS } from "@/lib/types";

const initialUBS: UBS[] = [
  { id: "UBS-01", name: "UBS Central - Rio Claro", address: "Av. 29, 123 - Centro", location: { lat: -22.41, lng: -47.56 } },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Rua 14, 456 - Jd. Novo", location: { lat: -22.42, lng: -47.55 } },
  { id: "UBS-03", name: "UBS Norte / Jd. Panorama", address: "Av. Brasil, 789 - Panorama", location: { lat: -22.40, lng: -47.57 } },
];

export default function UBSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [units, setUnits] = useState(initialUBS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", address: "" });
  const { toast } = useToast();

  const filteredUBS = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) {
      toast({ title: "Atenção", description: "Preencha o nome e o endereço da UBS.", variant: "destructive" });
      return;
    }

    const unit: UBS = {
      id: `UBS-0${units.length + 1}`,
      name: newUnit.name,
      address: newUnit.address,
      location: { lat: -22.41, lng: -47.56 } // Mock location
    };

    setUnits(prev => [...prev, unit]);
    setIsDialogOpen(false);
    setNewUnit({ name: "", address: "" });
    toast({ title: "Unidade Cadastrada", description: `A ${unit.name} foi adicionada ao sistema.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Postos de Saúde (UBS)</h2>
          <p className="text-muted-foreground">Monitoramento e logística dos pontos de coleta de pacientes.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova UBS</DialogTitle>
              <DialogDescription>Adicione um ponto de coleta ao sistema de Rio Claro.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Unidade</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: UBS Santa Eliza" 
                  value={newUnit.name}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input 
                  id="address" 
                  placeholder="Rua, Número - Bairro" 
                  value={newUnit.address}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUnit}>Salvar Unidade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar unidade por nome ou bairro..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Demanda Hoje</TableHead>
                    <TableHead className="text-right">Mapa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUBS.length > 0 ? (
                    filteredUBS.map((ubs) => (
                      <TableRow key={ubs.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold text-xs">
                              {ubs.name.split(' ')[1]?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{ubs.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{ubs.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ubs.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="font-medium">12 pedidos</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary gap-1">
                            Ver <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        Nenhuma UBS encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Foco de Demanda</CardTitle>
              <CardDescription className="text-primary-foreground/80">UBS com maior volume hoje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-xs uppercase tracking-wider font-bold">UBS Central</p>
                <p className="text-3xl font-bold mt-1">32</p>
                <p className="text-[10px] mt-1 opacity-80">Solicitações autorizadas</p>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Capacidade Total</span>
                <span className="font-bold">84% Ocupada</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contatos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Central UBS</span>
                <Badge variant="secondary">Ramal 123</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Logística</span>
                <Badge variant="secondary">Ramal 110</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
