
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  UserPlus, 
  MoreVertical, 
  FileText, 
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Loader2
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
      toast({ title: "Erro", description: "Falha ao carregar pacientes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formName || !formCns) {
      toast({ title: "Atenção", description: "Nome e CNS são obrigatórios.", variant: "destructive" });
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
        toast({ title: "Sucesso", description: "Cadastro atualizado." });
      } else {
        await patientService.addPatient(patientData);
        toast({ title: "Sucesso", description: "Cidadão cadastrado no banco central." });
      }
      setIsDialogOpen(false);
      loadPatients();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao sincronizar dados.", variant: "destructive" });
    }
  };

  const handleEdit = (p: Patient) => {
    setEditingPatient(p);
    setFormName(p.name);
    setFormCns(p.medicalRecordNumber);
    setFormComorbidities(p.comorbidities.join(', '));
    setFormNotes(p.notes || "");
    setFormNeedsCompanion(p.needsCompanion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await patientService.deletePatient(id);
      toast({ title: "Removido", description: "Paciente excluído do cadastro." });
      loadPatients();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medicalRecordNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Pacientes</h2>
          <p className="text-muted-foreground">Registro centralizado no Firebase.</p>
        </div>
        
        <Button onClick={() => { setEditingPatient(null); setFormName(""); setFormCns(""); setIsDialogOpen(true); }} className="gap-2">
          <UserPlus className="h-4 w-4" /> Novo Paciente
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Editar Cadastro" : "Novo Cidadão"}</DialogTitle>
              <DialogDescription>Dados clínicos e de identificação para transporte.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CNS / Prontuário</Label>
                  <Input value={formCns} onChange={(e) => setFormCns(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox checked={formNeedsCompanion} onCheckedChange={(c) => setFormNeedsCompanion(!!c)} />
                  <Label className="text-sm font-normal">Acompanhante</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Comorbidades (separadas por vírgula)</Label>
                <Input value={formComorbidities} onChange={(e) => setFormComorbidities(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Notas</Label>
                <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar Cidadão</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou documento..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Sincronizando com Firebase...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNS</TableHead>
                <TableHead>Necessidades</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-xs font-mono">{p.medicalRecordNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.comorbidities.map((c, i) => <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>)}
                      {p.needsCompanion && <Badge className="bg-emerald-100 text-emerald-700">Acomp.</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(p)}><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onSelect={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Nenhum paciente cadastrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
