
import { UbsSidebar } from "@/components/ubs/ubs-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function UbsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <UbsSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 overflow-hidden">
            <h1 className="text-xs sm:text-sm font-semibold text-emerald-700 truncate">Portal UBS - Central Rio Claro</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-right hidden xs:block">
              <p className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">Enf. Márcia</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase">Gerente</p>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] sm:text-xs shrink-0">
              MO
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
