"use client";

import { useState, useEffect } from "react";
import { 
  Fingerprint, 
  Search, 
  ShieldCheck, 
  User, 
  Database,
  Filter,
  ArrowRightLeft,
  Lock,
  Download,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MOCK_AUDIT_LOGS = [
  { id: "LOG-001", user: "secretario@rioclaro.rj.gov.br", action: "Aprovação em Massa", resource: "Solicitações", ip: "187.12.34.56", status: "SUCCESS", time: new Date().toISOString() },
  { id: "LOG-002", user: "gerente.ubs@rioclaro.rj.gov.br", action: "Novo Cadastro", resource: "Paciente: Benedito Silva", ip: "177.45.22.10", status: "SUCCESS", time: new Date(Date.now() - 3600000).toISOString() },
  { id: "LOG-003", user: "motorista@rioclaro.rj.gov.br", action: "Encerramento de Rota", resource: "Viatura V1", ip: "191.88.99.01", status: "SUCCESS", time: new Date(Date.now() - 7200000).toISOString() },
  { id: "LOG-004", user: "admin@rioclaro.rj.gov.br", action: "Alteração de Configuração", resource: "Modelo IA", ip: "201.10.20.30", status: "WARNING", time: new Date(Date.now() - 10800000).toISOString() },
  { id: "LOG-005", user: "ubs.central@rioclaro.rj.gov.br", action: "Consulta de Código", resource: "Manifesto MF-2024", ip: "186.22.11.44", status: "SUCCESS", time: new Date(Date.now() - 14400000).toISOString() },
];

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const integrityStatus = "VALIDADO";

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Fingerprint className="h-8 w-8" /> Auditoria do Sistema
          </h2>
          <p className="text-muted-foreground">Rastreabilidade e registros de segurança - PMRC v1.1.0.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "h-11 px-4 rounded-xl border-none font-black text-[10px] uppercase gap-2 shadow-sm transition-all",
            integrityStatus === 'VALIDADO' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white animate-pulse"
          )}>
            {integrityStatus === 'VALIDADO' ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            Cadeia de Custódia: {integrityStatus}
          </Badge>
          <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm">
            <Download className="h-4 w-4" /> Exportar Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Integridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">100%</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Verificação de Assinatura</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <Lock className="h-4 w-4 text-primary" /> Acessos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">124</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Usuários Identificados</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <ArrowRightLeft className="h-4 w-4 text-amber-500" /> Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">856</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Registros de Transação</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por usuário, ação ou recurso..." 
            className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none">
                <TableHead className="font-bold">Usuário / ID</TableHead>
                <TableHead className="font-bold">Ação Realizada</TableHead>
                <TableHead className="font-bold">Recurso Afetado</TableHead>
                <TableHead className="font-bold">Data & IP</TableHead>
                <TableHead className="text-right font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/10 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{log.user.split('@')[0]}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{log.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-700">{log.action}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase">
                      <Database className="h-3 w-3" /> {log.resource}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">
                        {format(new Date(log.time), "dd/MM HH:mm:ss", { locale: ptBR })}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground">{log.ip}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn(
                      "text-[8px] font-black uppercase px-2 h-5 border-none",
                      log.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="p-6 bg-slate-100 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <Fingerprint className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Protocolo de Rastreabilidade</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Todos os logs são persistidos com criptografia de ponta e não podem ser alterados, garantindo a validade jurídica das informações registradas no sistema.
          </p>
        </div>
        <Lock className="h-6 w-6 text-slate-400 hidden md:block" />
      </div>
    </div>
  );
}
