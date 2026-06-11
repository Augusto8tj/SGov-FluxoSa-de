"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Ambulance, 
  ChevronRight, 
  Zap, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateDriverBriefing, DriverBriefingOutput } from "@/ai/flows/generate-driver-briefing-flow";
import { cn } from "@/lib/utils";

const mockRoute = {
  id: "ROUTE-42",
  vehicle: "Ambulância - Placa ABC-1234",
  startTime: "08:00",
  stops: [
    { id: "S1", name: "UBS Central", type: "PICKUP", patient: "Maria Souza", specialNeeds: ["Maca", "Oxigênio"], urgency: "high", time: "08:15" },
    { id: "S2", name: "Hospital Municipal", type: "DROPOFF", patient: "Maria Souza", time: "08:45" },
    { id: "S3", name: "UBS Rio Claro Sul", type: "PICKUP", patient: "João Pedro", specialNeeds: ["Cadeirante"], urgency: "medium", time: "09:15" },
  ]
};

export default function DriverDashboard() {
  const [briefing, setBriefing] = useState<DriverBriefingOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateDriverBriefing({
        driverName: "Carlos Silva",
        vehicleType: "Ambulância",
        passengers: mockRoute.stops.filter(s => s.patient).map(s => ({
          name: s.patient!,
          needs: s.specialNeeds || [],
          urgency: s.urgency || "low"
        })),
        routeDetails: "Início na Garagem Municipal, paradas em UBS Central e Rio Claro Sul."
      });
      setBriefing(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Olá, Carlos!</h2>
          <p className="text-xs text-slate-500">Sua jornada de hoje começou.</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Em Serviço</Badge>
      </div>

      <Card className="bg-primary text-white border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Veículo Escalado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Ambulance className="h-8 w-8" />
            <div>
              <p className="font-bold">{mockRoute.vehicle}</p>
              <p className="text-xs opacity-80">Checklist realizado às 07:45</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Briefing da IA
          </h3>
          {!briefing && !loadingAi && (
            <Button variant="ghost" size="sm" onClick={getBriefing} className="text-xs h-7 text-primary">
              <BrainCircuit className="h-3 w-3 mr-1" /> Gerar Briefing
            </Button>
          )}
        </div>

        {loadingAi && (
          <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
            <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-xs text-slate-500 font-medium">Analisando rota e pacientes...</p>
          </div>
        )}

        {briefing && (
          <Card className="border-l-4 border-l-accent bg-white shadow-sm border-none">
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm leading-relaxed text-slate-700">{briefing.summary}</p>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alertas Críticos</p>
                {briefing.criticalAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    {alert}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t text-[10px] italic text-slate-500">
                Lembrete: {briefing.protocolReminder}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-700">Itinerário da Rota {mockRoute.id}</h3>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
          {mockRoute.stops.map((stop, i) => (
            <div key={stop.id} className="relative pl-8">
              <div className={cn(
                "absolute left-1.5 top-1 size-3 rounded-full border-2 border-white shadow-sm",
                stop.type === 'PICKUP' ? "bg-primary" : "bg-accent"
              )} />
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[9px] h-4 py-0 uppercase">
                          {stop.type === 'PICKUP' ? 'Coleta' : 'Entrega'}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400">{stop.time}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{stop.name}</p>
                      {stop.patient && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            Paciente: {stop.patient}
                          </p>
                          <div className="flex gap-1">
                            {stop.specialNeeds?.map(n => (
                              <Badge key={n} className="bg-amber-100 text-amber-700 border-none text-[9px] h-4">
                                {n}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full h-12 gap-2 text-base shadow-lg bg-emerald-600 hover:bg-emerald-700">
        <CheckCircle2 className="h-5 w-5" /> Finalizar Jornada
      </Button>
    </div>
  );
}
