
"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Hospital, 
  User, 
  Ambulance, 
  Users, 
  ShieldCheck, 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  MapPin,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialUnits = [
  { id: "UBS-01", name: "UBS Central", address: "Av. 29, 123 - Centro", status: "Ativo" },
  { id: "UBS-02", name: "UBS Rio Claro Sul", address: "Distrito de Passa Três", status: "Ativo" },
];

const initialDrivers = [
  { id: "D1", name: "Carlos Alberto Silva", license: "Cat. D - 20/05/2026", phone: "(19) 99123-4567", status: "Disponível" },
  { id: "D2", name: "Marcos Pereira", license: "Cat. D - 15/02/2025", phone: "(19) 98765-4321", status: "Disponível" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState(initialUnits);
  const [drivers, setDrivers] = useState(initialDrivers);
  
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", address: "" });

  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", license: "", phone: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = (module: string) => {
    toast({
      title: "Alterações Salvas",
      description: `As configurações de ${module} foram atualizadas com sucesso.`,
    });
  };

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) {
      toast({ title: "Erro", description: "Preencha todos os campos da unidade.", variant: "destructive" });
      return;
    }

    const unit = {
      id: `UBS-0${units.length + 1}`,
      name: newUnit.name,
      address: newUnit.address,
      status: "Ativo"
    };

    setUnits(prev => [...prev, unit]);
    setIsUnitDialogOpen(false);
    setNewUnit({ name: "", address: "" });
    toast({ title: "Unidade Cadastrada", description: `${unit.name} foi adicionada ao sistema.` });
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.license || !newDriver.phone) {
      toast({ title: "Erro", description: "Preencha todos os campos do motorista.", variant: "destructive" });
      return;
    }

    const driver = {
      id: `D${drivers.length + 1}`,
      name: newDriver.name,
      license: newDriver.license,
      phone: newDriver.phone,
      status: "Disponível"
    };

    setDrivers(prev => [...prev, driver]);
    setIsDriverDialogOpen(false);
    setNewDriver({ name: "", license: "", phone: "" });
    toast({ title: "Motorista Cadastrado", description: `${driver.name} foi adicionado ao sistema.` });
  };

  if (!mounted) {
    return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Gerenciamento administrativo de entidades e acessos.</p>
        </div>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-900 border p-1 h-12 shadow-sm w-full md:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="units" className="gap-2 px-4 h-10"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-4 h-10"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2 px-4 h-10"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
          <TabsTrigger value="users" className="gap-2 px-4 h-10"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2 px-4 h-10"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unidades de Saúde (UBS)</CardTitle>
                <CardDescription>Cadastre e gerencie as UBS do município.</CardDescription>
              </div>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Adicionar UBS</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Unidade de Saúde</DialogTitle>
                    <DialogDescription>Cadastre um novo ponto de atendimento em Rio Claro - RJ.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit-name">Nome da UBS</Label>
                      <Input 
                        id="unit-name" 
                        placeholder="Ex: UBS Lídice" 
                        value={newUnit.name}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit-address">Endereço</Label>
                      <Input 
                        id="unit-address" 
                        placeholder="Rua, Número - Bairro" 
                        value={newUnit.address}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsUnitDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddUnit}>Salvar Unidade</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>{unit.address}</TableCell>
                      <TableCell><Badge variant="secondary">{unit.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast({ title: "Editar", description: `Editando unidade ${unit.name}` })}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Corpo de Motoristas</CardTitle>
                <CardDescription>Gestão de condutores, habilitações e contatos.</CardDescription>
              </div>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Motorista</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Motorista</DialogTitle>
                    <DialogDescription>Cadastre um novo condutor para a frota municipal.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="driver-name">Nome Completo</Label>
                      <Input 
                        id="driver-name" 
                        placeholder="Ex: Carlos Alberto Silva" 
                        value={newDriver.name}
                        onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-license">CNH / Categoria / Vencimento</Label>
                      <Input 
                        id="driver-license" 
                        placeholder="Cat. D - 00/00/0000" 
                        value={newDriver.license}
                        onChange={(e) => setNewDriver(prev => ({ ...prev, license: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-phone">Telefone / WhatsApp</Label>
                      <Input 
                        id="driver-phone" 
                        placeholder="(19) 90000-0000" 
                        value={newDriver.phone}
                        onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDriverDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddDriver}>Salvar Motorista</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNH / Vencimento</TableHead>
                    <TableHead>Telefone / Zap</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.license}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs">{driver.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className="bg-emerald-100 text-emerald-700">{driver.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast({ title: "Editar", description: `Editando motorista ${driver.name}` })}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Configuração da Frota</CardTitle>
                <CardDescription>Cadastro técnico de veículos municipais.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Frota")}>Cadastrar Veículo</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">ABC-1234</TableCell>
                    <TableCell>Ambulância</TableCell>
                    <TableCell>2 Pacientes</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Manutenção</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">XYZ-5678</TableCell>
                    <TableCell>Van de Passageiros</TableCell>
                    <TableCell>12 Pacientes</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Manutenção</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>Gerencie quem acessa as plataformas de gestão e operação.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Usuários")}>Novo Usuário</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dr. Ricardo Silva</TableCell>
                    <TableCell>secretario@rioclaro.rj.gov.br</TableCell>
                    <TableCell><Badge variant="outline" className="border-primary text-primary">Secretário</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Segurança", description: "Enviando link de redefinição de senha." })}><Key className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Editar", description: "Acessando perfil do usuário." })}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Márcia Oliveira</TableCell>
                    <TableCell>ubs.central@rioclaro.rj.gov.br</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-600 text-emerald-600">UBS</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Segurança", description: "Enviando link de redefinição de senha." })}><Key className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Editar", description: "Acessando perfil do usuário." })}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Estrutura de Perfis</CardTitle>
                <CardDescription>Defina as permissões por grupo de usuário.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Secretário</p>
                    <p className="text-[10px] text-muted-foreground">Acesso Total + Auditoria</p>
                  </div>
                  <Badge className="bg-primary">ADMIN</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Gerente UBS</p>
                    <p className="text-[10px] text-muted-foreground">Solicitação e Cadastro de Pacientes</p>
                  </div>
                  <Badge className="bg-emerald-600">UBS</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Motorista</p>
                    <p className="text-[10px] text-muted-foreground">Acesso Mobile / Itinerários</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">DRIVER</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Segurança e Auditoria</CardTitle>
                <CardDescription>Políticas globais de acesso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tempo de Sessão (minutos)</Label>
                  <Input type="number" defaultValue="120" className="bg-white dark:bg-slate-900" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">Autenticação de Dois Fatores</p>
                    <p className="text-[10px] text-muted-foreground">Obrigatória para perfis Administrativos.</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Ativado</Badge>
                </div>
                <Button className="w-full mt-4" onClick={() => handleSave("Perfis")}>Salvar Políticas</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
