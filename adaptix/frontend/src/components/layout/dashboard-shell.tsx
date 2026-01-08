"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "./sidebar-context";

// Imports matching original layout.tsx
import Header from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { CompanySetupWizard } from "@/components/onboarding/CompanySetupWizard";
import { AIAssistantWidget } from "@/components/intelligence/ai-assistant-widget";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <AuthGuard>
      <div className="h-full relative min-h-screen bg-gray-50/50 dark:bg-[#0b1120]">
        {/* Sidebar Wrapper - Dynamic Width */}
        <div
          className={cn(
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 md:start-0 z-[80] transition-all duration-300 ease-in-out bg-[#030712] border-r border-white/5",
            isCollapsed ? "md:w-[80px]" : "md:w-72"
          )}
        >
          <Sidebar className="w-full h-full border-none" />
        </div>

        {/* Main Content - Dynamic Margin */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300 ease-in-out flex flex-col",
            isCollapsed ? "md:pl-[80px]" : "md:pl-72"
          )}
        >
          <Header />
          <div className="flex-1 p-6 md:p-8 space-y-6">{children}</div>
          <CompanySetupWizard />
          <AIAssistantWidget />
        </main>
      </div>
    </AuthGuard>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
