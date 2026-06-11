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
  Edit,
  Key,
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
import { UserRole } from "@/lib/types";

const AI_MODELS = [
  { id: "google/gemini-2.0-flash-lite-preview-02-05:free", name: "Gemini 2.0 Flash Lite (Free)" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "nvidia/llama-nemotron-rerank-vl-1b-v2:free", name: "Llama Nemotron Rerank (Free)" },
  { id: "nex-agi/nex-n2-pro:free", name: "Nex AGI Pro (Free)" },
  { id: "sourceful/riverflow-v2.5-pro", name: "Riverflow v2.5 Pro" },
  { id: "nvidia/nemotron-3.5-content-safety:free", name: "Nvidia Safety Classifier" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B" },
  { id: "openrouter/free", name: "OpenRouter Free" },
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
  
  const [aiModel, setAiModel] = useState("google/gemini-2.0-flash-lite-preview-02-05:free");
  const [aiTestPrompt, setAiTestPrompt] = useState("Dê um resumo das metas de saúde pública específicas para o município de Rio Claro, Rio de Janeiro (RJ) para 2024.");
  const [testResult, setTestResult] = useState<ModelTesterOutput | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState<(ModelTesterOutput & { modelName: string })[]>([]);
  const [activeDebugTab, setActiveDebugTab] = useState("response");

  const [units, setUnits] = useState(initialUnits);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [users, setUsers] = useState(initialUsers);
  
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ id: "", name: "", address: "" });
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ id: "", name: "", license: "", phone: "" });
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ id: "", plate: "", type: "Ambulância" as 'Ambulância' | 'Van' | 'Sedan' | 'Acessível', capacity: 1 });
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
      } catch {
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

  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.address) return;
    if (newUnit.id) {
      setUnits(prev => prev.map(u => u.id === newUnit.id ? { ...u, name: newUnit.name, address: newUnit.address } : u));
    } else {
      setUnits(prev => [...prev, { id: `UBS-0${units.length + 1}`, name: newUnit.name, address: newUnit.address, status: "Ativo" }]);
    }
    setIsUnitDialogOpen(false);
    setNewUnit({ id: "", name: "", address: "" });
    toast({ title: "Unidade Salva", description: "Dados da UBS atualizados com sucesso." });
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
    toast({ title: "Motorista Salvo", description: "O registro do condutor foi processado." });
  };

  const handleAddVehicle = () => {
    if (!newVehicle.plate) return;
    if (newVehicle.id) {
      setVehicles(prev => prev.map(v => v.id === newVehicle.id ? { ...v, plate: newVehicle.plate.toUpperCase(), type: newVehicle.type, capacity: newVehicle.capacity } : v));
    } else {
      setVehicles(prev => [...prev, { id: `V${vehicles.length + 1}`, plate: newVehicle.plate.toUpperCase(), type: newVehicle.type, capacity: newVehicle.capacity, status: "Operacional" as const }]);
    }
    setIsVehicleDialogOpen(false);
    setNewVehicle({ id: "", plate: "", type: "Ambulância", capacity: 1 });
    toast({ title: "Frota Atualizada", description: "O veículo foi registrado na malha municipal." });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    if (newUser.id) {
      setUsers(prev => prev.map(u => u.id === newUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role } : u));
    } else {
      setUsers(prev => [...prev, { id: `U${users.length + 1}`, name: newUser.name, email: newUser.email, role: newUser.role }]);
    }
    setIsUserDialogOpen(false);
    setNewUser({ id: "", name: "", email: "", role: "UBS_MANAGER" });
    toast({ title: "Usuário Salvo", description: "Permissões de acesso configuradas." });
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
            <TabsTrigger value="ia-lab" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><BrainCircuit className="h-4 w-4" /> Laboratório IA</TabsTrigger>
            <TabsTrigger value="units" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
            <TabsTrigger value="fleet" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg data-[state=active]:shadow-sm transition-all"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
          </TabsList>
        </div>

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
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Modelo de IA</Label>
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

          {(batchResults.length > 0 || isBatchTesting) && (
            <Card className="border-none shadow-sm animate-in fade-in slide-in-from-bottom-2 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-6 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Ranking de Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto no-scrollbar">
                  <Table>
                    <TableHeader className="bg-muted/50 sm:bg-transparent">
                      <TableRow>
                        <TableHead className="w-12 text-center">Pos</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead className="hidden xs:table-cell">Status</TableHead>
                        <TableHead className="text-right">Latência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankedResults.map((result, idx) => (
                        <TableRow key={result.actualModel} className={cn(result.error && "opacity-50", "group")}>
                          <TableCell className="text-center font-bold">
                            {idx < 3 && !result.error ? (
                              <Trophy className={cn("h-4 w-4 mx-auto", idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : "text-amber-700")} />
                            ) : idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm truncate max-w-[140px] sm:max-w-none">{result.modelName}</span>
                              <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[100px] sm:max-w-none">{result.actualModel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xs:table-cell">
                            {result.error ? <Badge variant="destructive" className="rounded-full text-[9px] h-5">ERRO</Badge> : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-[9px] h-5">OK</Badge>}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs whitespace-nowrap tabular-nums">
                            {result.latency}ms
                          </TableCell>
                        </TableRow>
                      ))}
                      {isBatchTesting && rankedResults.length < AI_MODELS.length && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground animate-pulse font-medium">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              Testando {rankedResults.length + 1} de {AI_MODELS.length}...
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
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
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md" onClick={() => setNewUnit({ id: "", name: "", address: "" })}>
                    <Plus className="h-4 w-4" /> Adicionar UBS
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{newUnit.id ? "Editar Unidade" : "Nova Unidade de Saúde"}</DialogTitle>
                    <DialogDescription className="text-xs">Atualize os dados do ponto de atendimento em Rio Claro - RJ.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit-name">Nome da UBS</Label>
                      <Input id="unit-name" className="h-12 rounded-xl" value={newUnit.name} onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit-address">Endereço</Label>
                      <Input id="unit-address" className="h-12 rounded-xl" value={newUnit.address} onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))} />
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
                      <TableHead className="hidden sm:table-cell">Endereço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id} className="group hover:bg-muted/30">
                        <TableCell className="font-bold text-sm">{unit.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{unit.address}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px] rounded-full px-2">{unit.status}</Badge></TableCell>
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

        <TabsContent value="drivers" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div>
                <CardTitle>Corpo de Motoristas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gestão de condutores e habilitações.</CardDescription>
              </div>
              
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md" onClick={() => setNewDriver({ id: "", name: "", license: "", phone: "" })}>
                    <Plus className="h-4 w-4" /> Novo Motorista
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{newDriver.id ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
                    <DialogDescription className="text-xs">Registre um novo condutor no sistema municipal.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="driver-name">Nome Completo</Label>
                      <Input id="driver-name" className="h-12 rounded-xl" value={newDriver.name} onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-license">CNH / Habilitação</Label>
                      <Input id="driver-license" className="h-12 rounded-xl" placeholder="Cat. D - Validade" value={newDriver.license} onChange={(e) => setNewDriver(prev => ({ ...prev, license: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="driver-phone">Telefone de Contato</Label>
                      <Input id="driver-phone" className="h-12 rounded-xl" placeholder="(00) 00000-0000" value={newDriver.phone} onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsDriverDialogOpen(false)} className="w-full sm:w-auto rounded-xl">Cancelar</Button>
                    <Button onClick={handleAddDriver} className="w-full sm:w-auto rounded-xl shadow-lg">Salvar Motorista</Button>
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
                      <TableHead className="hidden xs:table-cell">CNH</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map(d => (
                      <TableRow key={d.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-bold">{d.name}</TableCell>
                        <TableCell className="hidden xs:table-cell text-xs text-muted-foreground">{d.license}</TableCell>
                        <TableCell><Badge className="text-[10px] whitespace-nowrap rounded-full px-2">{d.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setNewDriver(d); setIsDriverDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div>
                <CardTitle>Frota Municipal</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gestão técnica dos veículos.</CardDescription>
              </div>
              
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md" onClick={() => setNewVehicle({ id: "", plate: "", type: "Ambulância", capacity: 1 })}>
                    <Plus className="h-4 w-4" /> Novo Veículo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{newVehicle.id ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
                    <DialogDescription className="text-xs">Registre um novo veículo na frota sanitária.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="v-plate">Placa</Label>
                      <Input id="v-plate" className="h-12 rounded-xl" placeholder="AAA-0000" value={newVehicle.plate} onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Tipo</Label>
                        <Select value={newVehicle.type} onValueChange={(val) => setNewVehicle(prev => ({ ...prev, type: val as any }))}>
                          <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ambulância">Ambulância</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="Acessível">Acessível</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="v-cap">Vagas</Label>
                        <Input id="v-cap" type="number" className="h-12 rounded-xl" value={newVehicle.capacity} onChange={(e) => setNewVehicle(prev => ({ ...prev, capacity: parseInt(e.target.value) }))} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsVehicleDialogOpen(false)} className="w-full sm:w-auto rounded-xl">Cancelar</Button>
                    <Button onClick={handleAddVehicle} className="w-full sm:w-auto rounded-xl shadow-lg">Salvar Veículo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map(v => (
                      <TableRow key={v.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm font-bold">{v.plate}</TableCell>
                        <TableCell className="text-sm font-medium">{v.type}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px] rounded-full px-2">{v.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setNewVehicle(v); setIsVehicleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b bg-muted/5">
              <div><CardTitle>Usuários do Sistema</CardTitle><CardDescription className="text-xs sm:text-sm">Gestão de acessos.</CardDescription></div>
              
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-xl shadow-md" onClick={() => setNewUser({ id: "", name: "", email: "", role: "UBS_MANAGER" })}>
                    <Plus className="h-4 w-4" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{newUser.id ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                    <DialogDescription className="text-xs">Configure as credenciais e o papel do colaborador.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="u-name">Nome</Label>
                      <Input id="u-name" className="h-12 rounded-xl" value={newUser.name} onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="u-email">E-mail</Label>
                      <Input id="u-email" type="email" className="h-12 rounded-xl" value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Papel / Role</Label>
                      <Select value={newUser.role} onValueChange={(val) => setNewUser(prev => ({ ...prev, role: val as any }))}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SECRETARY">Secretário</SelectItem>
                          <SelectItem value="UBS_MANAGER">Gerente UBS</SelectItem>
                          <SelectItem value="DRIVER">Motorista</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)} className="w-full sm:w-auto rounded-xl">Cancelar</Button>
                    <Button onClick={handleAddUser} className="w-full sm:w-auto rounded-xl shadow-lg">Salvar Usuário</Button>
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
                      <TableHead>Papel</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm font-bold">{u.name}</TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setNewUser(u); setIsUserDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4 sm:space-y-6 outline-none">
          <Card className="border-none shadow-sm bg-primary/5 rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-primary/10 p-4 sm:p-6">
              <CardTitle className="text-lg">Segurança e Auditoria</CardTitle>
              <CardDescription className="text-xs">Políticas de acesso institucional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 p-4 sm:p-6">
              <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm group hover:border-primary/30 transition-all">
                <div className="space-y-0.5">
                  <p className="text-sm font-black">Autenticação 2FA</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Obrigatória para administrativos</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full h-6 px-3">ATIVO</Badge>
              </div>
              <Button className="w-full h-12 font-bold uppercase text-xs rounded-xl shadow-lg shadow-primary/5" variant="outline">Salvar Políticas Globais</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}