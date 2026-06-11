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
  UserCheck,
  BrainCircuit,
  Zap,
  Loader2,
  Activity,
  Gauge,
  Code,
  AlertCircle,
  Bug,
  Play,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  BarChart3
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- IA MODELS LIST ---
const AI_MODELS = [
  { id: "nvidia/llama-nemotron-rerank-vl-1b-v2:free", name: "Llama Nemotron Rerank VL 1B (Free)" },
  { id: "nex-agi/nex-n2-pro:free", name: "Nex AGI: Nex-N2-Pro (Free)" },
  { id: "sourceful/riverflow-v2.5-pro", name: "Riverflow v2.5 Pro" },
  { id: "nvidia/nemotron-3.5-content-safety:free", name: "Nvidia Nemotron 3.5 Safety (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (OpenRouter)" },
  { id: "google/gemini-2.0-flash-lite-preview-02-05:free", name: "Gemini 2.0 Flash Lite (Free)" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B (Estável)" },
  { id: "openrouter/free", name: "OpenRouter Free Router (Dinâmico)" },
];

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
  
  // --- IA LAB STATE ---
  const [aiModel, setAiModel] = useState("google/gemini-2.0-flash-lite-preview-02-05:free");
  const [aiTestPrompt, setAiTestPrompt] = useState("Dê um resumo das metas de saúde pública específicas para o município de Rio Claro, Rio de Janeiro (RJ) para 2024.");
  const [testResult, setTestResult] = useState<ModelTesterOutput | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState<(ModelTesterOutput & { modelName: string })[]>([]);
  const [activeDebugTab, setActiveDebugTab] = useState("response");

  // --- ENTITIES STATE ---
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

  // --- IA LAB HANDLERS ---
  const handleTestAi = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const result = await runModelTest(aiTestPrompt, aiModel);
      setTestResult(result);
      if (result.error) {
        toast({ variant: "destructive", title: "Erro no Modelo", description: "O modelo retornou um erro. Verifique os dados brutos." });
      } else {
        toast({ title: "Análise Concluída", description: `Latência de ${result.latency}ms.` });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha no Laboratório", description: error.message || "Erro inesperado." });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsBatchTesting(true);
    setBatchResults([]);
    toast({ title: "Benchmarking", description: "Testando todos os modelos do laboratório..." });
    
    const results = [];
    for (const model of AI_MODELS) {
      try {
        const result = await runModelTest(aiTestPrompt, model.id);
        results.push({ ...result, modelName: model.name });
        setBatchResults([...results]);
      } catch (e) {
        results.push({ content: "Erro", latency: 0, actualModel: model.id, modelName: model.name, error: "Falha" });
        setBatchResults([...results]);
      }
    }
    setIsBatchTesting(false);
    toast({ title: "Concluído", description: "Ranking de performance gerado." });
  };

  const rankedResults = [...batchResults].sort((a, b) => {
    if (a.error && !b.error) return 1;
    if (!a.error && b.error) return -1;
    return a.latency - b.latency;
  });

  // --- ENTITIES HANDLERS ---
  const handleSave = (module: string) => {
    toast({ title: "Alterações Salvas", description: `As configurações de ${module} foram atualizadas.` });
  };

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) return;
    if (newUnit.id) {
      setUnits(prev => prev.map(u => u.id === newUnit.id ? { ...u, name: newUnit.name, address: newUnit.address } : u));
    } else {
      setUnits(prev => [...prev, { id: `UBS-0${units.length + 1}`, name: newUnit.name, address: newUnit.address, status: "Ativo" }]);
    }
    setIsUnitDialogOpen(false);
    setNewUnit({ id: "", name: "", address: "" });
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
    if (!newVehicle.plate) return;
    if (newVehicle.id) {
      setVehicles(prev => prev.map(v => v.id === newVehicle.id ? { ...v, plate: newVehicle.plate.toUpperCase(), type: newVehicle.type as any, capacity: newVehicle.capacity } : v));
    } else {
      setVehicles(prev => [...prev, { id: `V${vehicles.length + 1}`, plate: newVehicle.plate.toUpperCase(), type: newVehicle.type as any, capacity: newVehicle.capacity, status: "Operacional", available: true }]);
    }
    setIsVehicleDialogOpen(false);
    setNewVehicle({ id: "", plate: "", type: "Ambulância", capacity: 1 });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    if (newUser.id) {
      setUsers(prev => prev.map(u => u.id === newUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role as any } : u));
    } else {
      setUsers(prev => [...prev, { id: `U${users.length + 1}`, name: newUser.name, email: newUser.email, role: newUser.role as any }]);
    }
    setIsUserDialogOpen(false);
    setNewUser({ id: "", name: "", email: "", role: "UBS_MANAGER" });
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Gestão administrativa e Laboratório de IA - Rio Claro, RJ.</p>
        </div>
      </div>

      <Tabs defaultValue="ia-lab" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-900 border p-1 h-12 shadow-sm w-full md:w-auto overflow-x-auto justify-start no-scrollbar">
          <TabsTrigger value="ia-lab" className="gap-2 px-4 h-10"><BrainCircuit className="h-4 w-4" /> Laboratório IA</TabsTrigger>
          <TabsTrigger value="units" className="gap-2 px-4 h-10"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-4 h-10"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2 px-4 h-10"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
          <TabsTrigger value="users" className="gap-2 px-4 h-10"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2 px-4 h-10"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
        </TabsList>

        {/* --- TABS CONTENT: IA LABORATORY --- */}
        <TabsContent value="ia-lab" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg"><Zap className="h-5 w-5 text-primary" /></div>
                    <div>
                      <CardTitle>Configuração OpenRouter</CardTitle>
                      <CardDescription>Compare modelos Nvidia, Claude e outros.</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRunAllTests} disabled={isBatchTesting || isTestingAi} className="gap-2 text-[10px] font-bold uppercase">
                    {isBatchTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                    Benchmarking
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Modelo de IA</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Prompt de Teste</Label>
                  <Textarea className="min-h-[100px] resize-none" value={aiTestPrompt} onChange={(e) => setAiTestPrompt(e.target.value)} />
                </div>
                <Button className="w-full h-11 uppercase text-xs font-bold gap-2" onClick={handleTestAi} disabled={isTestingAi || isBatchTesting}>
                  {isTestingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  Executar Teste Cloud
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm h-full overflow-hidden flex flex-col">
              <CardHeader className="bg-primary/5 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" /> Telemetria & Debug
                  </CardTitle>
                  {testResult && <Badge variant={testResult.error ? "destructive" : "outline"} className="text-[10px]">{testResult.latency}ms</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <Tabs value={activeDebugTab} onValueChange={setActiveDebugTab}>
                  <TabsList className="bg-transparent border-b rounded-none w-full justify-start px-4 h-10">
                    <TabsTrigger value="response" className="text-[10px] font-bold uppercase">Resposta</TabsTrigger>
                    <TabsTrigger value="raw" className="text-[10px] font-bold uppercase gap-1"><Code className="h-3 w-3" /> Bruto</TabsTrigger>
                  </TabsList>
                  <div className="p-4 overflow-y-auto max-h-[300px]">
                    <TabsContent value="response">
                      {testResult ? (
                        <div className={cn("p-4 rounded-lg text-sm border", testResult.error ? "bg-destructive/10 text-destructive" : "bg-muted/30")}>
                          {testResult.error && <p className="font-bold uppercase text-[10px] mb-1">ERRO:</p>}
                          {testResult.error || testResult.content}
                        </div>
                      ) : <div className="text-center py-10 opacity-30 uppercase text-[10px] font-bold">Aguardando Execução</div>}
                    </TabsContent>
                    <TabsContent value="raw">
                      {testResult?.rawResponse ? (
                        <pre className="p-4 bg-slate-950 text-emerald-400 rounded-lg text-[10px] font-mono overflow-x-auto">
                          {JSON.stringify(testResult.rawResponse, null, 2)}
                        </pre>
                      ) : <div className="text-center py-10 opacity-30 uppercase text-[10px] font-bold">Sem dados brutos</div>}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {(batchResults.length > 0 || isBatchTesting) && (
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Ranking de Performance</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Latência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedResults.map((result, idx) => (
                      <TableRow key={result.actualModel} className={cn(result.error && "opacity-50")}>
                        <TableCell className="text-center font-bold">
                          {idx < 3 && !result.error ? <Trophy className={cn("h-4 w-4 mx-auto", idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : "text-amber-700")} /> : idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col"><span className="font-bold text-sm">{result.modelName}</span><span className="text-[9px] text-muted-foreground uppercase">{result.actualModel}</span></div>
                        </TableCell>
                        <TableCell>{result.error ? <Badge variant="destructive">ERRO</Badge> : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">OK</Badge>}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{result.latency}ms</TableCell>
                      </TableRow>
                    ))}
                    {isBatchTesting && rankedResults.length < AI_MODELS.length && (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground animate-pulse">Processando {rankedResults.length + 1} de {AI_MODELS.length}...</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
                    <DialogDescription>Atualize os dados do ponto de atendimento em Rio Claro - RJ.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit-name">Nome da UBS</Label>
                      <Input id="unit-name" value={newUnit.name} onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit-address">Endereço</Label>
                      <Input id="unit-address" value={newUnit.address} onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))} />
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
                        <Button variant="ghost" size="icon" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
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
                <CardDescription>Gestão de condutores e habilitações.</CardDescription>
              </div>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => setNewDriver({ id: "", name: "", license: "", phone: "" })}><Plus className="h-4 w-4" /> Novo Motorista</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Cadastro de Motorista</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nome</Label><Input value={newDriver.name} onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))} /></div>
                    <div className="grid gap-2"><Label>CNH / Vencimento</Label><Input value={newDriver.license} onChange={(e) => setNewDriver(prev => ({ ...prev, license: e.target.value }))} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddDriver}>Salvar Motorista</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>CNH</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}><TableCell>{d.name}</TableCell><TableCell>{d.license}</TableCell><TableCell><Badge>{d.status}</Badge></TableCell></TableRow>
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
                <CardTitle>Frota Municipal</CardTitle>
                <CardDescription>Gestão técnica dos veículos.</CardDescription>
              </div>
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Novo Veículo</Button></DialogTrigger>
                <DialogContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Placa</Label><Input value={newVehicle.plate} onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value }))} /></div>
                    <div className="grid gap-2"><Label>Tipo</Label><Input value={newVehicle.type} onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value as any }))} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddVehicle}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Placa</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.map(v => (<TableRow key={v.id}><TableCell className="font-mono">{v.plate}</TableCell><TableCell>{v.type}</TableCell><TableCell><Badge>{v.status}</Badge></TableCell></TableRow>))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Usuários do Sistema</CardTitle><CardDescription>Gestão de acessos.</CardDescription></div>
              <Button className="gap-2" onClick={() => setIsUserDialogOpen(true)}><Plus className="h-4 w-4" /> Novo Usuário</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Papel</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(u => (<TableRow key={u.id}><TableCell>{u.name}</TableCell><TableCell>{getRoleBadge(u.role)}</TableCell></TableRow>))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader><CardTitle>Segurança e Auditoria</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border">
                <div><p className="text-sm font-bold">Autenticação 2FA</p><p className="text-xs text-muted-foreground">Obrigatória para admins.</p></div>
                <Badge className="bg-emerald-100 text-emerald-700">ATIVO</Badge>
              </div>
              <Button className="w-full" onClick={() => handleSave("Segurança")}>Salvar Políticas</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
