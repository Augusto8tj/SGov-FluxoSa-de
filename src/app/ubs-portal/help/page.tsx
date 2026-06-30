"use client";

import { 
  BookOpen, 
  Clock, 
  Rocket,
  History,
  ClipboardList,
  Users,
  BrainCircuit,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  UserCircle,
  Lock,
  Navigation,
  Activity,
  ShieldCheck
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UbsHelpPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual de Operação da Unidade (UBS)
        </h2>
        <p className="text-muted-foreground italic">Guia de gestão local de transporte sanitário - Portal UBS v1.2.0 Stable</p>
      </div>

      <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="h-16 w-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Clock className="h-8 w-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-rose-800 uppercase tracking-tighter text-lg">Janela de Agendamento Crítica</h4>
          <p className="text-sm text-rose-700 font-medium">
            O sistema aceita novos pedidos de transporte das <b>08:00 às 13:00</b> para o dia seguinte. Após este horário, o botão de confirmação é bloqueado automaticamente para que a Secretaria possa planejar as rotas.
          </p>
        </div>
        <Badge className="bg-rose-600 text-white border-none font-bold hidden md:block">REGRA DE OURO</Badge>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Guia de Operação Diária
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
                <p className="text-sm text-emerald-600/70 font-medium">Códigos de acesso para o protótipo</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-1 flex items-center gap-2"><KeyRound className="h-3 w-3" /> Acesso do Cidadão</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold">Benedito Silva (Aprovado):</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-mono">102030</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold">Cecília Meireles (Pendente):</span>
                  <Badge className="bg-amber-100 text-amber-700 border-none font-mono">405060</Badge>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground italic">Use estes códigos para demonstrar ao paciente como ele pode acompanhar sua viagem em tempo real.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="protocolo-embarque" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-primary/20">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Protocolo de Embarque</p>
                <p className="text-sm text-muted-foreground">Definição precisa do local de coleta</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <p className="text-xs leading-relaxed">
                Ao criar uma solicitação, o campo <b>&quot;Local de Embarque&quot;</b> é obrigatório. Ele define onde o paciente aguardará a viatura.
              </p>
              <ul className="text-[11px] list-disc pl-4 space-y-1 font-medium">
                <li>Se for na UBS, especifique a portaria (Ex: UBS Central - Setor A).</li>
                <li>Se for coleta externa, insira o endereço completo ou ponto de referência.</li>
                <li>Este dado aparece no GPS do motorista e no Portal do Cidadão, reduzindo o tempo de espera.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cadastro" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Base de Cidadãos</p>
                <p className="text-sm text-muted-foreground">Como manter o prontuário digital em dia</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <p className="text-sm px-2">Para solicitar transporte, o paciente deve estar cadastrado na sua UBS no sistema.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs text-emerald-600 uppercase">CNS é Obrigatório</p>
                <p className="text-xs">O Cartão Nacional de Saúde deve ser inserido corretamente para garantir a unicidade do registro municipal.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs text-emerald-600 uppercase">Necessidades Especiais</p>
                <p className="text-xs">Sinalize sempre se o paciente requer maca, cadeira de rodas ou acompanhante para a correta triagem da viatura pela Secretaria.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ia-sigilo" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-amber-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Sigilo e LGPD</p>
                <p className="text-sm text-muted-foreground">Proteção de dados do motorista e paciente</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-xs leading-relaxed text-amber-800">
                <b>Importante:</b> Seguindo as diretrizes de Ordem Pública e LGPD, o Portal do Cidadão nunca exibe o contato pessoal (telefone) dos motoristas. Caso o paciente precise de suporte ou informações sobre atrasos, ele deve utilizar a Central de Regulação exibida no portal.
              </p>
              <Separator className="my-3 bg-amber-200" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <p className="text-[10px] font-black uppercase text-amber-700">Privacidade Garantida pela PMRC</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="solicitacao" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Solicitando Transporte</p>
                <p className="text-sm text-muted-foreground">Regras de envio para a Secretaria</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <BrainCircuit className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Use o Sugestor de Urgência (IA)</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Ao descrever o quadro do paciente, clique no botão <b>&quot;SUGERIR URGÊNCIA (IA)&quot;</b>. O sistema classificará automaticamente entre Baixa, Média, Alta ou Crítica baseado nos protocolos de triagem municipal.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="portal-cidadao" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-indigo-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Transparência e Cidadão</p>
                <p className="text-sm text-muted-foreground">Como o paciente acompanha a viagem</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <p className="text-sm px-2">Cada solicitação gera automaticamente um <b>Código de Acesso de 6 dígitos</b>.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="font-bold text-xs text-indigo-700 uppercase">Entrega do Código</p>
                <p className="text-xs">Forneça o código ao paciente no momento do agendamento. Ele pode consultar em <b>rioclaro.rj.gov.br/meu-transporte</b> ou usando o código de teste demo.</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="font-bold text-xs text-indigo-700 uppercase">Segurança de Dados</p>
                <p className="text-xs">O Portal do Cidadão não exibe o nome completo ou o diagnóstico, apenas o status da viatura, placa do veículo e o horário previsto.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-dashed border-2 bg-muted/5 mt-10">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="h-10 w-10 text-rose-500 opacity-20" />
          <div>
            <p className="font-bold">Dúvida Operacional?</p>
            <p className="text-sm text-muted-foreground">Contate a Central de Regulação Municipal via rádio ou telefone para autorizações excepcionais fora da janela.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
