"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  Rocket,
  History,
  Heart,
  Fingerprint,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function AdminHelpPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual do Gestor
        </h2>
        <p className="text-muted-foreground italic">Guia de operação estratégica - PMRC v1.1.0 Stable</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Perfil Secretaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Gestão total de frota, usuários e aprovações de transporte sanitário.</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
              <Fingerprint className="h-4 w-4" /> Auditoria v1.1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Rastreabilidade completa de ações e logs imutáveis de segurança.</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-rose-600 tracking-widest flex items-center gap-2">
              <Heart className="h-4 w-4" /> Portal Cidadão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Canal público de consulta para pacientes com privacidade garantida.</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="changelog-v1-1" className="border-2 border-primary/20 rounded-2xl bg-primary/5 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary p-3 rounded-xl text-white shadow-lg">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-lg text-primary">Novidades da Versão 1.1.0</p>
                  <Badge className="bg-primary text-white border-none text-[10px]">NEW</Badge>
                </div>
                <p className="text-sm text-primary/70 font-medium">Foco em Segurança e Auditoria</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-1">Novas Funcionalidades</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• Auditoria do Sistema:</b> Logs detalhados de IP, usuário e recurso.</li>
                  <li className="flex gap-2"><b>• Relatórios de Campo:</b> Visualização central de ocorrências dos motoristas.</li>
                  <li className="flex gap-2"><b>• Telemetria de Frota:</b> Controle de combustível e odômetro integrado.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-1">Segurança</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• Imutabilidade:</b> Registros de logs protegidos contra edição.</li>
                  <li className="flex gap-2"><b>• Pseudonimização:</b> Refinamento do mascaramento de nomes na IA.</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="changelog-v1-0" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <p className="font-bold text-sm">Histórico: Versão 1.0.0 Stable</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-500 text-xs px-2 pb-4">
            Lançamento oficial com Portal do Cidadão, IA Nvidia Nemotron, Multi-perfil e tecnologia PWA.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-dashed border-2 bg-muted/5">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <HelpCircle className="h-10 w-10 text-muted-foreground opacity-30" />
          <div>
            <p className="font-bold">Dúvidas Técnicas?</p>
            <p className="text-sm text-muted-foreground">Suporte da Secretaria Municipal de Ordem Pública - Rio Claro.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}