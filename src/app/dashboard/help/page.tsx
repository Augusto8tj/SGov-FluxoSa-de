
"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  Ambulance, 
  BrainCircuit, 
  Zap, 
  Users, 
  MapPin,
  Clock,
  HelpCircle,
  History,
  Rocket
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
        <p className="text-muted-foreground italic">Guia de operação estratégica - PMRC v1.0</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Perfil Secretaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Acesso total à gestão de frota, usuários e aprovações de transporte.</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4" /> IA Nvidia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Otimização de rotas e análise de prioridade clínica automática.</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4" /> Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Monitoramento de veículos em rota e feedbacks dos condutores.</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="changelog" className="border-2 border-emerald-100 rounded-2xl bg-emerald-50/30 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg shadow-emerald-200">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-lg text-emerald-700">Novidades da Versão 1.0</p>
                  <Badge className="bg-emerald-500 text-white border-none text-[10px]">STABLE</Badge>
                </div>
                <p className="text-sm text-emerald-600/80 font-medium">Veja o que há de novo no FluxoSaúde</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Funcionalidades</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• IA Unificada:</b> Modelo Nvidia Nemotron para alta performance.</li>
                  <li className="flex gap-2"><b>• PWA:</b> Sistema autoinstalável em qualquer dispositivo.</li>
                  <li className="flex gap-2"><b>• Telemetria:</b> Controle de combustível, odômetro e manutenção.</li>
                  <li className="flex gap-2"><b>• Notificações:</b> Alertas em tempo real via Web Push.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Operação</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• Feedbacks:</b> Relatórios de campo enviados pelos motoristas.</li>
                  <li className="flex gap-2"><b>• Sigilo:</b> Pseudonimização automática de dados sensíveis.</li>
                  <li className="flex gap-2"><b>• RBAC:</b> Controle de acesso robusto baseado em perfis.</li>
                  <li className="flex gap-2"><b>• Temas:</b> Verde Saúde, Azul Municipal e Roxo Inovação.</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="approvals" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Triagem e Aprovações</p>
                <p className="text-sm text-muted-foreground">Como autorizar pedidos das UBS</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm">As solicitações chegam com status <b>PENDENTE</b>. Você deve:</p>
            <ul className="text-sm list-disc pl-5 space-y-2">
              <li>Analisar a prioridade clínica enviada pela UBS.</li>
              <li>Utilizar o botão <b>"ANALISAR"</b> para obter apoio da IA Nvidia sobre a urgência.</li>
              <li>Aprovar para gerar um manifesto ou Negar caso a solicitação não cumpra os requisitos.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fleet" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Ambulance className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Gestão de Frota</p>
                <p className="text-sm text-muted-foreground">Telemetria e Manutenção</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs uppercase mb-2">Telemetria</p>
                <p className="text-xs">Mantenha o odômetro e nível de combustível atualizados para que a IA possa sugerir revisões preventivas.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs uppercase mb-2">Sanitização</p>
                <p className="text-xs">O registro de última sanitização é crítico para o cumprimento dos protocolos de biossegurança municipal.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ia" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Laboratório de IA</p>
                <p className="text-sm text-muted-foreground">Entendendo o motor do sistema</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm italic leading-relaxed">
              O SGov FluxoSaúde utiliza o modelo <b>Nvidia Nemotron Nano 9B</b> via OpenRouter como padrão. Este modelo foi escolhido pela alta velocidade e precisão em termos técnicos de saúde.
            </p>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="font-bold text-sm text-purple-700 mb-2">Privacidade (Sigilo Ativo)</p>
              <p className="text-xs text-purple-600">
                O sistema realiza a <b>pseudonimização</b> dos dados antes de enviá-los para a nuvem. Nomes de pacientes são mascarados e apenas informações clínicas e logísticas são processadas pela IA.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-dashed border-2 bg-muted/5">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <HelpCircle className="h-10 w-10 text-muted-foreground opacity-30" />
          <div>
            <p className="font-bold">Ainda precisa de ajuda?</p>
            <p className="text-sm text-muted-foreground">Contate o suporte técnico da Secretaria de Ordem Pública pelo ramal 110.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
