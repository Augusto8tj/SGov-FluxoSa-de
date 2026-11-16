
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Hospital, 
  User, 
  Ambulance, 
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
  Timer,
  FileJson,
  Globe,
  Database,
  RefreshCw,
  Lock
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
import { Vehicle, UBS, Driver } from "@/lib/types";
import { ubsService } from "@/services/ubs-service";
import { driverService } from "@/services/driver-service";
import { vehicleService } from "@/services/vehicle-service";
import { SYSTEM_DEFAULT_MODEL } from "@/ai/constants";
import { systemSettingsService, SystemSettings } from "@/services/system-settings-service";
import { checkAiConnection } from "@/ai/flows/diagnostics";

const AI_MODELS = [
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2 (Padrão)" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Ultra Rápido)" },
  { id: "google/gemma-2-9b-it:free", name: "Google Gemma 2 9B" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // AI Settings State
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [isSyncingModels, setIsSyncingModels] = useState(false);

  // IA Lab State
  const [aiModel, setAiModel] = useState(SYSTEM_DEFAULT_MODEL);
  const [aiTestPrompt, setAiTestPrompt] = useState("Analise a prioridade de transporte: Paciente em hemodiálise saindo de Lídice para o Hospital Municipal.");
  const [testResult, setTestResult] = useState<ModelTesterOutput | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [activeDebugTab, setActiveDebugTab] = useState("response");

  // Real Data States
  const [units, setUnits] = useState<UBS[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Dialog States
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UBS>>({ 
    name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: 'UBS' 
  });
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({ name: "", licenseNumber: "", phone: "" });
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ 
    licensePlate: "", type: "Ambulância", capacity: 1, status: "AVAILABLE", odometer: 0, fuelLevel: 100 
  });

  const loadData = useCallback(async () => {
    try {
      const [uData, dData, vData, sData] = await Promise.all([
        ubsService.getUnits(),
        driverService.getDrivers(),
        vehicleService.getVehicles(),
        systemSettingsService.getSettings()
      ]);
      setUnits(uData);
      setDrivers(dData);
      setVehicles(vData);
      setSettings(sData);
    } catch (e) {
      console.error("Settings: Error loading DB", e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      await systemSettingsService.updateSettings(settings);
      toast({ title: "Configurações Salvas", description: "O motor híbrido foi atualizado com sucesso." });
    } catch {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Falha na persistência do Firestore." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSyncOllama = async () => {
    if (!settings?.ollamaBaseUrl) {
      toast({ variant: "destructive", title: "Ação Necessária", description: "Informe a URL do servidor Ollama primeiro." });
      return;
    }
    setIsSyncingModels(true);
    try {
      const result = await checkAiConnection();
      if (result.status === 'online' && result.models) {
        setLocalModels(result.models);
        toast({ title: "Sincronização Concluída", description: `Detectados ${result.models.length} modelos locais.` });
      } else {
        toast({ variant: "destructive", title: "Falha na Conexão", description: result.error || "Ollama não respondeu." });
      }
    } catch {
      toast({ variant: "destructive", title: "Erro Técnico", description: "Verifique o gateway (ngrok/tunnel)." });
    } finally {
      setIsSyncingModels(false);
    }
  };

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

  if (!mounted || !settings) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Painel Administrativo</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Configurações de infraestrutura e motor de IA Híbrido.</p>
      </div>

      <Tabs defaultValue="ia-hybrid" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-white border p-2 h-auto flex flex-col sm:flex-row sm:h-12 shadow-sm rounded-2xl gap-1 overflow-hidden">
          <TabsTrigger value="ia-hybrid" className="gap-2 px-6"><BrainCircuit className="h-4 w-4" /> Motor Híbrido</TabsTrigger>
          <TabsTrigger value="units" className="gap-2 px-6"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-6"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2 px-6"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
        </TabsList>

        <TabsContent value="ia-hybrid" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gateway de IA */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Gateway de Inteligência</CardTitle>
                    <CardDescription className="text-xs">Defina o provedor ativo para Rio Claro.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Provedor de Serviço</Label>
                    <Select 
                      value={settings.aiProvider} 
                      onValueChange={(val) => setSettings({...settings, aiProvider: val as any})}
                    >
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="OPENROUTER">OpenRouter (Cloud)</SelectItem>
                        <SelectItem value="GOOGLE">Google Gemini (Cloud)</SelectItem>
                        <SelectItem value="OLLAMA">Ollama (Servidor Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.aiProvider === 'OLLAMA' ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ollama Base URL (Local/Tunnel)</Label>
                        <Input 
                          placeholder="http://localhost:11434 ou https://ngrok-url..." 
                          className="h-12 rounded-2xl bg-muted/20 border-none"
                          value={settings.ollamaBaseUrl || ""}
                          onChange={(e) => setSettings({...settings, ollamaBaseUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Token de Acesso (Bearer)</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password"
                            placeholder="Chave secreta do gateway..." 
                            className="h-12 rounded-2xl bg-muted/20 border-none pl-10"
                            value={settings.ollamaApiKey || ""}
                            onChange={(e) => setSettings({...settings, ollamaApiKey: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Peso Selecionado</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={settings.aiModelId} 
                            onValueChange={(val) => setSettings({...settings, aiModelId: val})}
                          >
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none flex-1">
                              <SelectValue placeholder="Selecione um modelo local..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {localModels.length > 0 ? (
                                localModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)
                              ) : (
                                <SelectItem value="default" disabled>Sincronize para ver modelos</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl border-dashed"
                            onClick={handleSyncOllama}
                            disabled={isSyncingModels}
                          >
                            <RefreshCw className={cn("h-4 w-4", isSyncingModels && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modelo Cloud Ativo</Label>
                      <Select 
                        value={settings.aiModelId} 
                        onValueChange={(val) => setSettings({...settings, aiModelId: val})}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {AI_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    className="w-full h-12 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest gap-2 mt-2"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    Persistir Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Protocolo de Segurança */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Privacidade Rio Claro</CardTitle>
                    <CardDescription className="text-slate-400 text-xs uppercase font-bold tracking-widest">Protocolo PII Masking Ativo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 italic text-xs leading-relaxed text-slate-300">
                  &quot;Toda informação enviada ao motor de IA passa por uma camada de filtragem regex que mascara CPFs, E-mails e Identidades, garantindo que o processamento logístico ocorra sem exposição de dados sensíveis.&quot;
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase">Filtragem de CPF</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase">Filtragem de Email</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* IA Lab (Benchmark) mantido e atualizado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm h-full flex flex-col rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b bg-muted/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0"><Zap className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-lg">Laboratório de Testes</CardTitle>
                    <CardDescription className="text-xs">Valide a lógica antes da produção.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Prompt de Simulação</Label>
                  <Textarea 
                    className="min-h-[140px] resize-none text-sm rounded-2xl bg-muted/20 border-none focus:ring-primary/20" 
                    value={aiTestPrompt} 
                    onChange={(e) => setAiTestPrompt(e.target.value)} 
                  />
                </div>
                <Button 
                  className="w-full h-12 rounded-2xl uppercase text-[10px] font-black gap-2 shadow-lg" 
                  onClick={handleTestAi} 
                  disabled={isTestingAi}
                >
                  {isTestingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  Executar Teste Cloud
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-h-[350px] overflow-hidden flex flex-col rounded-3xl bg-muted/5">
              <CardHeader className="bg-primary/5 py-4 border-b px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase flex items-center gap-2 tracking-tighter">
                    <Gauge className="h-4 w-4 text-primary" /> Telemetria de Debug
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={activeDebugTab} onValueChange={setActiveDebugTab} className="space-y-4">
                  <TabsList className="bg-white border rounded-xl p-1">
                    <TabsTrigger value="response" className="rounded-lg text-[10px] font-black">RESPOSTA</TabsTrigger>
                    <TabsTrigger value="raw" className="rounded-lg text-[10px] font-black">DADOS BRUTOS</TabsTrigger>
                  </TabsList>
                  <TabsContent value="response">
                    {testResult ? (
                      <div className="p-5 rounded-2xl text-sm border bg-white whitespace-pre-wrap leading-relaxed shadow-inner italic text-slate-600">
                        {testResult.error || testResult.content}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <BrainCircuit className="h-10 w-10 mb-2" />
                        <p className="uppercase text-[10px] font-black tracking-widest">Aguardando Teste</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Unidades de Saúde (UBS)</CardTitle>
                <CardDescription className="text-xs">Gestão da rede municipal de Rio Claro.</CardDescription>
              </div>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-2xl shadow-md">
                    <Plus className="h-4 w-4" /> Adicionar UBS
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle>{newUnit.id ? "Editar Unidade" : "Nova Unidade de Saúde"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Nome</Label><Input className="rounded-xl" value={newUnit.name} onChange={e => setNewUnit(p => ({...p, name: e.target.value}))} /></div>
                      <div className="grid gap-2"><Label>Tipo</Label><Input className="rounded-xl" value={newUnit.type} onChange={e => setNewUnit(p => ({...p, type: e.target.value as any}))} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Endereço</Label><Input className="rounded-xl" value={newUnit.address} onChange={e => setNewUnit(p => ({...p, address: e.target.value}))} /></div>
                  </div>
                  <DialogFooter><Button className="rounded-xl" onClick={handleAddUnit}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Nome</TableHead><TableHead className="font-bold">Responsável</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {units.map(unit => (
                    <TableRow key={unit.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-bold text-sm pl-8">{unit.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{unit.managerName || "Não definido"}</TableCell>
                      <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div><CardTitle className="text-xl font-black uppercase tracking-tight">Corpo de Motoristas</CardTitle></div>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-2xl shadow-md"><Plus className="h-4 w-4" /> Novo Motorista</Button></DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nome Completo</Label><Input className="rounded-xl" value={newDriver.name} onChange={e => setNewDriver(p => ({...p, name: e.target.value}))} /></div>
                    <div className="grid gap-2"><Label>CNH</Label><Input className="rounded-xl" value={newDriver.licenseNumber} onChange={e => setNewDriver(p => ({...p, licenseNumber: e.target.value}))} /></div>
                  </div>
                  <DialogFooter><Button className="rounded-xl" onClick={handleAddDriver}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Nome</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-bold pl-8">{d.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] rounded-lg px-2 border-primary/20 text-primary">{d.status}</Badge></TableCell>
                      <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewDriver(d); setIsDriverDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div><CardTitle className="text-xl font-black uppercase tracking-tight">Frota Municipal</CardTitle></div>
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-2xl shadow-md"><Plus className="h-4 w-4" /> Novo Veículo</Button></DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Placa</Label><Input className="rounded-xl" value={newVehicle.licensePlate} onChange={e => setNewVehicle(p => ({...p, licensePlate: e.target.value}))} /></div>
                      <div className="grid gap-2"><Label>Capacidade</Label><Input className="rounded-xl" type="number" value={newVehicle.capacity} onChange={e => setNewVehicle(p => ({...p, capacity: parseInt(e.target.value)}))} /></div>
                    </div>
                  </div>
                  <DialogFooter><Button className="rounded-xl" onClick={handleAddVehicle}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Placa</TableHead><TableHead className="font-bold">Tipo</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-sm font-bold pl-8 uppercase">{v.licensePlate}</TableCell>
                      <TableCell className="text-sm font-medium">{v.type}</TableCell>
                      <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewVehicle(v); setIsVehicleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
