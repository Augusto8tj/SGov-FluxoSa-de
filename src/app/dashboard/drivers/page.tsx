"use client";

import React, { useState, useEffect } from "react";
import { 
  UserRoundCheck, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  ShieldAlert, 
  Coins, 
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  ThumbsUp,
  X,
  Check,
  Printer,
  Info
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
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

const MOCK_FINANCIAL_REQUESTS = [
  { id: "REQ-F1", driver: "Carlos Alberto Silva", type: "DIÁRIA", value: "R$ 150,00", reason: "Viagem Intermunicipal (Rio de Janeiro)", date: "12/06/2024", status: "PENDING" },
  { id: "REQ-F2", driver: "Marcos Pereira", type: "COMBUSTÍVEL", value: "R$ 340,50", reason: "Abastecimento Emergencial V2", date: "12/06/2024", status: "PENDING" },
  { id: "REQ-F3", driver: "Ricardo Oliveira", type: "DIÁRIA", value: "R$ 150,00", reason: "Plantão Estendido UBS Lídice", date: "11/06/2024", status: "APPROVED" },
];

const MOCK_DRIVERS_FULL = [
  { id: "D1", name: "Carlos Alberto Silva", license: "Cat. D", licenseExpiry: "20/05/2026", status: "ON_ROUTE", tripsToday: 8, rating: 4.9, phone: "(24) 99123-4567" },
  { id: "D2", name: "Marcos Pereira", license: "Cat. D", licenseExpiry: "15/02/2025", status: "AVAILABLE", tripsToday: 4, rating: 4.8, phone: "(24) 98765-4321" },
  { id: "D3", name: "Ricardo Oliveira", license: "Cat. D", licenseExpiry: "02/07/2024", status: "OFF_DUTY", tripsToday: 0, rating: 4.7, phone: "(24) 99988-7766" },
];

export default function DriversManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [financials, setFinancials] = useState(MOCK_FINANCIAL_REQUESTS);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFinancialAction = (id: string, action: 'APPROVED' | 'DENIED') => {
    setFinancials(prev => prev.map(f => f.id === id ? { ...f, status: action } : f));
    toast({
      title: action === 'APPROVED' ? "Solicitação Aprovada" : "Solicitação Negada",
      description: `O registro ${id} foi processado e enviado para o financeiro.`,
      variant: action === 'DENIED' ? "destructive" : "default"
    });
  };

  const handlePrintRequest = (req: any) => {
    const type = req.type === 'DIÁRIA' ? 'daily' : 'fuel';
    const params = new URLSearchParams({
      type,
      id: req.id,
      driver: req.driver,
      value: req.value,
      date: req.date
    });
    router.push(`/dashboard/print?${params.toString()}`);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <UserRoundCheck className="h-8 w-8" /> Gestão de Condutores
          </h2>
          <p className="text-muted-foreground text-sm">Controle de pessoal, financeiro e conformidade técnica.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2 shadow-sm">
                <CalendarIcon className="h-4 w-4" /> Escala Mensal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-5 sm:p-6 text-white shrink-0">
                <DialogHeader className="text-left space-y-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 sm:p-2.5 rounded-2xl">
                      <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">Escala de Plantão</DialogTitle>
                      <DialogDescription className="text-primary-foreground/70 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white">
                        Gestão de Disponibilidade & bull; PMRC
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 bg-white max-h-[75vh] overflow-y-auto no-scrollbar">
                {/* Lado Esquerdo: Calendário */}
                <div className="w-full flex-1 flex flex-col items-center gap-4">
                  <div className="w-full border rounded-[2rem] p-4 sm:p-6 shadow-inner bg-slate-50 flex flex-col items-center">
                    <div className="text-center mb-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Selecione uma Data</p>
                      <p className="text-sm font-bold text-slate-600">
                        {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : "Carregando..."}
                      </p>
                    </div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={ptBR}
                      className="rounded-xl border bg-white shadow-sm"
                    />
                  </div>
                </div>
                
                {/* Lado Direito: Detalhes da Escala */}
                <div className="w-full md:w-[300px] space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Info className="h-4 w-4 text-primary" /> 
                      Plantão: {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione"}
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-medium px-1 italic">Condutores escalados para a malha viária.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between group hover:bg-emerald-100 transition-colors cursor-pointer shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-900">Carlos Alberto</span>
                        <span className="text-[8px] font-bold text-emerald-600 uppercase">Viatura V1 - Ambulância</span>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-[8px] uppercase border-none h-5 px-2 shrink-0">Titular</Badge>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between group hover:bg-blue-100 transition-colors cursor-pointer shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-900">Marcos Pereira</span>
                        <span className="text-[8px] font-bold text-blue-600 uppercase">Viatura V2 - Van</span>
                      </div>
                      <Badge className="bg-blue-600 text-white text-[8px] uppercase border-none h-5 px-2 shrink-0">Apoio</Badge>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between opacity-50 grayscale">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">Ricardo Oliveira</span>
                        <span className="text-[8px] font-medium text-slate-400 uppercase">Indisponível</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] uppercase border-slate-300 h-5 px-2 shrink-0">Folga</Badge>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-dashed border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert className="h-3 w-3 text-amber-600" />
                      <p className="text-[9px] font-black text-amber-800 uppercase">Protocolo Municipal</p>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                      O descanso obrigatório de 12/36h é monitorado automaticamente para viagens intermunicipais.
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-4 bg-slate-50 border-t shrink-0">
                <Button className="w-full rounded-2xl uppercase text-[10px] font-black tracking-widest h-12 shadow-lg" onClick={() => setIsScheduleOpen(false)}>
                  Confirmar Consulta de Escala
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="h-11 rounded-xl gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Novo Motorista
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Ativos hoje" value="18" icon={CheckCircle2} description="Em operação" />
        <StatsCard title="Diárias Pendentes" value={financials.filter(f => f.status === 'PENDING').length} icon={Coins} description="Aguardando Gabinete" />
        <StatsCard title="Vencimento CNH" value="2" icon={ShieldAlert} description="Próximos 30 dias" className="border-b-4 border-b-rose-500" />
        <StatsCard title="Score Médio" value="4.8" icon={Award} description="Avaliação IA" />
      </div>

      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar justify-start">
          <TabsTrigger value="roster" className="rounded-lg gap-2 whitespace-nowrap">Corpo de Condutores</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-lg gap-2 whitespace-nowrap">
            Solicitações Financeiras 
            {financials.filter(f => f.status === 'PENDING').length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 bg-primary text-white border-none">{financials.filter(f => f.status === 'PENDING').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg gap-2 whitespace-nowrap">Produtividade & IA</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-6 outline-none">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, telefone ou CNH..." 
                className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-none">
                    <TableHead className="font-bold">Motorista</TableHead>
                    <TableHead className="font-bold">Habilitação (CNH)</TableHead>
                    <TableHead className="font-bold">Status Atual</TableHead>
                    <TableHead className="font-bold">Viagens/Dia</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_DRIVERS_FULL.filter(d => 
                    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    d.phone.includes(searchTerm)
                  ).map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {driver.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700">{driver.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{driver.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-600">{driver.license}</span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tighter",
                            new Date(driver.licenseExpiry.split('/').reverse().join('-')) < new Date(Date.now() + 30*24*60*60*1000) 
                              ? "text-rose-500" : "text-muted-foreground"
                          )}>
                            Venc: {driver.licenseExpiry}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-2 h-5 border-none",
                          driver.status === 'ON_ROUTE' ? "bg-blue-100 text-blue-700" : 
                          driver.status === 'AVAILABLE' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {driver.status === 'ON_ROUTE' ? 'Em Rota' : driver.status === 'AVAILABLE' ? 'Disponível' : 'Fora de Serviço'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-sm font-bold text-slate-700">{driver.tripsToday}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest px-1">Solicitações Pendentes</h3>
              {financials.map((req) => (
                <Card key={req.id} className="border-none shadow-sm overflow-hidden bg-card group hover:shadow-md transition-all rounded-2xl">
                  <div className="flex flex-col sm:flex-row">
                    <div className={cn(
                      "w-full sm:w-2 px-4 sm:px-0",
                      req.status === 'APPROVED' ? "bg-emerald-500" : req.type === 'DIÁRIA' ? "bg-primary" : "bg-amber-500"
                    )} />
                    <CardContent className="p-5 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] font-black border-slate-200">{req.type}</Badge>
                            <span className="text-[10px] text-muted-foreground font-bold">{req.date}</span>
                            {req.status === 'APPROVED' && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] uppercase">Aprovado</Badge>}
                          </div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{req.driver}</p>
                          <p className="text-xs text-slate-500 font-medium italic">&quot;{req.reason}&quot;</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</p>
                            <p className="text-lg font-black text-primary">{req.value}</p>
                          </div>
                          <div className="flex gap-2">
                            {req.status === 'PENDING' ? (
                              <>
                                <Button 
                                  size="icon" 
                                  className="h-10 w-10 rounded-xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100"
                                  onClick={() => handleFinancialAction(req.id, 'DENIED')}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                                  onClick={() => handleFinancialAction(req.id, 'APPROVED')}
                                >
                                  <Check className="h-5 w-5" />
                                </Button>
                              </>
                            ) : req.status === 'APPROVED' ? (
                              <Button 
                                variant="outline" 
                                className="h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/20 text-primary"
                                onClick={() => handlePrintRequest(req)}
                              >
                                <Printer className="h-4 w-4" /> Imprimir Guia
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-md rounded-2xl bg-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Coins className="h-24 w-24" /></div>
                <CardHeader>
                  <CardTitle className="text-lg font-black uppercase tracking-tighter">Budget Diárias</CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-xs">Mês de Junho/2024</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                      <span>Consumido</span>
                      <span>R$ 4.500,00</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[65%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-5 bg-amber-50 rounded-2xl border border-dashed border-amber-200">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Printer className="h-4 w-4" /> Auditoria de Guias
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Após imprimir a guia física, colha a assinatura do motorista e anexe ao relatório mensal para fins de prestação de contas.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-5 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Ranking de Conduta (IA)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {MOCK_DRIVERS_FULL.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-400">#{d.id}</span>
                      <span className="text-sm font-bold text-slate-700">{d.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Award key={i} className={cn("h-3 w-3", i <= Math.floor(d.rating) ? "text-primary fill-primary" : "text-slate-200")} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-primary">{d.rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-emerald-50 p-5 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" /> Clima Operacional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="text-center py-10 space-y-2">
                  <p className="text-3xl font-black text-emerald-600">98%</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Satisfação dos Pacientes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}