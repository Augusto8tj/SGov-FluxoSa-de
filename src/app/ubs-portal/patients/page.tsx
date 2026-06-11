"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck,
  Edit,
  Trash2,
  History,
  FileText
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const MOCK_PATIENTS = [
  { id: "P1", name: "Benedito Silva", cns: "123.456.789-00", last: "Ontem", status: "Ativo" },
  { id: "P2", name: "Maria de Fátima", cns: "987.654.321-11", last: "Há 3 dias", status: "Ativo" },
  { id: "P3", name: "José Bonifácio", cns: "456.789.123-44", last: "Hoje", status: "Ativo" },
  { id: "P4", name: "Ana Oliveira", cns: "321.654.987-22", last: "Há 1 semana", status: "Inativo" },
];

export default function UbsPatientsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cns.includes(searchTerm)
  );

  const handleAction = (action: string, patientName: string) => {
    toast({
      title: `${action} acionado`,
      description: `Operação realizada para o cidadão ${patientName}.`,
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Meus Pacientes</h2>
          <p className="text-sm text-muted-foreground">Base de cidadãos cadastrados na UBS Central.</p>
        </div>
        
        <Button 
          className="gap-2 shadow-md h-11 px-6 rounded-xl"
          onClick={() => handleAction("Novo Cadastro", "do sistema")}
        >
          <UserPlus className="h-4 w-4" /> Novo Cidadão
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou CNS..." 
            className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none">
                <TableHead className="font-bold">Nome Completo</TableHead>
                <TableHead className="font-bold">CNS / Prontuário</TableHead>
                <TableHead className="font-bold">Situação</TableHead>
                <TableHead className="text-right font-bold">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-muted/20 transition-colors border-muted/50">
                    <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.cns}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 
                        Sincronizado: {p.last}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-primary/10">
                          <DropdownMenuItem onClick={() => handleAction("Edição", p.name)} className="rounded-lg gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Editar Cadastro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Visualização de Laudos", p.name)} className="rounded-lg gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" /> Ver Prontuário
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Histórico de Viagens", p.name)} className="rounded-lg gap-2 cursor-pointer">
                            <History className="h-4 w-4" /> Histórico de Transporte
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction("Remoção", p.name)} className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="h-4 w-4" /> Remover Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    Nenhum paciente encontrado para "{searchTerm}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
