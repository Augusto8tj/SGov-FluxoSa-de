"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Loader2,
  Filter
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_PATIENTS: Patient[] = [
  { id: "P1", name: "Benedito Silva", medicalRecordNumber: "CNS 123.456.789-00", comorbidities: ["Diabetes", "Hipertensão"], needsCompanion: true, notes: "Cadeirante, requer rampa." },
  { id: "P2", name: "Maria de Fátima", medicalRecordNumber: "CNS 987.654.321-11", comorbidities: ["Renal Crônico"], needsCompanion: false, notes: "Tratamento de Hemodiálise." },
  { id: "P3", name: "José Bonifácio", medicalRecordNumber: "CNS 456.123.789-22", comorbidities: ["Cardiopata"], needsCompanion: true },
  { id: "P4", name: "Ana Cláudia", medicalRecordNumber: "CNS 321.654.987-33", comorbidities: ["Pós-Operatório"], needsCompanion: true },
  { id: "P5", name: "Wilson Oliveira", medicalRecordNumber: "CNS 789.456.123-44", comorbidities: ["DPOC"], needsCompanion: false, notes: "Uso eventual de O2." },
];

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleSave = () => {
    if (!formName || !formCns) {
      toast({ title: "Campos Requeridos", description: "Nome e CNS são necessários.", variant: "destructive" });
      return;
    }
    
    // Fechar o diálogo ANTES de disparar o toast pesado para evitar travamentos de ponteiro
    setIsDialogOpen(false);
    
    setTimeout(() => {
      toast({ title: "Sucesso", description: "Dados sincronizados com o banco de dados." });
    }, 100);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medicalRecordNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Cidadãos</h2>
          <p className="text-sm text-muted-foreground">Registro central de pacientes de Rio Claro.</p>
        </div>
        
        <Button onClick={() => { setEditingPatient(null); setFormName(""); setFormCns(""); setIsDialogOpen(true); }} className="gap-2 w-full sm:w-auto shadow-md">
          <UserPlus className="h-4 w-4" /> Novo Paciente
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Editar Cadastro" : "Cadastrar Cidadão"}</DialogTitle>
              <DialogDescription>Dados clínicos para transporte sanitário.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input className="h-11" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CNS / Prontuário</Label>
                  <Input className="h-11" value={formCns} onChange={(e) => setFormCns(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-0 sm:pt-8">
                  <Checkbox id="comp" />
                  <Label htmlFor="comp" className="text-sm font-medium">Requer Acompanhante</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Comorbidades (separar por vírgula)</Label>
                <Input className="h-11" placeholder="Ex: Hipertensão, Diabetes" />
              </div>
              <div className="grid gap-2">
                <Label>Observações Gerais</Label>
                <Textarea className="min-h-[80px]" />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto">Salvar Cidadão</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CNS..." className="pl-10 h-11 bg-card border-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando base de dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>Necessidades</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.medicalRecordNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.comorbidities.map((c, i) => (
                          <Badge key={i} className="bg-primary/10 text-primary border-none text-[9px] uppercase">{c}</Badge>
                        ))}
                        {p.needsCompanion && <Badge className="bg-accent/20 text-accent-foreground border-none text-[9px] uppercase">Acomp.</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingPatient(p); setFormName(p.name); setFormCns(p.medicalRecordNumber); setIsDialogOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
