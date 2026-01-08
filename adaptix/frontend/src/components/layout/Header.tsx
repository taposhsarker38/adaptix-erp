"use client";

import { MobileSidebar } from "./Sidebar";
import { UserNav } from "./UserNav";
import { NotificationBell } from "./notification-bell";
import { ModeToggle } from "./ModeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-[#0b1120]/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5" />

      <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section - Mobile Menu */}
        <div className="flex items-center gap-4">
          <MobileSidebar />
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

          {/* User Navigation */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
