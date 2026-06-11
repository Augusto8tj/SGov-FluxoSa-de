
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck,
  Edit,
  Trash2,
  History,
  FileText,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { patientService } from "@/services/patient-service";

export default function UbsPatientsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");
  const [formNeedsCompanion, setFormNeedsCompanion] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const { toast } = useToast();

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar base de dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    loadPatients();
  }, [loadPatients]);

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormName(patient.name);
      setFormCns(patient.medicalRecordNumber);
      setFormNeedsCompanion(patient.needsCompanion);
      setFormNotes(patient.notes || "");
    } else {
      setEditingPatient(null);
      setFormName("");
      setFormCns("");
      setFormNeedsCompanion(false);
      setFormNotes("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formCns) {
      toast({ title: "Campos Requeridos", description: "Nome e CNS são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const patientData = {
      name: formName,
      medicalRecordNumber: formCns,
      comorbidities: editingPatient?.comorbidities || ["Geral"],
      needsCompanion: formNeedsCompanion,
      notes: formNotes
    };

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, patientData);
      } else {
        await patientService.addPatient(patientData as any);
      }
      setIsDialogOpen(false);
      loadPatients();
      toast({ title: "Sincronizado", description: `Dados de ${formName} salvos com sucesso.` });
    } catch {
      toast({ title: "Erro", description: "Falha ao gravar no banco de dados.", variant: "destructive" });
    }
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
        
        <Button className="gap-2 shadow-md h-11 px-6 rounded-xl" onClick={() => handleOpenDialog()}>
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
                <Input id="p-name" className="h-11 rounded-xl" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="p-cns">CNS / Prontuário</Label>
                  <Input id="p-cns" className="h-11 rounded-xl" value={formCns} onChange={(e) => setFormCns(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-0 sm:pt-8">
                  <Checkbox id="p-comp" checked={formNeedsCompanion} onCheckedChange={(checked) => setFormNeedsCompanion(checked as boolean)} />
                  <Label htmlFor="p-comp" className="text-sm font-medium cursor-pointer">Requer Acompanhante</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-notes">Observações e Necessidades</Label>
                <Textarea id="p-notes" className="min-h-[100px] rounded-xl resize-none" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleSave} className="rounded-xl bg-primary shadow-lg">
                {editingPatient ? "Atualizar" : "Salvar Cidadão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou CNS..." 
          className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-black">Sincronizando Base...</p>
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
                {filteredPatients.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-muted/20">
                    <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.medicalRecordNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verificado
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                          <DropdownMenuItem onClick={() => handleOpenDialog(p)} className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Editar Cadastro
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" /> Ver Prontuário
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <History className="h-4 w-4" /> Histórico de Transporte
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
