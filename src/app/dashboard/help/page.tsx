"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  Rocket,
  History,
  Heart,
  Fingerprint,
  HelpCircle,
  ClipboardList,
  BrainCircuit,
  MapPin,
  CheckCircle2,
  Lock,
  Printer,
  CalendarDays,
  UserCircle,
  Zap,
  Activity,
  FileText
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
        </div>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Protocolos do Gabinete
      </h3>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* SEÇÃO: DADOS DE DEMONSTRAÇÃO */}
        <AccordionItem value="dados-demo" className="border-2 border-emerald-200 rounded-2xl bg-emerald-50/50 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-emerald-700">Dados para Demonstração</p>
                <p className="text-sm text-emerald-600/70 font-medium">Credenciais e códigos para o protótipo</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-1">Acesso ao Portal do Cidadão</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Benedito Silva (Aprovado):</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-mono">102030</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Cecília Meireles (Pendente):</span>
                    <Badge className="bg-amber-100 text-amber-700 border-none font-mono">405060</Badge>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic">Use estes códigos no menu &quot;Portal do Cidadão&quot; para mostrar o status em tempo real.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-1">Usuários de Teste (Senha: admin123)</p>
                <div className="space-y-1 text-xs">
                  <p><b>Secretário:</b> secretario@rioclaro.rj.gov.br</p>
                  <p><b>UBS:</b> gerente.ubs@rioclaro.rj.gov.br</p>
                  <p><b>Motorista:</b> motorista@rioclaro.rj.gov.br</p>
                </div>
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

        <AccordionItem value="fluxo-geral" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Fluxo Operacional de Dados</p>
                <p className="text-sm text-muted-foreground">O caminho da solicitação até o paciente</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-8 pb-6 pt-2">
            <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="flex gap-4 relative pl-1">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 shrink-0">1</div>
                <div>
                  <p className="font-bold text-primary uppercase text-xs">Entrada (UBS)</p>
                  <p className="text-sm">O Gerente da UBS cadastra o cidadão e cria o pedido de transporte até as 13:00h.</p>
                </div>
              </div>
              <div className="flex gap-4 relative pl-1">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 shrink-0">2</div>
                <div>
                  <p className="font-bold text-primary uppercase text-xs">Triagem (Secretaria)</p>
                  <p className="text-sm">O Secretário aprova o pedido no <b>Painel de Comando</b>, podendo usar a IA para classificar a urgência.</p>
                </div>
              </div>
              <div className="flex gap-4 relative pl-1">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 shrink-0">3</div>
                <div>
                  <p className="font-bold text-primary uppercase text-xs">Otimização (Logística)</p>
                  <p className="text-sm">A IA agrupa pacientes no <b>Otimizador de Rotas</b>. O Secretário designa o condutor e cria o <b>Manifesto</b>.</p>
                </div>
              </div>
              <div className="flex gap-4 relative pl-1">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 shrink-0">4</div>
                <div>
                  <p className="font-bold text-primary uppercase text-xs">Execução (Motorista)</p>
                  <p className="text-sm">O motorista recebe a rota no celular, faz o checklist e inicia o transporte.</p>
                </div>
              </div>
              <div className="flex gap-4 relative pl-1">
                <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold z-10 shrink-0">5</div>
                <div>
                  <p className="font-bold text-emerald-600 uppercase text-xs">Transparência (Cidadão)</p>
                  <p className="text-sm">O paciente usa seu código de 6 dígitos no <b>Portal do Cidadão</b> para ver qual viatura irá buscá-lo.</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guia-secretario" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Guia do Secretário / Admin</p>
                <p className="text-sm text-muted-foreground">Gestão estratégica e aprovações</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-xl space-y-2">
                <p className="font-bold text-xs uppercase text-primary">Triagem Técnica</p>
                <p className="text-xs leading-relaxed">Acesse o <b>Painel de Comando</b> para visualizar pedidos pendentes. Use o botão &quot;Analisar com IA&quot; para obter um parecer clínico sem expor nomes reais.</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl space-y-2">
                <p className="font-bold text-xs uppercase text-primary">Logística Inteligente</p>
                <p className="text-xs leading-relaxed">No <b>Otimizador de Rotas</b>, a IA cruzará endereços e veículos. O sistema agora impede que um motorista seja escalado para duas missões simultâneas.</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl space-y-2">
                <p className="font-bold text-xs uppercase text-primary">Auditoria e Segurança</p>
                <p className="text-xs leading-relaxed">A tela de <b>Auditoria</b> exibe a Cadeia de Custódia. Verifique se o selo de integridade está verde, garantindo que nenhum dado foi alterado indevidamente.</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl space-y-2">
                <p className="font-bold text-xs uppercase text-primary">Gestão de Documentos</p>
                <p className="text-xs leading-relaxed">Em <b>Documentos</b>, gere guias de Diárias e Combustível em formato A4 profissional, prontas para impressão e assinatura física.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guia-ia" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-primary/30">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">IA e Sigilo de Dados</p>
                  <Badge className="bg-amber-600 text-white text-[10px]">IMPORTANTE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Como o Nvidia Nemotron processa as informações</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Lock className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
              <div className="space-y-2">
                <p className="font-bold text-amber-900 text-sm">Protocolo de Privacidade e LGPD</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Para estar em conformidade com a LGPD, o SGov FluxoSaúde <b>nunca</b> envia nomes de pacientes ou documentos para os servidores de IA. O sistema processa apenas metadados técnicos.
                  <br/><br/>
                  <b>Sigilo do Condutor:</b> Seguindo normas de Ordem Pública, o Portal do Cidadão nunca exibe o contato pessoal (telefone) dos motoristas, centralizando o suporte via Central de Regulação (192).
                </p>
              </div>
            </div>
            <div className="space-y-2 px-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Funcionalidades de IA Ativas:</p>
              <ul className="text-xs space-y-2 list-none">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Classificação de Urgência (UBS/Secretaria)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Agrupamento de Manifestos (Logística)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Análise de Relatórios de Campo (Briefing Executivo)</li>
              </ul>
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
