"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Settings as SettingsIcon,
  CreditCard,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserNav() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative flex items-center gap-2 h-10 px-2 md:px-3 rounded-xl",
            "bg-slate-100/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10",
            "border border-slate-200/50 dark:border-white/10",
            "transition-all duration-200"
          )}
        >
          {/* Avatar with online indicator */}
          <div className="relative">
            <Avatar className="h-7 w-7 ring-2 ring-emerald-500/30">
              <AvatarImage src="/avatars/01.png" alt="@user" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                TS
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          {/* Name - hidden on mobile */}
          <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
            Taposh
          </span>
          <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-white/10 shadow-xl"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
              <AvatarImage src="/avatars/01.png" alt="@user" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                TS
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Taposh Sarker
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                admin@adaptix.com
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Super Admin
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-white/10" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5">
            <User className="h-4 w-4 text-slate-500" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5">
            <SettingsIcon className="h-4 w-4 text-slate-500" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5">
            <CreditCard className="h-4 w-4 text-slate-500" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-white/10" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
