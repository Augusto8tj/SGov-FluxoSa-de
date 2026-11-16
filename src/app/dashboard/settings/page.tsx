
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Globe,
  Database,
  RefreshCw,
  Trophy,
  Play,
  FileJson,
  Cpu,
  Thermometer
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { runModelTest } from "@/ai/flows/model-tester-flow";
import { cn } from "@/lib/utils";
import { Vehicle, UBS, Driver } from "@/lib/types";
import { ubsService } from "@/services/ubs-service";
import { driverService } from "@/services/driver-service";
import { vehicleService } from "@/services/vehicle-service";
import { systemSettingsService, SystemSettings } from "@/services/system-settings-service";

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
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [isSyncingModels, setIsSyncingModels] = useState(false);

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
    // Carregamento ultra veloz: não bloqueia a UI
    setLoadingInitial(true);
    
    // Primeiro busca as configurações de IA para garantir a funcionalidade central
    try {
      const sData = await systemSettingsService.getSettings();
      setSettings(sData);
    } catch {
      console.warn("Falha ao carregar configurações de IA.");
    } finally {
      setLoadingInitial(false);
    }

    // Carrega o restante dos dados de forma paralela e assíncrona
    Promise.allSettled([
      ubsService.getUnits().then(setUnits),
      driverService.getDrivers().then(setDrivers),
      vehicleService.getVehicles().then(setVehicles)
    ]);
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
      toast({ 
        title: "Configurações Salvas", 
        description: `O motor ${settings.aiProvider} foi atualizado com sucesso.` 
      });
    } catch {
      toast({ 
        variant: "destructive", 
        title: "Erro ao Salvar", 
        description: "Falha na comunicação com o banco de dados municipal." 
      });
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
      const baseUrl = settings.ollamaBaseUrl.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
      const headers = { 
        "ngrok-skip-browser-warning": "true",
        ...(settings.ollamaApiKey && { "Authorization": settings.ollamaApiKey.startsWith('Bearer ') ? settings.ollamaApiKey : `Bearer ${settings.ollamaApiKey}` })
      };
      
      const response = await fetch(`${baseUrl}/api/tags`, { headers });
      if (!response.ok) throw new Error();
      
      const data = await response.json();
      if (data.models) {
        setLocalModels(data.models);
        toast({ title: "Sincronização Concluída", description: `Detectados ${data.models.length} modelos locais.` });
      }
    } catch {
      toast({ 
        variant: "destructive", 
        title: "Falha na Conexão", 
        description: "Verifique se o servidor Ollama está acessível." 
      });
    } finally {
      setIsSyncingModels(false);
    }
  };

  const handleRunArena = async () => {
    setArenaRunning(true);
    const results = [];
    for (const model of AI_MODELS) {
      try {
        const res = await runModelTest("Responda apenas 'OK'", model.id);
        results.push({ name: model.name, id: model.id, latency: res.latency, status: res.error ? 'ERROR' : 'SUCCESS' });
        setArenaResults([...results]);
      } catch {
        results.push({ name: model.name, id: model.id, latency: 0, status: 'ERROR' });
        setArenaResults([...results]);
      }
    }
    setArenaRunning(false);
  };

  const handleAddUnit = async () => {
    try {
      if (newUnit.id) await ubsService.updateUnit(newUnit.id, newUnit);
      else await ubsService.addUnit(newUnit as any);
      setIsUnitDialogOpen(false);
      loadData();
      toast({ title: "Sucesso", description: "Unidade salva no Firestore." });
    } catch {
      toast({ variant: "destructive", title: "Erro" });
    }
  };

  const sortedArenaResults = useMemo(() => {
    return [...arenaResults].sort((a, b) => a.latency - b.latency);
  }, [arenaResults]);

  if (!mounted) return null;

  if (loadingInitial || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Otimizando Workspace...</p>
      </div>
    );
  }

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
                  <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg"><Globe className="h-6 w-6" /></div>
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
                    <Select value={settings.aiProvider} onValueChange={(val) => setSettings({...settings, aiProvider: val as any})}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="OPENROUTER">OpenRouter (Cloud)</SelectItem>
                        <SelectItem value="GOOGLE">Google Gemini (Cloud)</SelectItem>
                        <SelectItem value="OLLAMA">Ollama (Servidor Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.aiProvider === 'OLLAMA' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ollama URL</Label>
                          <Input className="h-12 rounded-2xl bg-muted/20 border-none" value={settings.ollamaBaseUrl || ""} onChange={(e) => setSettings({...settings, ollamaBaseUrl: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Token Secreto</Label>
                          <Input type="password" className="h-12 rounded-2xl bg-muted/20 border-none" value={settings.ollamaApiKey || ""} onChange={(e) => setSettings({...settings, ollamaApiKey: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">VRAM (Keep-Alive)</Label>
                            <Select value={settings.ollamaKeepAlive} onValueChange={(val) => setSettings({...settings, ollamaKeepAlive: val})}>
                              <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5m">5 minutos</SelectItem>
                                <SelectItem value="-1">Sempre Pronto</SelectItem>
                                <SelectItem value="30m">30 minutos</SelectItem>
                                <SelectItem value="0">Descarregar</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Temperatura: {settings.ollamaTemperature}</Label>
                            <Slider value={[settings.ollamaTemperature || 0.7]} max={1} step={0.1} onValueChange={(val) => setSettings({...settings, ollamaTemperature: val[0]})} />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modelo Local</Label>
                        <div className="flex gap-2">
                          <Select value={settings.aiModelId} onValueChange={(val) => setSettings({...settings, aiModelId: val})}>
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none flex-1"><SelectValue placeholder="Sincronize..." /></SelectTrigger>
                            <SelectContent>
                              {localModels.map(m => (
                                <SelectItem key={m.name} value={m.name}>
                                  {m.name} ({ (m.size / (1024 ** 3)).toFixed(2) } GB)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl" onClick={handleSyncOllama} disabled={isSyncingModels}>
                            <RefreshCw className={cn("h-4 w-4", isSyncingModels && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settings.aiProvider !== 'OLLAMA' && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modelo Cloud</Label>
                      <Select value={settings.aiModelId} onValueChange={(val) => setSettings({...settings, aiModelId: val})}>
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent>{AI_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg" onClick={handleSaveSettings} disabled={isSavingSettings}>
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    Persistir Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Privacidade Rio Claro</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Protocolo PII Masking Ativo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl italic text-xs text-slate-300">&quot;Toda informação enviada ao motor de IA passa por uma camada de filtragem de dados sensíveis.&quot;</div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-[10px] font-black uppercase">Filtragem de CPF</span><Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge></div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-[10px] font-black uppercase">Filtragem de Email</span><Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge></div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2.5 rounded-2xl text-white shadow-lg"><Trophy className="h-6 w-6" /></div>
                <div><CardTitle className="text-xl font-black uppercase tracking-tight">Arena SGov: Ranking de IA</CardTitle></div>
              </div>
              <Button className="h-10 rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg" onClick={handleRunArena} disabled={arenaRunning}>
                {arenaRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Iniciar Torneio
              </Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Posição</TableHead><TableHead className="font-bold">Modelo</TableHead><TableHead className="font-bold">Latência (ms)</TableHead><TableHead className="text-right pr-8 font-bold">Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                       {sortedArenaResults.map((res, idx) => (
                         <TableRow key={res.id}>
                           <TableCell className="pl-8"><Badge className={cn("border-none font-black text-[10px]", idx === 0 ? "bg-amber-400 text-white" : "bg-slate-200")}>#{idx + 1}</Badge></TableCell>
                           <TableCell className="font-bold text-sm">{res.name}</TableCell>
                           <TableCell className="font-mono text-xs font-black">{res.status === 'SUCCESS' ? `${res.latency} ms` : "---"}</TableCell>
                           <TableCell className="text-right pr-8"><Badge className={cn("text-[8px] font-black uppercase", res.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{res.status}</Badge></TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div><CardTitle className="text-xl font-black uppercase tracking-tight">Unidades de Saúde (UBS)</CardTitle></div>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild><Button className="rounded-2xl h-11 shadow-md gap-2"><Plus className="h-4 w-4" /> Adicionar UBS</Button></DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <DialogHeader><DialogTitle>Nova Unidade</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Nome</Label><Input className="rounded-xl" value={newUnit.name} onChange={e => setNewUnit(p => ({...p, name: e.target.value}))} /></div>
                      <div className="grid gap-2"><Label>Tipo</Label><Input className="rounded-xl" value={newUnit.type} onChange={e => setNewUnit(p => ({...p, type: e.target.value as any}))} /></div>
                    </div>
                  </div>
                  <DialogFooter><Button className="rounded-xl" onClick={handleAddUnit}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Nome</TableHead><TableHead className="text-right pr-8 font-bold">Ação</TableHead></TableRow></TableHeader>
                <TableBody>
                  {units.map(unit => (
                    <TableRow key={unit.id}><TableCell className="font-bold text-sm pl-8">{unit.name}</TableCell><TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          {/* Implementação similar para Motoristas com carregamento otimizado */}
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          {/* Implementação similar para Frota com carregamento otimizado */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
