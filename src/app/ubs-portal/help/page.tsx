
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
        {/* SEÇÃO: INICIANDO NO BETA REAL */}
        <AccordionItem value="inicio-beta" className="border-2 border-emerald-200 rounded-2xl bg-emerald-50/50 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-emerald-700">Como Começar no Teste Beta</p>
                <p className="text-sm text-emerald-600/70 font-medium">Guia para os primeiros agendamentos reais</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-1 flex items-center gap-2">Passos Iniciais</p>
              <div className="space-y-3 text-xs leading-relaxed">
                <p>1. <b>Cadastro de Cidadãos</b>: Acesse "Meus Pacientes" e cadastre os moradores da sua área. O número do CNS é obrigatório para garantir a integridade do banco de dados municipal.</p>
                <p>2. <b>Local de Embarque</b>: Ao solicitar transporte, seja específico sobre o ponto de encontro (Ex: Portaria Leste, Farmácia Municipal, etc). Isso reduz o tempo de busca do motorista.</p>
                <p>3. <b>Código do Cidadão</b>: Ao finalizar o pedido, anote o código de 6 dígitos gerado e entregue ao paciente. Ele servirá para consulta no Portal do Cidadão.</p>
              </div>
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
