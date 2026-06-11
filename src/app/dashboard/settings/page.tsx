
"use client";

import { useState } from "react";
import { 
  Settings, 
  Hospital, 
  User, 
  Ambulance, 
  Users, 
  ShieldCheck, 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = (module: string) => {
    toast({
      title: "Alterações Salvas",
      description: `As configurações de ${module} foram atualizadas com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Gerenciamento administrativo de entidades e acessos.</p>
        </div>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList className="bg-white border p-1 h-12 shadow-sm w-full md:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="units" className="gap-2 px-4 h-10"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-4 h-10"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2 px-4 h-10"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
          <TabsTrigger value="users" className="gap-2 px-4 h-10"><Users className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2 px-4 h-10"><ShieldCheck className="h-4 w-4" /> Perfis</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unidades de Saúde (UBS)</CardTitle>
                <CardDescription>Cadastre e gerencie as UBS do município.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Unidades")}>Adicionar UBS</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">UBS Central</TableCell>
                    <TableCell>Av. 29, 123 - Centro</TableCell>
                    <TableCell><Badge variant="secondary">Ativo</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">UBS Rio Claro Sul</TableCell>
                    <TableCell>Distrito de Passa Três</TableCell>
                    <TableCell><Badge variant="secondary">Ativo</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Corpo de Motoristas</CardTitle>
                <CardDescription>Gestão de condutores e habilitações.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Motoristas")}>Novo Motorista</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNH / Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Carlos Alberto Silva</TableCell>
                    <TableCell>Cat. D - 20/05/2026</TableCell>
                    <TableCell><Badge className="bg-emerald-100 text-emerald-700">Disponível</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Marcos Pereira</TableCell>
                    <TableCell>Cat. D - 15/02/2025</TableCell>
                    <TableCell><Badge className="bg-emerald-100 text-emerald-700">Disponível</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Configuração da Frota</CardTitle>
                <CardDescription>Cadastro técnico de veículos municipais.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Frota")}>Cadastrar Veículo</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">ABC-1234</TableCell>
                    <TableCell>Ambulância</TableCell>
                    <TableCell>2 Pacientes</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">XYZ-5678</TableCell>
                    <TableCell>Van de Passageiros</TableCell>
                    <TableCell>12 Pacientes</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>Gerencie quem acessa as plataformas de gestão e operação.</CardDescription>
              </div>
              <Button onClick={() => handleSave("Usuários")}>Novo Usuário</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dr. Ricardo Silva</TableCell>
                    <TableCell>secretario@rioclaro.rj.gov.br</TableCell>
                    <TableCell><Badge variant="outline" className="border-primary text-primary">Secretário</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Key className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Márcia Oliveira</TableCell>
                    <TableCell>ubs.central@rioclaro.rj.gov.br</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-600 text-emerald-600">UBS</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Key className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Estrutura de Perfis</CardTitle>
                <CardDescription>Defina as permissões por grupo de usuário.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Secretário</p>
                    <p className="text-[10px] text-muted-foreground">Acesso Total + Auditoria</p>
                  </div>
                  <Badge className="bg-primary">ADMIN</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Gerente UBS</p>
                    <p className="text-[10px] text-muted-foreground">Solicitação e Cadastro de Pacientes</p>
                  </div>
                  <Badge className="bg-emerald-600">UBS</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-bold">Motorista</p>
                    <p className="text-[10px] text-muted-foreground">Acesso Mobile / Itinerários</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">DRIVER</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Segurança e Auditoria</CardTitle>
                <CardDescription>Políticas globais de acesso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tempo de Sessão (minutos)</Label>
                  <Input type="number" defaultValue="120" className="bg-white" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">Autenticação de Dois Fatores</p>
                    <p className="text-[10px] text-muted-foreground">Obrigatória para perfis Administrativos.</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Ativado</Badge>
                </div>
                <Button className="w-full mt-4" onClick={() => handleSave("Perfis")}>Salvar Políticas</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
