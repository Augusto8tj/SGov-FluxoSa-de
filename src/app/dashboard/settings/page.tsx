
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
  Globe,
  Database,
  RefreshCw,
  Lock,
  Trophy,
  Play,
  FileJson,
  Check
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
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Ultra Rápido)" },
  { id: "google/gemma-2-9b-it:free", name: "Google Gemma 2 9B" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
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

  // Real Data States
  const [units, setUnits] = useState<UBS[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Arena State
  const [arenaRunning, setArenaRunning] = useState(false);
  const [arenaResults, setArenaResults] = useState<any[]>([]);

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
    setLoadingInitial(true);
    try {
      // Carregamento individual para evitar que uma falha trave tudo
      const uData = await ubsService.getUnits().catch(() => []);
      const dData = await driverService.getDrivers().catch(() => []);
      const vData = await vehicleService.getVehicles().catch(() => []);
      const sData = await systemSettingsService.getSettings();
      
      setUnits(uData);
      setDrivers(dData);
      setVehicles(vData);
      setSettings(sData);
    } catch (e) {
      console.error("Settings: Critical error during load", e);
    } finally {
      setLoadingInitial(false);
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
      toast({ variant: "destructive", title: "Erro Técnico", description: "Não foi possível conectar ao Ollama local." });
    } finally {
      setIsSyncingModels(false);
    }
  };

  const handleRunArena = async () => {
    setArenaRunning(true);
    setArenaResults([]);
    const results = [];
    
    for (const model of AI_MODELS) {
      try {
        const res = await runModelTest("Responda apenas 'OK'", model.id);
        results.push({
          name: model.name,
          id: model.id,
          latency: res.latency,
          status: res.error ? 'ERROR' : 'SUCCESS',
          error: res.error
        });
      } catch (err: any) {
        results.push({ name: model.name, id: model.id, latency: 0, status: 'ERROR', error: err.message });
      }
      setArenaResults([...results]);
    }
    setArenaRunning(false);
    toast({ title: "Torneio Finalizado", description: "O ranking de eficiência foi atualizado." });
  };

  const handleExportJson = () => {
    const diagnostic = {
      reportId: `DIAG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      municipalEntity: "Prefeitura de Rio Claro - RJ",
      department: "Secretaria de Ordem Pública",
      systemContext: {
        activeModel: settings?.aiModelId,
        environment: "BETA_PRODUCTION"
      },
      diagnostics: {
        totalModelsTested: AI_MODELS.length,
        successfulRequests: arenaResults.filter(r => r.status === 'SUCCESS').length,
        failedRequests: arenaResults.filter(r => r.status === 'ERROR').length,
      },
      rawResults: arenaResults
    };

    const blob = new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostico-ia-rioclaro-${Date.now()}.json`;
    link.click();
  };

  const handleAddUnit = async () => {
    try {
      if (newUnit.id) {
        await ubsService.updateUnit(newUnit.id, newUnit);
      } else {
        await ubsService.addUnit(newUnit as any);
      }
      setIsUnitDialogOpen(false);
      loadData();
      toast({ title: "Sucesso", description: "Unidade salva no Firestore." });
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar unidade." });
    }
  };

  const handleAddDriver = async () => {
    try {
      if (newDriver.id) {
        await driverService.updateDriver(newDriver.id, newDriver);
      } else {
        await driverService.addDriver({ ...newDriver, available: true, status: 'AVAILABLE' } as any);
      }
      setIsDriverDialogOpen(false);
      loadData();
      toast({ title: "Sucesso", description: "Motorista cadastrado." });
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar motorista." });
    }
  };

  const handleAddVehicle = async () => {
    try {
      if (newVehicle.id) {
        await vehicleService.updateVehicle(newVehicle.id, newVehicle);
      } else {
        await vehicleService.addVehicle({ ...newVehicle, available: true } as any);
      }
      setIsVehicleDialogOpen(false);
      loadData();
      toast({ title: "Sucesso", description: "Veículo adicionado à frota." });
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar veículo." });
    }
  };

  if (!mounted || loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Sincronizando Gabinete...</p>
      </div>
    );
  }

  if (!settings) return null;

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
            
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg">
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

                  {settings.aiProvider === 'OLLAMA' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ollama Base URL</Label>
                        <Input 
                          placeholder="http://localhost:11434" 
                          className="h-12 rounded-2xl bg-muted/20 border-none"
                          value={settings.ollamaBaseUrl || ""}
                          onChange={(e) => setSettings({...settings, ollamaBaseUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Peso Selecionado</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={settings.aiModelId} 
                            onValueChange={(val) => setSettings({...settings, aiModelId: val})}
                          >
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none flex-1">
                              <SelectValue placeholder="Sincronize modelos..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {localModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl"
                            onClick={handleSyncOllama}
                            disabled={isSyncingModels}
                          >
                            <RefreshCw className={cn("h-4 w-4", isSyncingModels && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settings.aiProvider !== 'OLLAMA' && (
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
                    className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    Persistir Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Privacidade Rio Claro</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Protocolo PII Masking Ativo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl italic text-xs text-slate-300">
                  &quot;Toda informação enviada ao motor de IA passa por uma camada de filtragem que mascara dados sensíveis dos cidadãos.&quot;
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase">Filtragem de CPF</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase">Filtragem de Email</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2.5 rounded-2xl text-white shadow-lg">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Arena SGov: Ranking de IA</CardTitle>
                  <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Benchmark Municipal de Performance</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase"
                   onClick={handleExportJson}
                   disabled={arenaResults.length === 0}
                 >
                   <FileJson className="h-4 w-4" /> Diagnóstico JSON
                 </Button>
                 <Button 
                   className="h-10 rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg"
                   onClick={handleRunArena}
                   disabled={arenaRunning}
                 >
                   {arenaRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                   {arenaRunning ? "Testando..." : "Iniciar Torneio"}
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                   <Zap className="h-5 w-5 text-amber-500" />
                 </div>
                 <p className="text-xs text-amber-800 font-medium leading-tight">
                   Esta arena testa a latência real de todos os modelos gratuitos do OpenRouter contra o servidor de Rio Claro.
                 </p>
               </div>
               <div className="overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-none">
                        <TableHead className="font-bold pl-8 text-[10px] uppercase tracking-widest">Posição</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Modelo de Inteligência</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Latência (ms)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right pr-8 font-bold text-[10px] uppercase tracking-widest">Eficiência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {arenaResults.length > 0 ? (
                         [...arenaResults].sort((a,b) => a.latency - b.latency).map((res, idx) => (
                           <TableRow key={res.id} className="hover:bg-primary/5 transition-colors">
                             <TableCell className="pl-8">
                               <Badge className={cn(
                                 "border-none font-black text-[10px]",
                                 idx === 0 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-600"
                               )}>
                                 #{idx + 1}
                               </Badge>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <span className="font-bold text-sm">{res.name}</span>
                                 {res.id === SYSTEM_DEFAULT_MODEL && <Badge className="bg-primary/10 text-primary text-[8px] h-4">PADRÃO</Badge>}
                               </div>
                             </TableCell>
                             <TableCell className="font-mono text-xs font-black">
                               {res.status === 'SUCCESS' ? `${res.latency} ms` : "---"}
                             </TableCell>
                             <TableCell>
                               <Badge className={cn(
                                 "border-none text-[8px] font-black uppercase",
                                 res.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                               )}>
                                 {res.status === 'SUCCESS' ? 'Excelente' : 'Falha'}
                               </Badge>
                             </TableCell>
                             <TableCell className="text-right pr-8">
                               {res.status === 'SUCCESS' && (
                                 <div className="inline-flex items-center gap-2">
                                   <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(10, 100 - (res.latency / 10))}%` }} />
                                   </div>
                                 </div>
                               )}
                             </TableCell>
                           </TableRow>
                         ))
                       ) : (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic text-xs uppercase tracking-widest">
                             Clique em &quot;Iniciar Torneio&quot; para medir a performance
                           </TableCell>
                         </TableRow>
                       )}
                    </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
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
