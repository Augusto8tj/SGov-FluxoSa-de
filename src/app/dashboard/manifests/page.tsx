
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Route, 
  Search, 
  MapPin, 
  Clock, 
  Loader2, 
  Ambulance, 
  User, 
  ShieldCheck,
  Filter,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TransportRequest } from "@/lib/types";
import { requestService } from "@/services/request-service";

export default function GlobalManifestsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [manifests, setManifests] = useState<TransportRequest[]>([]);
  const { toast } = useToast();

  const loadManifests = useCallback(async () => {
    setLoading(true);
    try {
      const allRequests = await requestService.getRequests();
      // O Secretário vê todos os registros que possuem manifesto ID
      const activeManifests = allRequests.filter(r => r.manifestId);
      setManifests(activeManifests);
    } catch {
      toast({ title: "Erro de Sincronização", description: "Falha ao carregar dados reais da malha viária.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadManifests();
  }, [loadManifests]);

  const filteredManifests = manifests.filter(m => 
    m.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.manifestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.driverId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Navigation className="h-8 w-8" /> Gestão de Manifestos
          </h2>
          <p className="text-muted-foreground text-sm">Supervisão global da malha viária e escalas de Rio Claro.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={loadManifests}>
            <Clock className="h-4 w-4" /> Atualizar Frota
          </Button>
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg" asChild>
            <a href="/dashboard/routes">
              <Route className="h-4 w-4" /> Novo Planejamento
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-none shadow-sm bg-blue-50 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Manifestos Ativos</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-blue-700">{Array.from(new Set(manifests.map(m => m.manifestId))).length}</p>
            <Ambulance className="h-4 w-4 mb-2 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Pacientes em Rota</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-emerald-700">{manifests.filter(m => m.status === 'APPROVED').length}</p>
            <Users className="h-4 w-4 mb-2 text-emerald-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-indigo-50 border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Viaturas Escalas</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-indigo-700">{Array.from(new Set(manifests.map(m => m.vehicleId))).length}</p>
            <ShieldCheck className="h-4 w-4 mb-2 text-indigo-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-slate-50 border-l-4 border-l-slate-500">
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Concluídos Hoje</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-slate-700">{manifests.filter(m => m.status === 'COMPLETED').length}</p>
            <CheckCircle2 className="h-4 w-4 mb-2 text-slate-400" />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por viatura, condutor ou ID do manifesto..." 
            className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Malha Viária...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Manifesto / Viatura</TableHead>
                  <TableHead className="font-bold">Condutor Escalado</TableHead>
                  <TableHead className="font-bold">Paciente & Destino</TableHead>
                  <TableHead className="font-bold">Data & Hora</TableHead>
                  <TableHead className="text-right font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManifests.length > 0 ? (
                  filteredManifests.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10 group transition-colors">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] h-6 px-3 w-fit">
                            {item.manifestId}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <Ambulance className="h-3 w-3" /> {item.vehicleId || "Viatura Local"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{item.driverId || "Plantão Logística"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-black text-xs text-slate-800 uppercase">{item.patientName}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                            <MapPin className="h-2.5 w-2.5" /> {item.destinationLocation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {new Date(item.requestedTime).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase h-6 px-3 border-none",
                          item.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" : 
                          item.status === 'COMPLETED' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {item.status === 'APPROVED' ? 'Ativo' : item.status === 'COMPLETED' ? 'Finalizado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium">
                      Nenhum manifesto registrado no sistema para os critérios informados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="p-6 bg-slate-100 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Sincronização de Campo</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Esta tela reflete as missões geradas pelo **Otimizador de Rotas**. Quando um manifesto aparece aqui, o motorista já recebeu a notificação em seu dispositivo e a logística está em curso.
          </p>
        </div>
        <ExternalLink className="h-6 w-6 text-slate-400 hidden md:block" />
      </div>
    </div>
  );
}
