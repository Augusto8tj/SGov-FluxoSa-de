
"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Users, 
  UserPlus, 
  MoreVertical, 
  FileText, 
  ShieldAlert,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  History
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockPatients: Patient[] = [
  {
    id: "P-101",
    name: "Maria Aparecida da Silva",
    medicalRecordNumber: "CNS 123.4567.8901",
    comorbidities: ["Diabetes", "Hipertensão"],
    needsCompanion: true,
    notes: "Paciente requer uso de maca para trajetos longos."
  },
  {
    id: "P-102",
    name: "João Pedro dos Santos",
    medicalRecordNumber: "CNS 987.6543.2109",
    comorbidities: ["Insuficiência Renal"],
    needsCompanion: false,
    notes: "Realiza hemodiálise 3x por semana."
  },
  {
    id: "P-103",
    name: "Ana Julia de Oliveira",
    medicalRecordNumber: "CNS 456.7890.1234",
    comorbidities: [],
    needsCompanion: true,
    notes: "Menor de idade, sempre com responsável."
  },
  {
    id: "P-104",
    name: "Ricardo Mendes",
    medicalRecordNumber: "CNS 111.2223.3334",
    comorbidities: ["Cadeirante"],
    needsCompanion: false,
  }
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState(mockPatients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medicalRecordNumber.includes(searchTerm)
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const cns = formData.get('cns') as string;
    const comorbiditiesStr = formData.get('comorbidities') as string;
    const notes = formData.get('notes') as string;
    const needsCompanion = (e.target as any).elements.companion.checked;

    const comorbidities = comorbiditiesStr ? comorbiditiesStr.split(',').map(s => s.trim()) : [];

    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? {
        ...p,
        name,
        medicalRecordNumber: cns,
        comorbidities,
        needsCompanion,
        notes
      } : p));
      toast({ title: "Cadastro Atualizado", description: "Os dados do cidadão foram atualizados." });
    } else {
      const newP: Patient = {
        id: `P-${Math.floor(Math.random() * 1000)}`,
        name,
        medicalRecordNumber: cns,
        comorbidities,
        needsCompanion,
        notes
      };
      setPatients(prev => [...prev, newP]);
      toast({ title: "Cidadão Cadastrado", description: "O registro foi salvo com sucesso." });
    }
    
    setIsDialogOpen(false);
    setEditingPatient(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Registro Excluído",
      description: "Os dados do cidadão foram removidos do cadastro central.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Cadastro de Pacientes</h2>
          <p className="text-muted-foreground">Gestão centralizada de cidadãos usuários do transporte sanitário.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPatient(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <UserPlus className="h-4 w-4" /> Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Editar Cadastro" : "Cadastrar Novo Cidadão"}</DialogTitle>
              <DialogDescription>
                Insira as informações básicas e clínicas para autorização de transporte.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePatient} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" name="name" placeholder="Ex: Maria Souza" defaultValue={editingPatient?.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cns">CNS / Prontuário</Label>
                  <Input id="cns" name="cns" placeholder="000.0000.0000" defaultValue={editingPatient?.medicalRecordNumber} required />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox id="companion" name="companion" defaultChecked={editingPatient?.needsCompanion} />
                  <Label htmlFor="companion" className="text-sm font-normal">Requer Acompanhante</Label>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="comorbidities">Comorbidades / Necessidades Especiais</Label>
                <Input id="comorbidities" name="comorbidities" placeholder="Ex: Diabetes, Cadeirante, Oxigênio" defaultValue={editingPatient?.comorbidities.join(', ')} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea id="notes" name="notes" placeholder="Informações relevantes para o motorista..." defaultValue={editingPatient?.notes} />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingPatient ? "Salvar Alterações" : "Salvar Cadastro"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou CNS..." 
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 h-10">
          <Filter className="h-4 w-4" /> Filtros Avançados
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento / CNS</TableHead>
                <TableHead>Necessidades</TableHead>
                <TableHead>Acompanhante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{patient.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{patient.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {patient.medicalRecordNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.comorbidities.length > 0 ? (
                          patient.comorbidities.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] py-0">
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhuma informada</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.needsCompanion ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Sim
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <XCircle className="h-3 w-3" /> Não
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => toast({ title: "Ficha do Paciente", description: `Acessando prontuário de ${patient.name}` })}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações do Paciente</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toast({ title: "Histórico", description: `Abrindo histórico de viagens de ${patient.name}` })}>
                              <History className="h-4 w-4 mr-2" /> Ver Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                              <Edit className="h-4 w-4 mr-2" /> Editar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-rose-600"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum paciente encontrado com esses critérios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
