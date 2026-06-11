
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Ambulance, BrainCircuit, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de delay de rede
    setTimeout(() => {
      setLoading(false);
      
      // Superusuário Hardcoded
      if (email === "admin@rioclaro.rj.gov.br" && password === "admin123") {
        toast({
          title: "Acesso de Superusuário",
          description: "Bem-vindo ao centro de comando administrativo.",
        });
        router.push("/dashboard");
        return;
      }

      // Lógica de acesso por perfil para testes rápidos
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes("secretario")) {
        router.push("/dashboard");
      } else if (lowerEmail.includes("ubs")) {
        router.push("/ubs-portal");
      } else if (lowerEmail.includes("motorista")) {
        router.push("/driver");
      } else {
        toast({
          title: "Acesso Negado",
          description: "Credenciais inválidas ou usuário não reconhecido.",
          variant: "destructive"
        });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Ambulance className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary">SGov FluxoSaúde</h1>
          <p className="text-muted-foreground font-medium">Prefeitura de Rio Claro - RJ</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>Acesse sua plataforma de gestão ou operação.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-[10px] text-primary font-medium">
                  Use <strong>admin@rioclaro.rj.gov.br</strong> / <strong>admin123</strong> para acesso total.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail Institucional</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="ex: admin@rioclaro.rj.gov.br" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Autenticar Acesso
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <BrainCircuit className="h-3 w-3" /> Segurança Monitorada por IA
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          2026 - Secretaria Municipal de Ordem Pública - PMRC
        </p>
      </div>
    </div>
  );
}
