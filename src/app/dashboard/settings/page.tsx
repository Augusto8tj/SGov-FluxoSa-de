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
  Activity, 
  Gauge,
  Code,
  AlertCircle,
  Play,
  Trophy,
  Timer,
  FileJson,
  Download
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

// Lista atualizada com modelos estáveis e verificados (OpenRouter Free)
const AI_MODELS = [
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2 (Padrão do Sistema)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Ultra Rápido)" },
  { id: "meta-llama/llama-3.1-70b-instruct:free", name: "Llama 3.1 70B (Alta Precisão)" },
  { id: "google/gemma-2-9b-it:free", name: "Google Gemma 2 9B (Estável)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Versátil)" },
  { id: "qwen/qwen-2-7b-instruct:free", name: "Qwen 2 7B (Rápido)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini 128k (Leve)" },
];

type ArenaResult = {
  id: string;
  name: string;
  latency: number;
  status: 'idle' | 'testing' | 'success' | 'error';
  error?: string;
  timestamp?: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // IA Lab State
  const [aiModel, setAiModel] = useState(SYSTEM_DEFAULT_MODEL);
  const [aiTestPrompt, setAiTestPrompt] = useState("Analise a prioridade de transporte: Paciente em hemodiálise saindo de Lídice para o Hospital Municipal.");
  const [testResult, setTestResult] = useState<ModelTesterOutput | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [activeDebugTab, setActiveDebugTab] = useState("response");

  // Arena State
  const [arenaResults, setArenaResults] = useState<ArenaResult[]>(
    AI_MODELS.map(m => ({ id: m.id, name: m.name, latency: 0, status: 'idle' }))
  );
  const [isArenaTesting, setIsArenaTesting] = useState(false);

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
      const [uData, dData, vData] = await Promise.all([
        ubsService.getUnits(),
        driverService.getDrivers(),
        vehicleService.getVehicles()
      ]);
      setUnits(uData);
      setDrivers(dData);
      setVehicles(vData);
    } catch (e) {
      console.error("Settings: Error loading DB", e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Sincroniza a Arena se a lista de modelos mudar
  useEffect(() => {
    if (mounted) {
      setArenaResults(prev => {
        return AI_MODELS.map(m => {
          const existing = prev.find(r => r.id === m.id);
          return existing || { id: m.id, name: m.name, latency: 0, status: 'idle' };
        });
      });
    }
  }, [mounted]);

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

  const handleRunArena = async () => {
    setIsArenaTesting(true);
    setArenaResults(prev => prev.map(r => ({ ...r, status: 'idle', latency: 0, error: undefined })));
    
    toast({ title: "Arena Iniciada", description: "Iniciando benchmarking de velocidade sequencial." });

    for (const model of AI_MODELS) {
      setArenaResults(prev => prev.map(r => r.id === model.id ? { ...r, status: 'testing' } : r));
      
      try {
        const result = await runModelTest("Responda apenas 'OK'", model.id);
        
        setArenaResults(prev => prev.map(r => r.id === model.id ? { 
          ...r, 
          status: result.error ? 'error' : 'success', 
          latency: result.latency,
          error: result.error,
          timestamp: new Date().toISOString()
        } : r));
      } catch (err) {
        setArenaResults(prev => prev.map(r => r.id === model.id ? { ...r, status: 'error', error: "Timeout", timestamp: new Date().toISOString() } : r));
      }
    }

    setIsArenaTesting(false);
    toast({ title: "Arena Finalizada", description: "O ranking de performance foi atualizado." });
  };

  const handleDownloadReport = () => {
    const fastest = sortedArena.find(r => r.status === 'success');
    const report = {
      reportId: `DIAG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      municipalEntity: "Prefeitura de Rio Claro - RJ",
      department: "Secretaria de Ordem Pública",
      systemContext: {
        activeModel: aiModel,
        environment: "BETA_PRODUCTION"
      },
      diagnostics: {
        totalModelsTested: arenaResults.length,
        successfulRequests: arenaResults.filter(r => r.status === 'success').length,
        failedRequests: arenaResults.filter(r => r.status === 'error').length,
        fastestModel: fastest ? {
          name: fastest.name,
          id: fastest.id,
          latency: fastest.latency
        } : "NONE_SUCCESSFUL"
      },
      rawResults: arenaResults.map(r => ({
        modelName: r.name,
        modelId: r.id,
        latencyMs: r.latency,
        status: r.status,
        failureReason: r.error || null,
        testedAt: r.timestamp || "N/A"
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SGov-AI-Diagnostic-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Relatório Gerado", description: "O arquivo JSON foi baixado para análise técnica." });
  };

  const sortedArena = useMemo(() => {
    return [...arenaResults].sort((a, b) => {
      if (a.status === 'success' && b.status === 'success') return a.latency - b.latency;
      if (a.status === 'success') return -1;
      if (b.status === 'success') return 1;
      return 0;
    });
  }, [arenaResults]);

  const handleAddUnit = async () => {
    if (!newUnit.name || !newUnit.address) return;
    try {
      if (newUnit.id) {
        await ubsService.updateUnit(newUnit.id, newUnit);
      } else {
        await ubsService.addUnit({
          name: newUnit.name,
          address: newUnit.address,
          managerName: newUnit.managerName,
          phone: newUnit.phone,
          email: newUnit.email,
          operatingHours: newUnit.operatingHours,
          type: newUnit.type as any,
          status: 'active',
          location: { lat: -22.72, lng: -44.13 }
        });
      }
      setIsUnitDialogOpen(false);
      loadData();
      toast({ title: "Unidade Salva", description: "Base de dados atualizada." });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.licenseNumber) return;
    try {
      if (newDriver.id) {
        await driverService.updateDriver(newDriver.id, newDriver);
      } else {
        await driverService.addDriver({
          name: newDriver.name || "",
          licenseNumber: newDriver.licenseNumber || "",
          phone: newDriver.phone,
          available: true,
          status: 'AVAILABLE'
        });
      }
      setIsDriverDialogOpen(false);
      loadData();
      toast({ title: "Motorista Salvo", description: "Base de dados atualizada." });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.licensePlate) return;
    try {
      if (newVehicle.id) {
        await vehicleService.updateVehicle(newVehicle.id, newVehicle);
      } else {
        await vehicleService.addVehicle({
          licensePlate: newVehicle.licensePlate.toUpperCase(),
          type: newVehicle.type as any,
          capacity: newVehicle.capacity || 1,
          available: true,
          status: 'AVAILABLE',
          odometer: newVehicle.odometer || 0,
          fuelLevel: 100
        });
      }
      setIsVehicleDialogOpen(false);
      loadData();
      toast({ title: "Veículo Salvo", description: "Base de dados atualizada." });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
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
            <TabsTrigger value="profiles" className="gap-2 px-4 sm:px-6 h-11 sm:h-10 w-full sm:w-auto justify-start sm:justify-center whitespace-nowrap rounded-xl sm:rounded-lg transition-all"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
          </TabsList>
        </div>

        {/* IA LAB CONTENT */}
        <TabsContent value="ia-lab" className="space-y-4 sm:space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-none shadow-sm h-full flex flex-col rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b bg-muted/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0"><Zap className="h-5 w-5 text-primary" /></div>
                    <div>
                      <CardTitle className="text-lg">Configuração OpenRouter</CardTitle>
                      <CardDescription className="text-xs">Explore os modelos gratuitos disponíveis.</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Modelo de IA Ativo</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-muted-foreground/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
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
                <div className="flex gap-2 mt-auto">
                   <Button 
                    className="flex-1 h-10 sm:h-12 rounded-xl uppercase text-[10px] sm:text-xs font-bold gap-2 shadow-lg shadow-primary/10" 
                    onClick={handleTestAi} 
                    disabled={isTestingAi}
                  >
                    {isTestingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                    Executar Teste Cloud
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-h-[350px] overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-primary/5 py-4 shrink-0 border-b px-4 sm:p-6">
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

          {/* Arena Block */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden mt-6 bg-white">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Arena SGov: Velocidade & Performance</CardTitle>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Ranking em Tempo Real de Rio Claro</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl gap-2"
                    onClick={handleDownloadReport}
                    disabled={arenaResults.every(r => r.status === 'idle')}
                  >
                    <FileJson className="h-4 w-4" /> Relatório Diagnóstico
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-amber-500 hover:bg-amber-600 border-none text-slate-900 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg px-6 gap-2"
                    onClick={handleRunArena}
                    disabled={isArenaTesting}
                  >
                    {isArenaTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-slate-900" />}
                    {isArenaTesting ? "Benchmarking..." : "Iniciar Arena"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="w-16 text-center font-black uppercase text-[10px] text-slate-400">#</TableHead>
                      <TableHead className="font-black uppercase text-[10px] text-slate-400">Modelo Cloud</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px] text-slate-400">Latência (ms)</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px] text-slate-400 pr-8">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedArena.map((res, idx) => (
                      <TableRow key={res.id} className={cn("transition-colors", idx === 0 && res.latency > 0 ? "bg-emerald-50/50" : "hover:bg-slate-50/50")}>
                        <TableCell className="text-center font-black text-slate-400">
                          {res.latency > 0 && idx === 0 ? <Trophy className="h-4 w-4 text-amber-500 mx-auto" /> : idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700">{res.name}</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-medium">{res.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {res.status === 'testing' ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto text-primary" />
                          ) : res.latency > 0 ? (
                            <span className={cn("font-mono font-black", idx === 0 ? "text-emerald-600" : "text-slate-600")}>
                              {res.latency}ms
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold uppercase">---</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          {res.status === 'success' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase h-6 px-3">OTIMIZADO</Badge>
                          ) : res.status === 'error' ? (
                            <Badge variant="destructive" className="font-black text-[9px] uppercase h-6 px-3">FALHA</Badge>
                          ) : res.status === 'testing' ? (
                            <Badge variant="outline" className="animate-pulse border-primary/20 text-primary font-black text-[9px] uppercase h-6 px-3">ANALISANDO</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-300 border-slate-200 font-black text-[9px] uppercase h-6 px-3">AGUARDANDO</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Timer className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic max-w-2xl">
                      * O benchmark envia uma requisição 'ping' sequencial. Utilize o botão **Relatório Diagnóstico** acima para obter os dados brutos e motivos detalhados de falha técnica em modelos específicos.
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Nota: Modelos gratuitos possuem limites de requisições por dia definidos pelo OpenRouter.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UNIDADES CONTENT */}
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
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Nome</Label><Input value={newUnit.name} onChange={e => setNewUnit(p => ({...p, name: e.target.value}))} /></div>
                      <div className="grid gap-2"><Label>Tipo</Label><Input value={newUnit.type} onChange={e => setNewUnit(p => ({...p, type: e.target.value as any}))} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Endereço</Label><Input value={newUnit.address} onChange={e => setNewUnit(p => ({...p, address: e.target.value}))} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddUnit}>Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {units.map(unit => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-bold text-sm">{unit.name}</TableCell>
                        <TableCell className="text-xs">{unit.managerName || "Não definido"}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
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
              <div><CardTitle>Corpo de Motoristas</CardTitle></div>
              <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-xl shadow-md"><Plus className="h-4 w-4" /> Novo Motorista</Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>Nome Completo</Label><Input value={newDriver.name} onChange={e => setNewDriver(p => ({...p, name: e.target.value}))} /></div>
                    <div className="grid gap-2"><Label>CNH</Label><Input value={newDriver.licenseNumber} onChange={e => setNewDriver(p => ({...p, licenseNumber: e.target.value}))} /></div>
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
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setNewDriver(d); setIsDriverDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
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
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-xl shadow-md"><Plus className="h-4 w-4" /> Novo Veículo</Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Placa</Label><Input value={newVehicle.licensePlate} onChange={e => setNewVehicle(p => ({...p, licensePlate: e.target.value}))} /></div>
                      <div className="grid gap-2"><Label>Capacidade</Label><Input type="number" value={newVehicle.capacity} onChange={e => setNewVehicle(p => ({...p, capacity: parseInt(e.target.value)}))} /></div>
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
                      <TableCell className="font-mono text-sm font-bold">{v.licensePlate}</TableCell>
                      <TableCell className="text-sm font-medium">{v.type}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setNewVehicle(v); setIsVehicleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4 sm:space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-primary/10 p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl text-white shadow-lg"><ShieldCheck className="h-5 w-5" /></div>
                  <div><CardTitle className="text-base">Secretário de Saúde</CardTitle></div>
                </div>
              </CardHeader>
              <CardContent className="p-5">Acesso total à malha viária e inteligência estratégica.</CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-emerald-50 p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 p-2 rounded-xl text-white"><Hospital className="h-5 w-5" /></div>
                  <div><CardTitle className="text-base">Gerente de UBS</CardTitle></div>
                </div>
              </CardHeader>
              <CardContent className="p-5">Gestão local de pacientes e demandas de transporte.</CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
