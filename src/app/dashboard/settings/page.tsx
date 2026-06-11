
"use client";

import { useState, useEffect } from "react";
import { 
  Hospital, 
  User, 
  Ambulance, 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit,
  BrainCircuit, 
  Zap, 
  Loader2, 
  Activity, 
  Gauge,
  Code,
  AlertCircle,
  Play,
  Trophy,
  BarChart3,
  Fuel,
  Calendar,
  Droplets,
  Mail,
  Phone,
  Clock
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
import { Textarea } from "@/components/ui/textarea";
import { runModelTest, ModelTesterOutput } from "@/ai/flows/model-tester-flow";
import { cn } from "@/lib/utils";
import { UserRole, Vehicle, UBS } from "@/lib/types";
import { MOCK_UBS } from "@/lib/mock-data";

const AI_MODELS = [
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nvidia Nemotron Nano 9B (Padrão Free)" },
  { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash Exp" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B (Estável)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
];

const initialDrivers = [
  { id: "D1", name: "Carlos Alberto Silva", license: "Cat. D - 20/05/2026", phone: "(19) 99123-4567", status: "Disponível" },
  { id: "D2", name: "Marcos Pereira", license: "Cat. D - 15/02/2025", phone: "(19) 98765-4321", status: "Disponível" },
];

const initialVehicles = [
  { id: "V1", plate: "ABC-1234", type: "Ambulância" as const, capacity: 2, status: "Operacional" },
  { id: "V2", plate: "XYZ-5678", type: "Van" as const, capacity: 12, status: "Operacional" },
];

const initialUsers = [
  { id: "U1", name: "Dr. Ricardo Silva", email: "secretario@rioclaro.rj.gov.br", role: "SECRETARY" as UserRole },
  { id: "U2", name: "Márcia Oliveira", email: "ubs.central@rioclaro.rj.gov.br", role: "UBS_MANAGER" as UserRole },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  const [aiModel, setAiModel] = useState("nvidia/nemotron-nano-9b-v2:free");
  const [aiTestPrompt, setAiTestPrompt] = useState("Dê um resumo das metas de saúde pública específicas para o município de Rio Claro, Rio de Janeiro (RJ) para 2024.");
  const [testResult, setTestResult] = useState<ModelTesterOutput | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState<(ModelTesterOutput & { modelName: string })[]>([]);
  const [activeDebugTab, setActiveDebugTab] = useState("response");

  const [units, setUnits] = useState<UBS[]>(MOCK_UBS);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [users, setUsers] = useState(initialUsers);
  
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UBS>>({ 
    id: "", 
    name: "", 
    address: "", 
    managerName: "", 
    phone: "", 
    email: "", 
    operatingHours: "07:00 - 17:00", 
    type: 'UBS' 
  });
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ id: "", name: "", license: "", phone: "" });
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ 
    id: "", 
    licensePlate: "", 
    type: "Ambulância", 
    capacity: 1,
    status: "AVAILABLE",
    odometer: 0,
    fuelLevel: 100
  });
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ id: "", name: "", email: "", role: "UBS_MANAGER" as UserRole });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTestAi = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const result = await runModelTest(aiTestPrompt, aiModel);
      setTestResult(result);
      if (result.error) {
        toast({ variant: "destructive", title: "Erro no Modelo", description: "O modelo retornou um erro." });
      } else {
        toast({ title: "Análise Concluída", description: `Latência de ${result.latency}ms.` });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha no Laboratório", description: error.message });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsBatchTesting(true);
    setBatchResults([]);
    toast({ title: "Benchmarking", description: "Testando modelos..." });
    const results: any[] = [];
    for (const model of AI_MODELS) {
      try {
        const result = await runModelTest(aiTestPrompt, model.id);
        results.push({ ...result, modelName: model.name });
        setBatchResults([...results]);
      } catch {
        results.push({ content: "Erro", latency: 0, actualModel: model.id, modelName: model.name, error: "Falha" });
        setBatchResults([...results]);
      }
    }
    setIsBatchTesting(false);
  };

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) return;
    if (newUnit.id) {
      setUnits(prev => prev.map(u => u.id === newUnit.id ? { ...u, ...newUnit } as UBS : u));
    } else {
      setUnits(prev => [...prev, { ...newUnit, id: `UBS-0${units.length + 1}`, status: 'active', location: { lat: 0, lng: 0 } } as UBS]);
    }
    setIsUnitDialogOpen(false);
    setNewUnit({ id: "", name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: 'UBS' });
    toast({ title: "Unidade Salva", description: "Configurações da rede de saúde atualizadas." });
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.license) return;
    if (newDriver.id) {
      setDrivers(prev => prev.map(d => d.id === newDriver.id ? { ...d, name: newDriver.name, license: newDriver.license, phone: newDriver.phone } : d));
    } else {
      setDrivers(prev => [...prev, { id: `D${drivers.length + 1}`, name: newDriver.name, license: newDriver.license, phone: newDriver.phone, status: "Disponível" }]);
    }
    setIsDriverDialogOpen(false);
    setNewDriver({ id: "", name: "", license: "", phone: "" });
  };

  const handleAddVehicle = () => {
    if (!newVehicle.licensePlate) return;
    if (newVehicle.id) {
      setVehicles(prev => prev.map(v => v.id === newVehicle.id ? { ...v, plate: newVehicle.licensePlate!.toUpperCase(), type: newVehicle.type as any, capacity: newVehicle.capacity as any } : v));
    } else {
      setVehicles(prev => [...prev, { id: `V${vehicles.length + 1}`, plate: newVehicle.licensePlate!.toUpperCase(), type: newVehicle.type as any, capacity: newVehicle.capacity as any, status: "Operacional" }]);
    }
    setIsVehicleDialogOpen(false);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    if (newUser.id) {
      setUsers(prev => prev.map(u => u.id === newUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role } : u));
    } else {
      setUsers(prev => [...prev, { id: `U${users.length + 1}`, name: newUser.name, email: newUser.email, role: newUser.role }]);
    }
    setIsUserDialogOpen(false);
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

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1 px-1 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Configurações do Sistema</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Gestão administrativa e Laboratório de IA - Rio Claro, RJ.</p>
      </div>

      <Tabs defaultValue="ia-lab" className="space-y-4 sm:space-y-6">
        <div className="bg-background/50 sticky top-16 z-30 pb-2">
          <TabsList className="bg-white dark:bg-slate-900 border p-2 h-auto flex flex-col sm:flex-row sm:h-12 shadow-sm w-full sm:w-auto justify-start rounded-2xl sm:rounded-xl gap-1 sm:gap-0 overflow-hidden">
            <TabsTrigger value="ia-lab" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><BrainCircuit className="h-4 w-4" /> Laboratório IA</TabsTrigger>
            <TabsTrigger value="units" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
            <TabsTrigger value="fleet" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
          </TabsList>
        </div>

        {/* Laboratório de IA Tab Content Omitted for Brevity as it was not changed */}
        <TabsContent value="ia-lab" className="space-y-4 sm:space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-none shadow-sm h-full flex flex-col rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b bg-muted/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0"><Zap className="h-5 w-5 text-primary" /></div>
                    <div>
                      <CardTitle className="text-lg">Configuração OpenRouter</CardTitle>
                      <CardDescription className="text-xs">Compare modelos Nvidia, Claude e outros.</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRunAllTests} 
                    disabled={isBatchTesting || isTestingAi} 
                    className="w-full sm:w-auto gap-2 text-[10px] font-bold uppercase h-9 rounded-lg"
                  >
                    {isBatchTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                    Benchmarking
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Modelo de IA (Default: Nvidia)</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {AI_MODELS.map(m => <SelectItem key={m.id} value={m.id} className="rounded-lg">{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Prompt de Teste</Label>
                  <Textarea 
                    className="min-h-[140px] resize-none text-sm rounded-xl bg-muted/20 border-muted-foreground/10 focus:ring-primary/20" 
                    value={aiTestPrompt} 
                    onChange={(e) => setAiTestPrompt(e.target.value)} 
                  />
                </div>
                <Button 
                  className="w-full h-10 sm:h-12 rounded-xl uppercase text-[10px] sm:text-xs font-bold gap-2 mt-auto shadow-lg shadow-primary/10" 
                  onClick={handleTestAi} 
                  disabled={isTestingAi || isBatchTesting}
                >
                  {isTestingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  Executar Teste Cloud
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-h-[350px] overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-primary/5 py-4 shrink-0 border-b px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase flex items-center gap-2 tracking-tighter">
                    <Gauge className="h-4 w-4 text-primary" /> Telemetria & Debug
                  </CardTitle>
                  {testResult && <Badge variant={testResult.error ? "destructive" : "outline"} className="text-[10px] px-2 h-6 rounded-full">{testResult.latency}ms</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col bg-muted/5">
                <Tabs value={activeDebugTab} onValueChange={setActiveDebugTab} className="flex-1 flex flex-col">
                  <TabsList className="bg-transparent border-b rounded-none w-full justify-start px-4 h-11 shrink-0 gap-4">
                    <TabsTrigger value="response" className="text-[10px] font-bold uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-11">Resposta</TabsTrigger>
                    <TabsTrigger value="raw" className="text-[10px] font-bold uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-11 gap-1"><Code className="h-3 w-3" /> Bruto</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="response" className="p-4 m-0 focus-visible:ring-0">
                      {testResult ? (
                        <div className={cn("p-5 rounded-2xl text-sm border whitespace-pre-wrap leading-relaxed shadow-inner", testResult.error ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-card")}>
                          {testResult.error && <p className="font-bold uppercase text-[10px] mb-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> ERRO NO PROVEDOR:</p>}
                          {testResult.error || testResult.content}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-30 grayscale">
                          <div className="p-4 bg-muted rounded-full mb-3">
                            <BrainCircuit className="h-10 w-10" />
                          </div>
                          <p className="uppercase text-[10px] font-black tracking-widest">Aguardando Execução</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="raw" className="p-4 m-0 focus-visible:ring-0">
                      {testResult?.rawResponse ? (
                        <div className="rounded-2xl overflow-hidden border">
                          <pre className="p-5 bg-slate-950 text-emerald-400 text-[10px] font-mono overflow-x-auto">
                            {JSON.stringify(testResult.rawResponse, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-30 uppercase text-[10px] font-black tracking-widest">Sem dados brutos</div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div>
                <CardTitle>Unidades de Saúde (UBS)</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Cadastre e gerencie as UBS do município.</CardDescription>
              </div>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md">
                    <Plus className="h-4 w-4" /> Adicionar UBS
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{newUnit.id ? "Editar Unidade" : "Nova Unidade de Saúde"}</DialogTitle>
                    <DialogDescription className="text-xs">Atualize os dados do ponto de atendimento em Rio Claro - RJ.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="u-name">Nome da Unidade</Label>
                        <Input id="u-name" className="h-11 rounded-xl" value={newUnit.name} onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Tipo</Label>
                        <Select value={newUnit.type} onValueChange={(val) => setNewUnit(prev => ({ ...prev, type: val as any }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UBS">UBS</SelectItem>
                            <SelectItem value="HOSPITAL">Hospital</SelectItem>
                            <SelectItem value="PRONTO_ATENDIMENTO">PA</SelectItem>
                            <SelectItem value="ESPECIALIZADA">Clínica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="u-address">Endereço Completo</Label>
                      <Input id="u-address" className="h-11 rounded-xl" value={newUnit.address} onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Gerente / Responsável</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.managerName} onChange={(e) => setNewUnit(prev => ({ ...prev, managerName: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Telefone / Ramal</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.phone} onChange={(e) => setNewUnit(prev => ({ ...prev, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.email} onChange={(e) => setNewUnit(prev => ({ ...prev, email: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Horário</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.operatingHours} onChange={(e) => setNewUnit(prev => ({ ...prev, operatingHours: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsUnitDialogOpen(false)} className="w-full sm:w-auto rounded-xl">Cancelar</Button>
                    <Button onClick={handleAddUnit} className="w-full sm:w-auto rounded-xl shadow-lg">Salvar Unidade</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="hidden sm:table-cell">Contato</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id} className="group hover:bg-muted/30">
                        <TableCell className="font-bold text-sm">
                          <div className="flex flex-col">
                            <span>{unit.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black">{unit.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{unit.managerName || "Não definido"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-[10px] text-muted-foreground">{unit.phone || unit.email || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs Content Omitted for brevity as they are unchanged */}
        <TabsContent value="drivers" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div>
                <CardTitle>Corpo de Motoristas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gestão de condutores e habilitações.</CardDescription>
              </div>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md">
                    <Plus className="h-4 w-4" /> Novo Motorista
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{newDriver.id ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="driver-name">Nome Completo</Label>
                      <Input id="driver-name" className="h-12 rounded-xl" value={newDriver.name} onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-license">CNH / Habilitação</Label>
                      <Input id="driver-license" className="h-12 rounded-xl" value={newDriver.license} onChange={(e) => setNewDriver(prev => ({ ...prev, license: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-phone">Telefone</Label>
                      <Input id="driver-phone" className="h-12 rounded-xl" value={newDriver.phone} onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleAddDriver}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-bold">{d.name}</TableCell>
                      <TableCell><Badge className="text-[10px] rounded-full px-2">{d.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setNewDriver(d); setIsDriverDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div><CardTitle>Frota Municipal</CardTitle></div>
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md"><Plus className="h-4 w-4" /> Novo Veículo</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl">
                  <DialogHeader><DialogTitle>Veículo</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Placa</Label><Input className="h-11 rounded-xl" value={newVehicle.licensePlate} onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))} /></div>
                      <div className="grid gap-2"><Label>Tipo</Label><Input className="h-11 rounded-xl" value={newVehicle.type} onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value as any }))} /></div>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleAddVehicle}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Placa</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-sm font-bold">{v.plate}</TableCell>
                      <TableCell className="text-sm font-medium">{v.type}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setNewVehicle({ id: v.id, licensePlate: v.plate, type: v.type as any, capacity: v.capacity }); setIsVehicleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div><CardTitle>Usuários</CardTitle></div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-xl"><Plus className="h-4 w-4" /> Novo Usuário</Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nome</Label><Input value={newUser.name} onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} /></div>
                    <div className="grid gap-2"><Label>E-mail</Label><Input value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddUser}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Papel</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}><TableCell className="text-sm font-bold">{u.name}</TableCell><TableCell>{getRoleBadge(u.role)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setNewUser(u); setIsUserDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4 sm:space-y-6 outline-none">
          <Card className="border-none shadow-sm bg-primary/5 rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-primary/10 p-4 sm:p-6"><CardTitle>Segurança</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-6"><Button className="w-full h-12" variant="outline">Salvar Políticas</Button></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
