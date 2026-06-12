"use client";

import { 
  BookOpen, 
  Clock, 
  Rocket,
  History,
  KeyRound,
  Smartphone,
  ClipboardList,
  Users,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UbsHelpPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual da Unidade (UBS)
        </h2>
        <p className="text-muted-foreground italic">Guia de operação local - Portal da UBS v1.1.0 Stable</p>
      </div>

      <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="h-16 w-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Clock className="h-8 w-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-rose-800 uppercase tracking-tighter text-lg">Janela de Agendamento</h4>
          <p className="text-sm text-rose-700 font-medium">
            O sistema aceita novos pedidos de transporte das <b>08:00 às 13:00</b>. Após este horário, a Secretaria realiza a triagem final e montagem dos manifestos para o dia seguinte.
          </p>
        </div>
        <Badge className="bg-rose-600 text-white border-none font-bold hidden md:block">REGRA CRÍTICA</Badge>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Guia de Operação Diária
      </h3>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* NOVO: CADASTRO DE CIDADÃO */}
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
            <p className="text-sm">Para solicitar transporte, o paciente deve estar cadastrado na sua UBS no sistema.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs text-emerald-600 uppercase">CNS é Obrigatório</p>
                <p className="text-xs">O Cartão Nacional de Saúde deve ser inserido sem pontos ou traços para garantir a unicidade do registro.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs text-emerald-600 uppercase">Necessidades Especiais</p>
                <p className="text-xs">Sempre marque a opção "Requer Acompanhante" ou informe o uso de O2 nas notas, pois isso define o tipo de veículo alocado.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* NOVO: SOLICITAÇÃO DE TRANSPORTE */}
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
                  Ao descrever o quadro do paciente, clique no botão <b>"SUGERIR URGÊNCIA (IA)"</b>. O sistema analisará os termos médicos e o destino para indicar a prioridade correta segundo os protocolos municipais.
                </p>
              </div>
            </div>
            <ul className="text-xs space-y-2 pl-4 list-disc">
              <li>Novos agendamentos só podem ser feitos se a <b>Janela de Operação</b> estiver aberta (indicador verde no topo).</li>
              <li>Certifique-se de que o destino esteja correto. O motorista usará essa informação no GPS.</li>
              <li>Acompanhe o status: <b>Pendente</b> (na Secretaria), <b>Aprovado</b> (em Logística) ou <b>Negado</b>.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="citizens" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Acesso do Cidadão</p>
                <p className="text-sm text-muted-foreground">Como o paciente consulta a viagem</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm">Cada agendamento aprovado gera um <b>Código de Acesso</b> de 6 dígitos.</p>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2">
              <p className="text-xs font-bold text-indigo-800 uppercase">Instruções para a Recepção:</p>
              <ul className="text-xs list-disc pl-5 space-y-1 text-indigo-700">
                <li>Acesse a tela &quot;Manifestos de Viagem&quot; no seu menu lateral.</li>
                <li>Localize o paciente e copie o código numérico ao lado do nome.</li>
                <li>Informe ao paciente o link <b>/patient-portal</b> e forneça o código para consulta.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pwa" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Instalação Mobile (PWA)</p>
                <p className="text-sm text-muted-foreground">Transformando o portal em Aplicativo</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm">Para agilizar o trabalho diário, instale o Portal UBS no celular:</p>
            <ol className="text-xs list-decimal pl-5 space-y-2">
              <li>Acesse o link do portal pelo navegador (Chrome/Safari).</li>
              <li>Aguarde o convite de instalação ou clique no menu de opções do navegador.</li>
              <li>Selecione &quot;Instalar Aplicativo&quot; ou &quot;Adicionar à Tela de Início&quot;.</li>
              <li>Ative as notificações para receber alertas de aprovação da Secretaria.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="changelog" className="border-2 border-primary/20 rounded-2xl bg-primary/5 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/20">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-lg text-primary">Novidades da Versão 1.1.0</p>
                  <Badge variant="outline" className="text-[10px] font-black border-primary text-primary bg-white">ESTÁVEL</Badge>
                </div>
                <p className="text-sm text-primary/70 font-medium">Lançamento oficial do SGov FluxoSaúde</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="bg-white p-4 rounded-xl border border-primary/10 shadow-inner">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                <History className="h-3 w-3" /> Histórico de Avanços
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-start gap-2 text-[11px]">
                  <span className="text-primary font-black">&bull;</span>
                  <p><b>Portal do Cidadão:</b> Pacientes agora consultam viagens via código seguro.</p>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <span className="text-primary font-black">&bull;</span>
                  <p><b>Manifestos UBS:</b> Acompanhe em tempo real quem buscará o paciente.</p>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <span className="text-primary font-black">&bull;</span>
                  <p><b>PWA:</b> Instale o portal na tela inicial do seu celular como um App.</p>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <span className="text-primary font-black">&bull;</span>
                  <p><b>IA Nvidia:</b> Sugestão de urgência baseada no protocolo local Rio Claro.</p>
                </div>
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
            <p className="text-sm text-muted-foreground">Contate a Central de Regulação Municipal via rádio ou telefone.</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-10">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">PMRC - Saúde e Ordem Pública - 2024</p>
      </div>
    </div>
  );
}
