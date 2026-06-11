"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Ambulance,
  Hospital,
  MapPin,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Settings,
  MessageSquare
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Agendamentos", icon: ClipboardList, url: "/dashboard/requests" },
  { title: "Pacientes", icon: Users, url: "/dashboard/patients" },
  { title: "Veículos", icon: Ambulance, url: "/dashboard/fleet" },
  { title: "Postos (UBS)", icon: Hospital, url: "/dashboard/ubs" },
  { title: "Otimizador de Rotas", icon: MapPin, url: "/dashboard/routes" },
  { title: "Relatórios de Campo", icon: MessageSquare, url: "/dashboard/reports" },
  { title: "Painel de Comando", icon: ShieldCheck, url: "/dashboard/admin" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            S
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none">FluxoSaúde</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rio Claro - RJ</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu className="px-2 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="px-3 pb-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
            {state !== "collapsed" && "Versão 1.0.0 Stable"}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações" asChild>
              <a href="/dashboard/settings" className="flex items-center gap-3">
                <Settings className="size-5" />
                <span>Configurações</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair" 
              className="text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="size-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}