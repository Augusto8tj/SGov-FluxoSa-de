
"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSelector } from "@/components/theme-selector";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 overflow-hidden">
            <h1 className="text-xs sm:text-sm font-semibold text-primary truncate">SGov FluxoSaúde - Rio Claro, RJ</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSelector />
            <div className="text-right hidden xs:block">
              <p className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">{user.email?.split('@')[0]}</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase">Autenticado</p>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs shrink-0 uppercase">
              {user.email?.[0] || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
