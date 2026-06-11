"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

export default function UbsPatientsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Meus Pacientes</h2>
          <p className="text-sm text-muted-foreground">Base de cidadãos cadastrados na UBS Central.</p>
        </div>
        
        <Button className="gap-2 shadow-md h-11 px-6">
          <UserPlus className="h-4 w-4" /> Novo Cidadão
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CNS..." className="pl-10 h-11 bg-card border-none shadow-sm" />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>CNS / Prontuário</TableHead>
                <TableHead>Histórico Recente</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Benedito Silva", cns: "123.456.789-00", last: "Ontem" },
                { name: "Maria de Fátima", cns: "987.654.321-11", last: "Há 3 dias" },
              ].map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{p.cns}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Ativo: {p.last}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
