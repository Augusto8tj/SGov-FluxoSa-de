
"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Activity,
  ArrowUpRight,
  User,
  Mail,
  Clock,
  Building,
  ShieldCheck,
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UBS } from "@/lib/types";
import { MOCK_UBS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function UBSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [units, setUnits] = useState<UBS[]>(MOCK_UBS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UBS>>({ 
    name: "", 
    address: "", 
    managerName: "", 
    phone: "", 
    email: "", 
    operatingHours: "07:00 - 17:00",
    type: "UBS"
  });
  const { toast } = useToast();

  const filteredUBS = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) {
      toast({ title: "Atenção", description: "Preencha pelo menos o nome e o endereço da UBS.", variant: "destructive" });
      return;
    }

    const unit: UBS = {
      id: `UBS-0${units.length + 1}`,
      name: newUnit.name || "",
      address: newUnit.address || "",
      managerName: newUnit.managerName,
      phone: newUnit.phone,
      email: newUnit.email,
      operatingHours: newUnit.operatingHours,
      type: newUnit.type as any,
      status: 'active',
      location: { lat: -22.72, lng: -44.13 } // Mock location default para Rio Claro RJ
    };

    setUnits(prev => [...prev, unit]);
    setIsDialogOpen(false);
    setNewUnit({ name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: "UBS" });
    toast({ title: "Unidade Cadastrada", description: `A ${unit.name} foi adicionada ao sistema com sucesso.` });
  };

  const handleOpenMaps = (ubs: UBS) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ubs.location.lat},${ubs.location.lng}`;
    window.open(url, '_blank');
    toast({
      title: "Abrindo Mapa",
      description: `Direcionando para a localização de ${ubs.name}.`,
    });
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
            <Button className="gap-2 shadow-md h-11 px-6 rounded-xl">
              <Plus className="h-4 w-4" /> Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
              <DialogDescription>Adicione um ponto de coleta ao sistema de Rio Claro - RJ com dados administrativos.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest px-1">Identificação e Localização</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Unidade</Label>
                    <Input 
                      id="name" 
                      placeholder="Ex: UBS Santa Eliza" 
                      className="h-11 rounded-xl"
                      value={newUnit.name}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo de Unidade</Label>
                    <Select value={newUnit.type} onValueChange={(val) => setNewUnit(prev => ({ ...prev, type: val as any }))}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UBS">UBS (Saúde da Família)</SelectItem>
                        <SelectItem value="HOSPITAL">Hospital / Regional</SelectItem>
                        <SelectItem value="PRONTO_ATENDIMENTO">Pronto Atendimento</SelectItem>
                        <SelectItem value="ESPECIALIZADA">Clínica Especializada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input 
                    id="address" 
                    placeholder="Rua, Número - Bairro, Distrito" 
                    className="h-11 rounded-xl"
                    value={newUnit.address}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest px-1 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Gestão e Contato
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Responsável / Gerente</Label>
                    <Input 
                      placeholder="Nome do gestor local"
                      className="h-11 rounded-xl"
                      value={newUnit.managerName}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, managerName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Telefone / Ramal</Label>
                    <Input 
                      placeholder="(24) 0000-0000"
                      className="h-11 rounded-xl"
                      value={newUnit.phone}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail Institucional</Label>
                    <Input 
                      type="email"
                      placeholder="ubs@rioclaro.rj.gov.br"
                      className="h-11 rounded-xl"
                      value={newUnit.email}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Funcionamento</Label>
                    <Input 
                      placeholder="Ex: 07h às 17h"
                      className="h-11 rounded-xl"
                      value={newUnit.operatingHours}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, operatingHours: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleAddUnit} className="h-11 rounded-xl shadow-lg bg-primary">Salvar Unidade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar unidade por nome, endereço ou responsável..." 
              className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="font-bold">Unidade</TableHead>
                      <TableHead className="font-bold">Responsável & Contato</TableHead>
                      <TableHead className="font-bold">Status / Horário</TableHead>
                      <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUBS.length > 0 ? (
                      filteredUBS.map((ubs) => (
                        <TableRow key={ubs.id} className="hover:bg-muted/10 group transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white shadow-sm">
                                <Building className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-black text-sm text-slate-800">{ubs.name}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                                  <MapPin className="h-3 w-3" /> {ubs.address.split(',')[0]}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <User className="h-3 w-3 text-emerald-600" /> {ubs.managerName || "A definir"}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                <Phone className="h-2.5 w-2.5" /> {ubs.phone || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-black uppercase h-5 px-2">Aberto</Badge>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {ubs.operatingHours || "07:00 - 17:00"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                                onClick={() => handleOpenMaps(ubs)}
                                title="Abrir no Maps"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-medium italic">
                          Nenhuma unidade encontrada para a pesquisa.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="h-24 w-24" /></div>
            <CardHeader className="relative">
              <CardTitle className="text-lg font-black tracking-tighter uppercase">Demanda Crítica</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-xs">UBS com maior volume operacional hoje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="p-5 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-80">UBS Central</p>
                <div className="flex items-end gap-1 mt-1">
                  <p className="text-4xl font-black">32</p>
                  <p className="text-[10px] mb-2 font-bold opacity-60">PEDIDOS</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[84%]" />
                </div>
                <p className="text-[10px] mt-2 opacity-80 font-bold uppercase tracking-tighter">84% da capacidade de rota ocupada</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs uppercase text-muted-foreground font-black tracking-widest flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Ramais de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-xs font-bold text-slate-700 uppercase">Central de Regulação</span>
                <Badge variant="secondary" className="bg-primary text-white border-none font-black text-[10px]">192</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-xs font-bold text-slate-700 uppercase">Logística Municipal</span>
                <Badge variant="secondary" className="bg-slate-700 text-white border-none font-black text-[10px]">110</Badge>
              </div>
              <Button variant="outline" className="w-full h-11 rounded-xl border-dashed border-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Lista de Ramais UBS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
