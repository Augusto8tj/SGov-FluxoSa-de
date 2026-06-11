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
  Rocket,
  Smartphone,
  Heart
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
        <p className="text-muted-foreground italic">Guia de operação estratégica - PMRC v1.0.0 Stable</p>
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
              <Zap className="h-4 w-4" /> IA Nvidia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Otimização de rotas e análise de prioridade clínica automática via Nemotron.</p>
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
        <AccordionItem value="changelog" className="border-2 border-emerald-100 rounded-2xl bg-emerald-50/30 px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg shadow-emerald-200">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-lg text-emerald-700">Novidades da Versão 1.0.0</p>
                  <Badge className="bg-emerald-500 text-white border-none text-[10px]">STABLE</Badge>
                </div>
                <p className="text-sm text-emerald-600/80 font-medium">Lançamento oficial do SGov FluxoSaúde</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Novas Funcionalidades</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• Portal do Cidadão:</b> Consulta via código de 6 dígitos para pacientes.</li>
                  <li className="flex gap-2"><b>• Manifestos UBS:</b> Unidades agora acompanham escalas em tempo real.</li>
                  <li className="flex gap-2"><b>• IA Unificada:</b> Motor Nvidia Nemotron para máxima precisão.</li>
                  <li className="flex gap-2"><b>• PWA:</b> Instalação como app e notificações Web Push.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-1">Operação & Segurança</p>
                <ul className="text-xs space-y-2 list-none">
                  <li className="flex gap-2"><b>• Sigilo Ativo:</b> Mascaramento de nomes em canais públicos.</li>
                  <li className="flex gap-2"><b>• Telemetria:</b> Controle avançado de combustível e manutenção.</li>
                  <li className="flex gap-2"><b>• Temas:</b> Suporte a Verde Saúde, Azul Municipal e Roxo Inovação.</li>
                </ul>
              </div>
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
                <p className="font-bold text-lg">Instalação e Notificações</p>
                <p className="text-sm text-muted-foreground">Como usar o SGov como um App</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6">
            <p className="text-sm">O sistema utiliza tecnologia <b>PWA</b>. Para instalar:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs uppercase mb-2">Instalação</p>
                <p className="text-xs">Clique no banner de instalação ou use a opção "Adicionar à Tela de Início" no seu navegador móvel.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="font-bold text-xs uppercase mb-2">Notificações</p>
                <p className="text-xs">Aceite o pedido de notificações para receber alertas de novas solicitações e emergências em tempo real.</p>
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
            <p className="text-sm">As solicitações chegam com status <b>PENDENTE</b>. Ao aprovar, um manifesto é gerado automaticamente e o paciente pode consultá-lo no portal público usando o código gerado pelo sistema.</p>
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
