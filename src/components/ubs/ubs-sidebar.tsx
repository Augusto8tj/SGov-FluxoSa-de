"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  HelpCircle
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
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { title: "Início UBS", icon: LayoutDashboard, url: "/ubs-portal" },
  { title: "Novas Solicitações", icon: ClipboardList, url: "/ubs-portal/requests" },
  { title: "Meus Pacientes", icon: Users, url: "/ubs-portal/patients" },
];

export function UbsSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            U
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none text-primary">Portal UBS</span>
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
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Suporte Técnico">
              <HelpCircle className="size-5" />
              <span>Suporte Logística</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair" 
              className="text-destructive hover:text-destructive" 
              onClick={logout}
            >
              <LogOut className="size-5" />
              <span>Sair do Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
