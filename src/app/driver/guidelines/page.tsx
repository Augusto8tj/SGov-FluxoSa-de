import { 
  ShieldAlert, 
  PhoneCall, 
  Stethoscope, 
  Map, 
  FileText,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuidelinesPage() {
  const protocols = [
    { title: "Emergência Clínica", icon: Stethoscope, description: "Protocolo de parada cardiorrespiratória e convulsão durante o trajeto.", color: "bg-rose-100 text-rose-700" },
    { title: "Transporte de Macas", icon: ShieldAlert, description: "Normas de fixação e segurança para pacientes acamados.", color: "bg-amber-100 text-amber-700" },
    { title: "Incidentes de Trânsito", icon: AlertTriangle, description: "O que fazer em caso de colisão ou falha mecânica do veículo.", color: "bg-orange-100 text-orange-700" },
    { title: "Documentação", icon: FileText, description: "Como preencher o manifesto de viagem e relatórios de ocorrência.", color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Central de Protocolos</h2>
        <p className="text-xs text-slate-500">Orientações de segurança e conduta municipal.</p>
      </div>

      <Card className="bg-rose-600 text-white border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase opacity-80">Linha Direta Logística</p>
              <p className="text-2xl font-black">(19) 3526-0000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {protocols.map((protocol, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`${protocol.color} p-2.5 rounded-xl`}>
                  <protocol.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">{protocol.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{protocol.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase">Última Atualização</p>
        <p className="text-xs text-slate-600 font-medium mt-1">Sexta-feira, 16 de Maio de 2024</p>
      </div>
    </div>
  );
}
