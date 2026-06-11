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
  ArrowRight,
  Filter
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

export default function UbsManifestsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [manifests, setManifests] = useState<TransportRequest[]>([]);
  const { toast } = useToast();

  const loadManifests = useCallback(async () => {
    setLoading(true);
    try {
      const allRequests = await requestService.getRequests();
      // Filtra apenas pedidos desta UBS que tenham manifesto (Aprovados ou Concluídos)
      const ubsManifests = allRequests.filter(r => 
        (r.ubsId === "UBS-01" || r.operatorId === "UBS_MGR") && 
        (r.status === 'APPROVED' || r.status === 'COMPLETED') &&
        r.manifestId
      );
      setManifests(ubsManifests);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar manifestos da unidade.", variant: "destructive" });
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
    m.manifestId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Manifestos de Viagem</h2>
          <p className="text-sm text-muted-foreground">Acompanhe os veículos e horários de saída dos seus pacientes.</p>
        </div>
        <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={loadManifests}>
          <Clock className="h-4 w-4" /> Atualizar Escala
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-none bg-blue-50 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Ambulance className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Viagens Hoje</p>
              <p className="text-xl font-black">{manifests.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none bg-emerald-50 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Logística Atribuída</p>
              <p className="text-xl font-black">{manifests.filter(m => m.status === 'APPROVED').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none bg-slate-50 border-l-4 border-l-slate-400">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-lg text-slate-600">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Finalizados</p>
              <p className="text-xl font-black">{manifests.filter(m => m.status === 'COMPLETED').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente ou código do manifesto..." 
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
            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Escala Logística...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Manifesto</TableHead>
                  <TableHead className="font-bold">Paciente & Destino</TableHead>
                  <TableHead className="font-bold">Logística (Viatura/Motorista)</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Saída</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManifests.length > 0 ? (
                  filteredManifests.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10 group transition-colors">
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] h-6 px-3">
                          {item.manifestId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-black text-sm text-slate-800">{item.patientName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                            <MapPin className="h-3 w-3" /> {item.destinationLocation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Ambulance className="h-3.5 w-3.5 text-primary" /> {item.vehicleId || "Viatura Local"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase">
                            <User className="h-3 w-3" /> {item.driverId || "Plantão Logística"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.status === 'APPROVED' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black uppercase h-5 px-2">Confirmado</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] font-black uppercase h-5 px-2">Concluído</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-slate-700">
                            {new Date(item.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase">
                            {new Date(item.requestedTime).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium">
                      Nenhum manifesto pronto para seus pacientes no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-primary uppercase tracking-tighter">Transparência Logística</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Esta tela permite que a recepção da UBS informe aos familiares e pacientes exatamente qual veículo virá buscá-los, aumentando a segurança e reduzindo a ansiedade durante a espera pelo transporte sanitário.
          </p>
        </div>
        <ArrowRight className="h-6 w-6 text-primary hidden md:block opacity-30" />
      </div>
    </div>
  );
}
