"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  FileText,
  LifeBuoy,
  Settings,
  User,
  Menu,
  Bot,

} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <LifeBuoy className="h-6 w-6 text-primary" />
            <span className="text-lg group-data-[state=collapsed]:hidden">
              Aarobot Hub
            </span>
          </Link>
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                isActive={isActive("/")}
                asChild
              >
                <Link href="/">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
    
        
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="View Reports"
                isActive={isActive("/reports")}
                asChild
              >
                <Link href="/reports">
                  <FileText />
                  <span>View Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="AI Assistant"
                isActive={isActive("/chatbot")}
                asChild
              >
                <Link href="/chatbot">
                  <Bot />
                  <span>AI Assistant</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings"
                isActive={isActive("/settings")}
                asChild
              >
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Profile"
                isActive={isActive("/profile")}
                asChild
              >
                <Link href="/profile">
                  <User />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign Out"
                asChild
              >
            \
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <LifeBuoy className="h-6 w-6 text-primary" />
            <span className="text-lg">Aarobot Hub</span>
          </Link>
          <SidebarTrigger>
            <Menu />
            <span className="sr-only">Toggle menu</span>
          </SidebarTrigger>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
