
"use client";

import { 
  BookOpen, 
  Hospital, 
  Clock, 
  Users, 
  ClipboardList, 
  MapPin, 
  Route,
  ShieldAlert,
  PhoneCall
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function UbsHelpPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual da Unidade (UBS)
        </h2>
        <p className="text-muted-foreground italic">Guia de operação local - Portal da UBS v1.0</p>
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

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="requests" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Como solicitar transporte</p>
                <p className="text-sm text-muted-foreground">Fluxo correto de agendamento</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-sm">Selecione o paciente na sua <b>Base de Cidadãos</b>. Se não encontrar, cadastre-o primeiro com o CNS correto.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-sm">Descreva detalhadamente a condição clínica nas <b>Notas</b>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-sm">Use o botão <b>"SUGERIR URGÊNCIA (IA)"</b> para classificar o pedido conforme os protocolos municipais.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="manifests" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Manifestos de Viagem</p>
                <p className="text-sm text-muted-foreground">Acompanhamento logístico</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm">A tela de <b>Manifestos</b> é a ferramenta da recepção para informar os pacientes. Lá você encontrará:</p>
            <ul className="text-sm list-disc pl-5 space-y-2">
              <li>A viatura designada (Ambulância, Van, etc).</li>
              <li>O nome do condutor responsável.</li>
              <li>O horário exato de saída planejado.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Urgências e Erros</p>
                <p className="text-sm text-muted-foreground">Protocolos de emergência</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-4">
              <PhoneCall className="h-8 w-8 text-amber-600" />
              <div>
                <p className="font-bold text-sm text-amber-800">Cancelamento Imediato</p>
                <p className="text-xs text-amber-700">Para cancelar um transporte que já está em rota, ligue imediatamente para o ramal da Logística: (19) 3526-0000.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="text-center py-10">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">PMRC - Saúde e Ordem Pública - 2024</p>
      </div>
    </div>
  );
}
