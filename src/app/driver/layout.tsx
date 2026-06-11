
import { Metadata } from "next";
import { ThemeSelector } from "@/components/theme-selector";

export const metadata: Metadata = {
  title: 'SGov Motorista - Rio Claro, RJ',
  description: 'Módulo móvel para motoristas de transporte sanitário',
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body antialiased pb-20 max-w-md mx-auto border-x shadow-xl">
      <header className="bg-primary p-4 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white text-primary font-bold p-1 rounded">RC</div>
            <h1 className="font-bold tracking-tight">SGov Motorista - RJ</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              CS
            </div>
          </div>
        </div>
      </header>
      <main className="p-4">
        {children}
      </main>
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
        <a href="/driver" className="flex flex-col items-center p-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span className="text-[10px] font-bold mt-1">Início</span>
        </a>
        <a href="/driver/guidelines" className="flex flex-col items-center p-2 text-slate-400 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <span className="text-[10px] font-bold mt-1">Protocolos</span>
        </a>
      </nav>
    </div>
  );
}
