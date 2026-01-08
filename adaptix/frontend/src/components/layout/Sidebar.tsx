"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  ShoppingBag,
  Package,
  ShoppingCart,
  Tags,
  Menu,
  Scale,
  UserCog,
  Shield,
  Lock,
  LogOut,
  Contact,
  Ticket,
  Monitor,
  Brain,
  ChartColumn,
  Briefcase,
  Factory,
  ShieldCheck,
  Truck,
  History,
  Eye,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  PanelLeftClose,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { getPermissions, isSuperUser } from "@/lib/auth";
import { useSidebar } from "./sidebar-context";

// Simple Tooltip Component for Sidebar
const SidebarTooltip = ({
  children,
  content,
  isCollapsed,
}: {
  children: React.ReactNode;
  content: string;
  isCollapsed: boolean;
}) => {
  if (!isCollapsed) return <>{children}</>;

  return (
    <div className="group/tooltip relative flex items-center">
      {children}
      <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none shadow-lg border border-white/10">
        {content}
      </div>
    </div>
  );
};

interface SidebarRoute {
  label: string;
  icon: any;
  href?: string;
  permission?: string | null;
  exactMatch?: boolean; // For routes that should only match exact path (like Dashboard)
  children?: {
    label: string;
    href: string;
    permission?: string | null;
  }[];
}

const routes: SidebarRoute[] = [
  {
    label: "dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: null,
    exactMatch: true, // Dashboard should only match exact /dashboard path
  },
  {
    label: "operations",
    icon: ShoppingBag,
    children: [
      {
        label: "customers",
        href: "/dashboard/customers",
        permission: "view_customer",
      },
      {
        label: "customerPortal",
        href: "/dashboard/customer/portal",
        permission: "view_customer",
      },
      {
        label: "inventory",
        href: "/dashboard/inventory",
        permission: "view_inventory",
      },
      {
        label: "pos",
        href: "/dashboard/pos",
        permission: "view_pos",
      },
      {
        label: "orders",
        href: "/dashboard/orders",
        permission: "view_pos",
      },
      {
        label: "products",
        href: "/dashboard/products",
        permission: "view_product",
      },
      {
        label: "categories",
        href: "/dashboard/categories",
        permission: "view_product",
      },
      {
        label: "brands",
        href: "/dashboard/brands",
        permission: "view_product",
      },
      { label: "units", href: "/dashboard/units", permission: "view_product" },
      {
        label: "purchaseAnalytics",
        href: "/dashboard/purchase",
        permission: "view_purchase",
      },
      {
        label: "rfqManagement",
        href: "/dashboard/purchase/rfqs",
        permission: "view_purchase",
      },
      {
        label: "vendorPortal",
        href: "/dashboard/purchase/portal",
        permission: "view_purchase",
      },
      {
        label: "vendors",
        href: "/dashboard/purchase/vendors",
        permission: "view_purchase",
      },
      {
        label: "accounting",
        href: "/dashboard/accounting",
        permission: "view_accounting",
      },
      {
        label: "logistics",
        href: "/dashboard/logistics",
        permission: null,
      },
      {
        label: "riderDashboard",
        href: "/dashboard/logistics/rider",
        permission: null,
      },
      { label: "assets", href: "/dashboard/assets", permission: "view_asset" },
    ],
  },
  {
    label: "humanResources",
    icon: Users,
    children: [
      { label: "hrPortal", href: "/dashboard/hr", permission: "view_hr" },
      { label: "leaves", href: "/dashboard/hr/leaves", permission: "view_hr" },
      {
        label: "projects",
        href: "/dashboard/projects",
        permission: "view_project",
      },
    ],
  },
  {
    label: "productionQuality",
    icon: Factory,
    children: [
      {
        label: "manufacturing",
        href: "/dashboard/manufacturing",
        permission: "view_manufacturing",
      },
      {
        label: "shopFloor",
        href: "/dashboard/manufacturing/shop-floor",
        permission: "view_manufacturing",
      },
      {
        label: "qualityControl",
        href: "/dashboard/quality",
        permission: "view_quality",
      },
    ],
  },
  {
    label: "intelligenceHub",
    icon: Brain,
    children: [
      {
        label: "predictiveMaintenance",
        href: "/dashboard/assets/maintenance",
        permission: null,
      },
      {
        label: "businessAI",
        href: "/dashboard/intelligence",
        permission: "view_forecast",
      },
      {
        label: "demandForecasting",
        href: "/dashboard/intelligence/forecasts",
        permission: "view_forecast",
      },
      {
        label: "financialIntelligence",
        href: "/dashboard/intelligence/finance",
        permission: "view_forecast",
      },
      {
        label: "visionHub",
        href: "/dashboard/intelligence/vision-hub",
        permission: "view_forecast",
      },
      {
        label: "generalAnalytics",
        href: "/dashboard/analytics",
        permission: "view_analytics",
      },
    ],
  },
];

const adminRouteGroup: SidebarRoute = {
  label: "administration",
  icon: Shield,
  children: [
    { label: "users", href: "/dashboard/admin/users", permission: "view_user" },
    {
      label: "organizationHub",
      href: "/dashboard/organization",
      permission: "view_settings",
    },
    { label: "roles", href: "/dashboard/admin/roles", permission: "view_role" },
    {
      label: "permissions",
      href: "/dashboard/admin/permissions",
      permission: "view_permission",
    },
    {
      label: "auditLogs",
      href: "/dashboard/admin/audit",
      permission: "view_audit_log",
    },
    {
      label: "securityCenter",
      href: "/dashboard/security",
      permission: "view_audit_log",
    },
    {
      label: "systemOps",
      href: "/dashboard/ops",
      permission: "view_settings",
    },
    {
      label: "settings",
      href: "/dashboard/settings",
      permission: "view_settings",
    },
  ],
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuper, setIsSuper] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Use global context
  const { isCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    setIsClient(true);
    const perms = getPermissions();
    setPermissions(perms);
    setIsSuper(isSuperUser());

    // Auto-collapse open groups when sidebar collapses (optional, but good UX)
    if (isCollapsed) {
      setOpenGroups([]);
    }
  }, [isCollapsed]);

  // Helper function to check if current path matches a route (used for auto-expand)
  const isPathActiveHelper = (routeHref: string): boolean => {
    const normalizedPathname = pathname.replace(/\/$/, "");
    const normalizedHref = routeHref.replace(/\/$/, "");
    return (
      normalizedPathname === normalizedHref ||
      normalizedPathname.startsWith(normalizedHref + "/")
    );
  };

  // Auto-expand menu groups that contain an active child and collapse others
  useEffect(() => {
    const allRoutes = [...routes, adminRouteGroup];
    const groupsToExpand: string[] = [];

    allRoutes.forEach((route) => {
      if (route.children) {
        const hasActiveChild = route.children.some((child) =>
          isPathActiveHelper(child.href)
        );
        if (hasActiveChild) {
          groupsToExpand.push(route.label);
        }
      }
    });

    // Only keep active groups expanded, collapse others
    setOpenGroups(groupsToExpand);
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const t = useTranslations("Sidebar");
  const locale = useLocale();

  const filterRoute = (route: SidebarRoute): SidebarRoute | null => {
    if (!isClient) return null;
    if (isSuper) return route;

    // Check parent permission
    if (route.permission && !permissions.includes(route.permission)) {
      return null;
    }

    // Check children
    if (route.children) {
      const visibleChildren = route.children.filter((child) => {
        if (!child.permission) return true;
        return permissions.includes(child.permission);
      });

      if (visibleChildren.length === 0) return null;
      return { ...route, children: visibleChildren };
    }

    return route;
  };

  const visibleRoutes = routes
    .map(filterRoute)
    .filter((route): route is SidebarRoute => route !== null);
  const visibleAdminRoute = filterRoute(adminRouteGroup);

  const renderRoute = (route: SidebarRoute) => {
    const isExpanded = openGroups.includes(route.label);
    const hasChildren = route.children && route.children.length > 0;

    // Helper function to check if current path matches a route
    const isPathActive = (routeHref: string): boolean => {
      // Normalize paths by removing trailing slashes
      const normalizedPathname = pathname.replace(/\/$/, "");
      const normalizedHref = routeHref.replace(/\/$/, "");

      // Check for exact match or if current path starts with route + /
      return (
        normalizedPathname === normalizedHref ||
        normalizedPathname.startsWith(normalizedHref + "/")
      );
    };

    // For top-level routes with exactMatch, only match exact path
    const isActive = route.href
      ? route.exactMatch
        ? pathname.replace(/\/$/, "") === route.href.replace(/\/$/, "")
        : isPathActive(route.href)
      : route.children?.some((c) => isPathActive(c.href));

    return (
      <div key={route.label} className="w-full">
        {route.href ? (
          <SidebarTooltip content={t(route.label)} isCollapsed={isCollapsed}>
            <Link
              href={route.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-2"
              )}
            >
              {/* Active left indicator bar - hidden in collapsed */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full shadow-lg shadow-emerald-500/50" />
              )}
              {/* Active background indicator for collapsed mode */}
              {isActive && isCollapsed && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30" />
              )}

              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 relative z-10",
                  isActive
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40"
                    : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                )}
              >
                <route.icon className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <span className={cn(isActive && "font-semibold")}>
                  {t(route.label)}
                </span>
              )}
            </Link>
          </SidebarTooltip>
        ) : (
          <SidebarTooltip content={t(route.label)} isCollapsed={isCollapsed}>
            <button
              onClick={() => {
                if (isCollapsed) {
                  toggleSidebar(); // Auto expand sidebar
                  if (!isExpanded) toggleGroup(route.label);
                } else {
                  toggleGroup(route.label);
                }
              }}
              className={cn(
                "group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-500/15 to-transparent text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-2"
              )}
            >
              {/* Active left indicator bar for parent with active child */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-400/50 to-teal-500/50 rounded-r-full" />
              )}
              {/* Active indicator for collapsed */}
              {isActive && isCollapsed && (
                <div className="absolute inset-x-2 top-1 bottom-1 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg" />
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-emerald-500/40 to-teal-500/40 text-emerald-400"
                      : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <span className={cn(isActive && "font-semibold")}>
                    {t(route.label)}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-500 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              )}
            </button>
          </SidebarTooltip>
        )}

        {/* Collapsible Children - Only show when NOT collapsed */}
        {!isCollapsed && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {hasChildren && (
              <div className="ml-[22px] mt-1 space-y-0.5 border-l border-white/10 pl-4">
                {route.children?.map((child) => {
                  const isChildActive = isPathActive(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm transition-all duration-200",
                        isChildActive
                          ? "text-white bg-gradient-to-r from-emerald-500/20 to-transparent font-semibold"
                          : "text-slate-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {/* Active indicator dot */}
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200 flex-shrink-0",
                          isChildActive
                            ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/30"
                            : "bg-slate-600 group-hover:bg-slate-400"
                        )}
                      />
                      <span>{t(child.label)}</span>
                      {/* Active arrow indicator */}
                      {isChildActive && (
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#030712]/95 backdrop-blur-xl text-white border-r border-white/5 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-72",
        className
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex items-center p-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-white font-black text-lg">A</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Adaptix
              </h1>
              <p className="text-[9px] uppercase tracking-[0.15em] text-emerald-400/70 font-semibold">
                Intelligent Business OS
              </p>
            </div>
          </Link>
        )}

        {/* Toggle Button - Shows as logo when collapsed, or arrow when expanded */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5",
            isCollapsed && "mt-1 mb-2"
          )}
        >
          {isCollapsed ? (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-white font-black text-lg">A</span>
              </div>
            </div>
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
          isCollapsed && "px-2 scrollbar-none" // Hide scrollbar in mini mode
        )}
      >
        <div className="space-y-1">{visibleRoutes.map(renderRoute)}</div>

        {visibleAdminRoute && (
          <div className="pt-4 mt-4 border-t border-white/5">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {t("systemManagement")}
              </p>
            )}
            {renderRoute(visibleAdminRoute)}
          </div>
        )}
      </div>

      {/* User Quick Actions / Logout */}
      <div
        className={cn(
          "p-3 mt-auto border-t border-white/5",
          isCollapsed && "p-2"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors",
            isCollapsed
              ? "p-2 flex justify-center bg-transparent border-0"
              : "p-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            {/* User Avatar */}
            <div className="relative h-10 w-10 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div
                className="relative h-full w-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-xl cursor-default"
                title={!isCollapsed ? "" : "Taposh Sarker"}
              >
                TS
              </div>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#030712] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* User Info - Hidden when collapsed */}
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                    Taposh Sarker
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate">
                    {isSuper ? "Super Admin" : "Manager"}
                  </p>
                </div>

                {/* Settings/Logout Dropdown Trigger */}
                <button
                  onClick={() => {
                    // Expanded functionality could go here later, for now keeping logout
                    const confirm = window.confirm(t("signOut") + "?");
                    if (confirm) {
                      localStorage.removeItem("access_token");
                      localStorage.removeItem("refresh_token");
                      window.location.href = "/login";
                    }
                  }}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-all"
                  title={t("signOut")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-[#030712] border-r border-white/5 text-white w-72"
      >
        {/* Close button */}
        <div className="absolute right-3 top-3 z-10">
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <Sidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
