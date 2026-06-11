
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ShieldCheck, Loader2, Ambulance, BrainCircuit, AlertCircle, User, Key, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const lowerEmail = email.toLowerCase();

    // 1. Priorizar acesso de demonstração para evitar erros de API Key em ambiente de prototipagem
    if (lowerEmail.endsWith("@rioclaro.rj.gov.br") && password === "admin123") {
      toast({
        title: "Acesso de Demonstração",
        description: `Bem-vindo, entrando no modo de teste.`,
      });

      if (lowerEmail.includes("motorista")) {
        router.push("/driver");
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
      return;
    }

    // 2. Tentar autenticação real apenas se não for uma credencial de demonstração padrão
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Acesso Autorizado",
        description: `Bem-vindo ao SGov FluxoSaúde.`,
      });

      if (lowerEmail.includes("motorista")) {
        router.push("/driver");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      
      let message = "Credenciais inválidas. Use os atalhos de demonstração abaixo.";
      
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/network-request-failed') {
        message = "O Firebase não está configurado. Utilize os botões de demonstração.";
      }

      toast({
        title: "Falha na Autenticação",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'admin' | 'ubs' | 'driver') => {
    const creds = {
      admin: { email: 'secretario@rioclaro.rj.gov.br', pass: 'admin123' },
      ubs: { email: 'gerente.ubs@rioclaro.rj.gov.br', pass: 'admin123' },
      driver: { email: 'motorista@rioclaro.rj.gov.br', pass: 'admin123' }
    };
    setEmail(creds[type].email);
    setPassword(creds[type].pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/10">
            <Ambulance className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary">SGov FluxoSaúde</h1>
          <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Prefeitura de Rio Claro - RJ</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Entrar no Sistema</CardTitle>
            <CardDescription>Gestão e Operação de Transporte Sanitário</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Institucional</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="usuario@rioclaro.rj.gov.br" 
                    className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-950/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha de Acesso</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-950/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold">
                    <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">Atalhos de Demonstração</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-9 px-1 font-bold border-primary/20 hover:bg-primary/5"
                    onClick={() => fillCredentials('admin')}
                  >
                    SECRETÁRIO
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-9 px-1 font-bold border-emerald-500/20 hover:bg-emerald-500/5"
                    onClick={() => fillCredentials('ubs')}
                  >
                    UBS
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-9 px-1 font-bold border-amber-500/20 hover:bg-amber-500/5"
                    onClick={() => fillCredentials('driver')}
                  >
                    <Truck className="h-3 w-3 mr-1" /> MOTORISTA
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                Autenticar Acesso
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" /> IA & Segurança Rio Claro
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground font-medium">
          © 2026 - Secretaria Municipal de Ordem Pública - PMRC
        </p>
      </div>
    </div>
  );
}
