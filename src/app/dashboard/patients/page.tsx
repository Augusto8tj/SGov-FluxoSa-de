
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
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
import { patientService } from "@/services/patient-service";

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");
  const [formComorbidities, setFormComorbidities] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formNeedsCompanion, setFormNeedsCompanion] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error) {
      toast({ title: "Erro de Sincronização", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formName || !formCns) {
      toast({ title: "Campos Requeridos", description: "Nome e CNS são necessários.", variant: "destructive" });
      return;
    }

    const comorbidities = formComorbidities ? formComorbidities.split(',').map(s => s.trim()) : [];
    const patientData = {
      name: formName,
      medicalRecordNumber: formCns,
      comorbidities,
      needsCompanion: formNeedsCompanion,
      notes: formNotes
    };

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, patientData);
      } else {
        await patientService.addPatient(patientData);
      }
      setIsDialogOpen(false);
      loadPatients();
      toast({ title: "Cadastro Sincronizado" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
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
          <p className="text-sm text-muted-foreground">Registro central de pacientes.</p>
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
                  <Checkbox id="comp" checked={formNeedsCompanion} onCheckedChange={(c) => setFormNeedsCompanion(!!c)} />
                  <Label htmlFor="comp" className="text-sm font-medium">Requer Acompanhante</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Comorbidades (separar por vírgula)</Label>
                <Input className="h-11" placeholder="Ex: Hipertensão, Diabetes" value={formComorbidities} onChange={(e) => setFormComorbidities(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Observações Gerais</Label>
                <Textarea className="min-h-[80px]" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
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
                          <DropdownMenuItem onClick={() => { setEditingPatient(p); setFormName(p.name); setFormCns(p.medicalRecordNumber); setFormComorbidities(p.comorbidities.join(', ')); setFormNeedsCompanion(p.needsCompanion); setFormNotes(p.notes || ""); setIsDialogOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { patientService.deletePatient(p.id).then(() => loadPatients()); }}>
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
