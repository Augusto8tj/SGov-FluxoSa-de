
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
  Phone,
  Mail,
  UserCheck
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

const initialVehicles = [
  { id: "V1", plate: "ABC-1234", type: "Ambulância", capacity: 2, status: "Operacional" },
  { id: "V2", plate: "XYZ-5678", type: "Van", capacity: 12, status: "Operacional" },
];

const initialUsers = [
  { id: "U1", name: "Dr. Ricardo Silva", email: "secretario@rioclaro.rj.gov.br", role: "SECRETARY" },
  { id: "U2", name: "Márcia Oliveira", email: "ubs.central@rioclaro.rj.gov.br", role: "UBS_MANAGER" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState(initialUnits);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [users, setUsers] = useState(initialUsers);
  
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ id: "", name: "", address: "" });

  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ id: "", name: "", license: "", phone: "" });

  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ id: "", plate: "", type: "Ambulância", capacity: 1 });

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ id: "", name: "", email: "", role: "UBS_MANAGER" });

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

    if (newUnit.id) {
      setUnits(prev => prev.map(u => u.id === newUnit.id ? { ...u, name: newUnit.name, address: newUnit.address } : u));
      toast({ title: "Unidade Atualizada", description: `${newUnit.name} foi atualizada com sucesso.` });
    } else {
      const unit = {
        id: `UBS-0${units.length + 1}`,
        name: newUnit.name,
        address: newUnit.address,
        status: "Ativo"
      };
      setUnits(prev => [...prev, unit]);
      toast({ title: "Unidade Cadastrada", description: `${unit.name} foi adicionada ao sistema.` });
    }

    setIsUnitDialogOpen(false);
    setNewUnit({ id: "", name: "", address: "" });
  };

  const handleEditUnit = (unit: any) => {
    setNewUnit({ id: unit.id, name: unit.name, address: unit.address });
    setIsUnitDialogOpen(true);
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.license || !newDriver.phone) {
      toast({ title: "Erro", description: "Preencha todos os campos do motorista.", variant: "destructive" });
      return;
    }

    if (newDriver.id) {
      setDrivers(prev => prev.map(d => d.id === newDriver.id ? { ...d, name: newDriver.name, license: newDriver.license, phone: newDriver.phone } : d));
      toast({ title: "Motorista Atualizado", description: `${newDriver.name} foi atualizado com sucesso.` });
    } else {
      const driver = {
        id: `D${drivers.length + 1}`,
        name: newDriver.name,
        license: newDriver.license,
        phone: newDriver.phone,
        status: "Disponível"
      };
      setDrivers(prev => [...prev, driver]);
      toast({ title: "Motorista Cadastrada", description: `${driver.name} foi adicionado ao sistema.` });
    }

    setIsDriverDialogOpen(false);
    setNewDriver({ id: "", name: "", license: "", phone: "" });
  };

  const handleEditDriver = (driver: any) => {
    setNewDriver({ id: driver.id, name: driver.name, license: driver.license, phone: driver.phone });
    setIsDriverDialogOpen(true);
  };

  const handleAddVehicle = () => {
    if (!newVehicle.plate || !newVehicle.capacity) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios do veículo.", variant: "destructive" });
      return;
    }

    if (newVehicle.id) {
      setVehicles(prev => prev.map(v => v.id === newVehicle.id ? { ...v, plate: newVehicle.plate.toUpperCase(), type: newVehicle.type, capacity: Number(newVehicle.capacity) } : v));
      toast({ title: "Veículo Atualizado", description: `Dados do veículo ${newVehicle.plate.toUpperCase()} atualizados.` });
    } else {
      const vehicle = {
        id: `V${vehicles.length + 1}`,
        plate: newVehicle.plate.toUpperCase(),
        type: newVehicle.type,
        capacity: Number(newVehicle.capacity),
        status: "Operacional"
      };
      setVehicles(prev => [...prev, vehicle]);
      toast({ title: "Veículo Cadastrado", description: `Veículo ${vehicle.plate} adicionado à frota.` });
    }

    setIsVehicleDialogOpen(false);
    setNewVehicle({ id: "", plate: "", type: "Ambulância", capacity: 1 });
  };

  const handleEditVehicle = (vehicle: any) => {
    setNewVehicle({ id: vehicle.id, plate: vehicle.plate, type: vehicle.type, capacity: vehicle.capacity });
    setIsVehicleDialogOpen(true);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({ title: "Erro", description: "Preencha o nome e o e-mail do usuário.", variant: "destructive" });
      return;
    }

    if (newUser.id) {
      setUsers(prev => prev.map(u => u.id === newUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role } : u));
      toast({ title: "Usuário Atualizado", description: `Os dados de ${newUser.name} foram salvos.` });
    } else {
      const user = {
        id: `U${users.length + 1}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      setUsers(prev => [...prev, user]);
      toast({ title: "Usuário Cadastrado", description: `${user.name} agora tem acesso ao sistema.` });
    }

    setIsUserDialogOpen(false);
    setNewUser({ id: "", name: "", email: "", role: "UBS_MANAGER" });
  };

  const handleEditUser = (user: any) => {
    setNewUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    setIsUserDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SECRETARY': return <Badge variant="outline" className="border-primary text-primary">Secretário</Badge>;
      case 'UBS_MANAGER': return <Badge variant="outline" className="border-emerald-600 text-emerald-600">UBS</Badge>;
      case 'DRIVER': return <Badge variant="outline" className="border-accent text-accent-foreground">Motorista</Badge>;
      case 'ADMIN': return <Badge variant="destructive">Admin</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
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
                  <Button className="gap-2" onClick={() => setNewUnit({ id: "", name: "", address: "" })}>
                    <Plus className="h-4 w-4" /> Adicionar UBS
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{newUnit.id ? "Editar Unidade" : "Nova Unidade de Saúde"}</DialogTitle>
                    <DialogDescription>
                      {newUnit.id ? "Atualize os dados do ponto de atendimento." : "Cadastre um novo ponto de atendimento em Rio Claro - RJ."}
                    </DialogDescription>
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
                    <Button onClick={handleAddUnit}>{newUnit.id ? "Salvar Alterações" : "Salvar Unidade"}</Button>
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
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditUnit(unit); }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => {
                              setUnits(prev => prev.filter(u => u.id !== unit.id));
                              toast({ title: "Unidade Removida", description: "A unidade foi excluída do sistema.", variant: "destructive" });
                            }}>
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
                  <Button className="gap-2" onClick={() => setNewDriver({ id: "", name: "", license: "", phone: "" })}>
                    <Plus className="h-4 w-4" /> Novo Motorista
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{newDriver.id ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
                    <DialogDescription>
                      {newDriver.id ? "Atualize os dados do condutor." : "Cadastre um novo condutor para a frota municipal."}
                    </DialogDescription>
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
                    <Button onClick={handleAddDriver}>{newDriver.id ? "Salvar Alterações" : "Salvar Motorista"}</Button>
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
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditDriver(driver); }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => {
                              setDrivers(prev => prev.filter(d => d.id !== driver.id));
                              toast({ title: "Motorista Removido", description: "O cadastro foi excluído.", variant: "destructive" });
                            }}>
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
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => setNewVehicle({ id: "", plate: "", type: "Ambulância", capacity: 1 })}>
                    <Plus className="h-4 w-4" /> Cadastrar Veículo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{newVehicle.id ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
                    <DialogDescription>
                      {newVehicle.id ? "Atualize as informações do veículo." : "Adicione um novo veículo para o transporte sanitário."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="v-plate">Placa</Label>
                      <Input 
                        id="v-plate" 
                        placeholder="AAA-0000" 
                        value={newVehicle.plate}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Tipo</Label>
                        <Select 
                          value={newVehicle.type} 
                          onValueChange={(val) => setNewVehicle(prev => ({ ...prev, type: val as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ambulância">Ambulância</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="Acessível">Acessível</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="v-cap">Capacidade</Label>
                        <Input 
                          id="v-cap" 
                          type="number" 
                          value={newVehicle.capacity}
                          onChange={(e) => setNewVehicle(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsVehicleDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddVehicle}>{newVehicle.id ? "Salvar Alterações" : "Salvar Veículo"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono">{vehicle.plate}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.capacity} {vehicle.capacity === 1 ? 'Paciente' : 'Pacientes'}</TableCell>
                      <TableCell><Badge className="bg-emerald-100 text-emerald-700">{vehicle.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditVehicle(vehicle); }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => {
                              setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
                              toast({ title: "Veículo Removido", description: "O veículo foi excluído da frota.", variant: "destructive" });
                            }}>
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

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>Gerencie quem acessa as plataformas de gestão e operação.</CardDescription>
              </div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => setNewUser({ id: "", name: "", email: "", role: "UBS_MANAGER" })}>
                    <Plus className="h-4 w-4" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{newUser.id ? "Editar Usuário" : "Cadastrar Novo Usuário"}</DialogTitle>
                    <DialogDescription>Defina as credenciais e permissões de acesso.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="u-name">Nome Completo</Label>
                      <Input 
                        id="u-name" 
                        placeholder="Ex: João da Silva" 
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="u-email">E-mail Institucional</Label>
                      <Input 
                        id="u-email" 
                        type="email"
                        placeholder="usuario@rioclaro.rj.gov.br" 
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Perfil de Acesso</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(val) => setNewUser(prev => ({ ...prev, role: val as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SECRETARY">Secretário</SelectItem>
                          <SelectItem value="UBS_MANAGER">Gerente UBS</SelectItem>
                          <SelectItem value="DRIVER">Motorista (Acesso Móvel)</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddUser}>{newUser.id ? "Salvar Alterações" : "Criar Usuário"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditUser(user); }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast({ title: "Segurança", description: `Um link de redefinição de senha foi enviado para ${user.email}.` })}>
                              <Key className="h-4 w-4 mr-2" /> Resetar Senha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => {
                              setUsers(prev => prev.filter(u => u.id !== user.id));
                              toast({ title: "Acesso Revogado", description: `O usuário ${user.name} foi removido do sistema.`, variant: "destructive" });
                            }}>
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
                  <Badge className="bg-primary">SECRETARY</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Gerente UBS</p>
                    <p className="text-[10px] text-muted-foreground">Solicitação e Cadastro de Pacientes</p>
                  </div>
                  <Badge className="bg-emerald-600">UBS_MANAGER</Badge>
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
