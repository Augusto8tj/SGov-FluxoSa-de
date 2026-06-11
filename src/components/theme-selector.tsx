
"use client";

import * as React from "react";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Theme = "blue" | "green" | "purple";
type Mode = "light" | "dark";

export function ThemeSelector() {
  const [theme, setTheme] = React.useState<Theme>("blue");
  const [mode, setMode] = React.useState<Mode>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    const savedMode = localStorage.getItem("app-mode") as Mode;
    if (savedTheme) setTheme(savedTheme);
    if (savedMode) setMode(savedMode);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Clean classes
    root.classList.remove("theme-green", "theme-purple", "dark");
    
    // Apply theme
    if (theme === "green") root.classList.add("theme-green");
    if (theme === "purple") root.classList.add("theme-purple");
    
    // Apply mode
    if (mode === "dark") root.classList.add("dark");
    
    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-mode", mode);
  }, [theme, mode, mounted]);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Trocar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estilo das Cores</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("blue")} className="justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span>Azul Clássico</span>
          </div>
          {theme === "blue" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("green")} className="justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-emerald-600" />
            <span>Verde Natureza</span>
          </div>
          {theme === "green" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple")} className="justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-purple-600" />
            <span>Roxo Imperial</span>
          </div>
          {theme === "purple" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Luminosidade</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setMode("light")} className="justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Modo Dia</span>
          </div>
          {mode === "light" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")} className="justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Modo Noite</span>
          </div>
          {mode === "dark" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
