"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  CheckCircle2, 
  History,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";

export default function UbsRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setIsWithinWindow(hour >= 8 && hour < 13);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Nossas Solicitações</h2>
          <p className="text-sm text-muted-foreground">Pedidos originados exclusivamente por esta UBS.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isWithinWindow && (
            <Badge variant="destructive" className="h-10 px-4 flex gap-2">
              <AlertTriangle className="h-4 w-4" /> JANELA FECHADA
            </Badge>
          )}
          <Button disabled={!isWithinWindow} className={cn("gap-2 shadow-md h-11 px-6", !isWithinWindow && "grayscale opacity-50")}>
            <Plus className="h-4 w-4" /> Nova Solicitação
          </Button>
        </div>
      </div>

      <Card className="bg-primary/5 border-none p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Atenção</p>
            <p className="text-sm text-foreground/80">O processamento da Secretaria ocorre em ciclos de 30 minutos após seu pedido.</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por paciente ou destino..." className="pl-10 h-11" />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: "1", name: "Benedito Silva", dest: "Hospital Municipal", status: "Aprovado", time: "08:00" },
              { id: "2", name: "Maria de Fátima", dest: "Hemodiálise", status: "Pendente", time: "10:30" },
            ].map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{req.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">CNS 123.456...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {req.dest}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mt-1">
                    <Clock className="h-3 w-3" /> Previsto: {req.time}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase font-bold",
                    req.status === 'Aprovado' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs h-8">Detalhes</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
