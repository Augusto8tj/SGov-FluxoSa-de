
"use client";

import { ThemeSelector } from "@/components/theme-selector";
import { Ambulance, Heart } from "lucide-react";
import Link from "next/link";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body antialiased flex flex-col items-center">
      <header className="w-full max-w-md bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/patient-portal" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Ambulance className="size-5" />
          </div>
          <span className="font-black text-primary tracking-tight uppercase text-sm">Meu Transporte</span>
        </Link>
        <ThemeSelector />
      </header>
      
      <main className="flex-1 w-full max-w-md p-4 pb-20">
        {children}
      </main>

      <footer className="w-full max-w-md p-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <Heart className="size-3 text-rose-500 fill-rose-500" /> PMRC &bull; Rio Claro, RJ
        </div>
        <p className="text-[9px] text-muted-foreground/60">Este é um canal público. Suas informações clínicas são preservadas.</p>
      </footer>
    </div>
  );
}
