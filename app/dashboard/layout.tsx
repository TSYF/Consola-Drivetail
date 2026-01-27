"use client";

import React from "react";

import { AppSidebar } from "@/components/organisms/app-sidebar";
import { DashboardHeader } from "@/components/organisms/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-auto bg-muted/20">
              <div className="container mx-auto p-6">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
