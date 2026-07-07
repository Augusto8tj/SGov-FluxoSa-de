
"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  ClipboardList,
  Heart,
  Fingerprint,
  HelpCircle,
  BrainCircuit,
  MapPin,
  CheckCircle2,
  Lock,
  Printer,
  CalendarDays,
  UserCircle,
  Zap,
  Activity,
  FileText,
  Rocket
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminHelpPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual de Gestão Estratégica
        </h2>
        <p className="text-muted-foreground italic">Guia para o Secretário de Governo e Gestores de Ordem Pública & bull; PMRC v1.2.0 Stable</p>
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
              <Fingerprint className="h-4 w-4" /> Auditoria v1.2
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

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Protocolos do Gabinete
      </h3>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* SEÇÃO: PROTOCOLO DE LANÇAMENTO BETA */}
        <AccordionItem value="protocolo-beta" className="border-2 border-primary/20 rounded-2xl bg-primary/[0.02] px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary p-3 rounded-xl text-white shadow-lg">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-primary">Protocolo de Lançamento Beta</p>
                <p className="text-sm text-primary/70 font-medium">Siga estes passos para iniciar a operação real</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">1. Configuração de Base</p>
                <p className="text-xs leading-relaxed">Cadastre primeiro as <b>Unidades (UBS)</b> no menu Configurações. Isso permitirá que os pedidos sejam vinculados corretamente a cada localidade de Rio Claro.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">2. Cadastro de Frota e Equipe</p>
                <p className="text-xs leading-relaxed">Insira os <b>Veículos</b> e <b>Motoristas</b> oficiais. Certifique-se de preencher o odômetro inicial para que a telemetria de manutenção funcione.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">3. Início dos Agendamentos</p>
                <p className="text-xs leading-relaxed">Instrua os Gerentes de UBS a cadastrarem os cidadãos (<b>CNS obrigatório</b>) e criarem as solicitações até as 13:00h.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">4. Otimização e Manifesto</p>
                <p className="text-xs leading-relaxed">No final do dia, use o <b>Otimizador de Rotas</b> para agrupar os pedidos e oficializar os manifestos que aparecerão nos celulares dos condutores.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="logistica-hibrida" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-primary/20">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Motor Logístico Híbrido</p>
                <p className="text-sm text-muted-foreground">Como o sistema processa as rotas otimizadas</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <p className="text-sm leading-relaxed">
                O Otimizador de Rotas utiliza um motor híbrido para garantir disponibilidade 24/7. O processamento segue duas etapas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">Processamento IA (Nvidia)</p>
                  <p className="text-xs">Tenta o agrupamento geoespacial avançado por até 25 segundos para reduzir custos de combustível.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Algoritmo de Contingência</p>
                  <p className="text-xs">Caso a rede ou a IA demorem, o sistema aciona instantaneamente o motor local para devolver as rotas por distritos.</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="documentos-impressao" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Gestão de Documentos Oficiais</p>
                <p className="text-sm text-muted-foreground">Impressão de guias de diárias e combustível</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-bold text-sm text-indigo-700">Fluxo de Emissão:</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> O motorista solicita diária/abastecimento no App.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> O Secretário aprova no menu <b>Motoristas &bull; Financeiro</b>.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> A guia profissional (A4) é gerada automaticamente no menu <b>Documentos</b>.</li>
                </ul>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-700 uppercase mb-1">Segurança Jurídica</p>
                <p className="text-xs leading-relaxed">
                  Cada guia impressa contém um ID de documento e um HASH de integridade, permitindo que a Controladoria Municipal valide a autenticidade do documento físico futuramente.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-dashed border-2 bg-muted/5 mt-10">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <HelpCircle className="h-10 w-10 text-muted-foreground opacity-30" />
          <div>
            <p className="font-bold">Suporte Técnico ao Gabinete</p>
            <p className="text-sm text-muted-foreground">Secretaria Municipal de Ordem Pública - Rio Claro, RJ.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
