"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck,
  Edit,
  Trash2,
  History,
  FileText,
  Loader2,
  Plus
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

const MOCK_PATIENTS: Patient[] = [
  { id: "P1", name: "Benedito Silva", medicalRecordNumber: "123.456.789-00", comorbidities: ["Diabetes", "Hipertensão"], needsCompanion: true, notes: "Cadeirante, requer rampa." },
  { id: "P2", name: "Maria de Fátima", medicalRecordNumber: "987.654.321-11", comorbidities: ["Renal Crônico"], needsCompanion: false, notes: "Tratamento de Hemodiálise." },
  { id: "P3", name: "José Bonifácio", medicalRecordNumber: "456.789.123-44", comorbidities: ["Cardiopata"], needsCompanion: true },
  { id: "P4", name: "Ana Oliveira", medicalRecordNumber: "321.654.987-22", comorbidities: ["Pós-Operatório"], needsCompanion: true },
];

export default function UbsPatientsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");
  const [formNeedsCompanion, setFormNeedsCompanion] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const resetForm = () => {
    setEditingPatient(null);
    setFormName("");
    setFormCns("");
    setFormNeedsCompanion(false);
    setFormNotes("");
  };

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormName(patient.name);
      setFormCns(patient.medicalRecordNumber);
      setFormNeedsCompanion(patient.needsCompanion);
      setFormNotes(patient.notes || "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formCns) {
      toast({ 
        title: "Campos Requeridos", 
        description: "Nome e CNS são obrigatórios para o cadastro municipal.", 
        variant: "destructive" 
      });
      return;
    }
    
    setLoading(true);
    // Simulação de operação de banco de dados
    setTimeout(() => {
      const patientData: Patient = {
        id: editingPatient?.id || `P${patients.length + 1}`,
        name: formName,
        medicalRecordNumber: formCns,
        comorbidities: editingPatient?.comorbidities || ["Geral"],
        needsCompanion: formNeedsCompanion,
        notes: formNotes
      };

      if (editingPatient) {
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? patientData : p));
      } else {
        setPatients(prev => [patientData, ...prev]);
      }

      setLoading(false);
      setIsDialogOpen(false);
      toast({ 
        title: editingPatient ? "Cadastro Atualizado" : "Cidadão Cadastrado", 
        description: `Os dados de ${formName} foram sincronizados com sucesso.` 
      });
    }, 600);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.medicalRecordNumber.includes(searchTerm)
  );

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
          onClick={() => handleOpenDialog()}
        >
          <UserPlus className="h-4 w-4" /> Novo Cidadão
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Editar Cadastro" : "Cadastrar Cidadão"}</DialogTitle>
              <DialogDescription>Dados clínicos para transporte sanitário.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Nome Completo</Label>
                <Input 
                  id="p-name" 
                  className="h-11 rounded-xl" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                  placeholder="Nome do paciente"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="p-cns">CNS / Prontuário</Label>
                  <Input 
                    id="p-cns" 
                    className="h-11 rounded-xl" 
                    value={formCns} 
                    onChange={(e) => setFormCns(e.target.value)} 
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-0 sm:pt-8">
                  <Checkbox 
                    id="p-comp" 
                    checked={formNeedsCompanion} 
                    onCheckedChange={(checked) => setFormNeedsCompanion(checked as boolean)}
                  />
                  <Label htmlFor="p-comp" className="text-sm font-medium cursor-pointer">Requer Acompanhante</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-notes">Observações e Necessidades</Label>
                <Textarea 
                  id="p-notes" 
                  className="min-h-[100px] rounded-xl resize-none" 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Cadeirante, utiliza oxigênio próprio, dificuldade de locomoção..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto rounded-xl">Cancelar</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingPatient ? "Atualizar" : "Salvar Cidadão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        {loading && !isDialogOpen ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Sincronizando Base...</p>
          </div>
        ) : (
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
                      <TableCell className="text-xs font-mono text-muted-foreground">{p.medicalRecordNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 
                          Verificado: {p.id.startsWith('P') ? 'Ativo' : 'Pendente'}
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(p)} className="rounded-lg gap-2 cursor-pointer">
                              <Edit className="h-4 w-4" /> Editar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                              <FileText className="h-4 w-4" /> Ver Prontuário
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                              <History className="h-4 w-4" /> Histórico de Transporte
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
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
        )}
      </Card>
    </div>
  );
}
