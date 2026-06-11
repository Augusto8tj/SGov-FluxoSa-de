"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardList,
  LogOut,
  Settings,
  Hospital
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

const menuItems = [
  { title: "Painel UBS", icon: LayoutDashboard, url: "/ubs-portal" },
  { title: "Nossas Solicitações", icon: ClipboardList, url: "/ubs-portal/requests" },
  { title: "Meus Pacientes", icon: Users, url: "/ubs-portal/patients" },
];

export function UbsSidebar() {
  const { state } = useSidebar();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">
            U
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none text-emerald-700">UBS Central</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Portal da Unidade</span>
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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações">
              <Settings className="size-5" />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sair" className="text-destructive hover:text-destructive" asChild>
              <a href="/">
                <LogOut className="size-5" />
                <span>Voltar ao Início</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
