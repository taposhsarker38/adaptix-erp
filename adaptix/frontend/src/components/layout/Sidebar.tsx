"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Ticket, // Add Ticket icon
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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { getPermissions, isSuperUser } from "@/lib/auth";

interface SidebarRoute {
  label: string;
  icon: any;
  href?: string;
  permission?: string | null;
  children?: {
    label: string;
    href: string;
    permission?: string;
  }[];
}

const routes: SidebarRoute[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: null,
  },
  {
    label: "Operations",
    icon: ShoppingBag,
    children: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        permission: "view_customer",
      },
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        permission: "view_inventory",
      },
      {
        label: "Point of Sale",
        href: "/dashboard/pos",
        permission: "view_pos",
      },
      {
        label: "Products",
        href: "/dashboard/products",
        permission: "view_product",
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        permission: "view_product",
      },
      {
        label: "Brands",
        href: "/dashboard/brands",
        permission: "view_product",
      },
      { label: "Units", href: "/dashboard/units", permission: "view_product" },
      {
        label: "Purchase & Analytics",
        href: "/dashboard/purchase",
        permission: "view_purchase",
      },
      {
        label: "Accounting",
        href: "/dashboard/accounting",
        permission: "view_accounting",
      },
      {
        label: "Logistics",
        href: "/dashboard/logistics",
        permission: "view_logistics",
      },
      { label: "Assets", href: "/dashboard/assets", permission: "view_asset" },
    ],
  },
  {
    label: "Human Resources",
    icon: Users,
    children: [
      { label: "HR Portal", href: "/dashboard/hr", permission: "view_hr" },
      { label: "Leaves", href: "/dashboard/hr/leaves", permission: "view_hr" },
      {
        label: "Projects",
        href: "/dashboard/projects",
        permission: "view_project",
      },
    ],
  },
  {
    label: "Production & Quality",
    icon: Factory,
    children: [
      {
        label: "Manufacturing",
        href: "/dashboard/manufacturing",
        permission: "view_manufacturing",
      },
      {
        label: "Shop Floor",
        href: "/dashboard/manufacturing/shop-floor",
        permission: "view_manufacturing",
      },
      {
        label: "Quality Control",
        href: "/dashboard/quality",
        permission: "view_quality",
      },
    ],
  },
  {
    label: "Intelligence Hub",
    icon: Brain,
    children: [
      {
        label: "Business AI",
        href: "/dashboard/intelligence",
        permission: "view_forecast",
      },
      {
        label: "Vision Hub",
        href: "/dashboard/intelligence/vision-hub",
        permission: "view_forecast",
      },
      {
        label: "General Analytics",
        href: "/dashboard/analytics",
        permission: "view_analytics",
      },
    ],
  },
];

const adminRouteGroup: SidebarRoute = {
  label: "Administration",
  icon: Shield,
  children: [
    { label: "Users", href: "/dashboard/admin/users", permission: "view_user" },
    {
      label: "Organization Hub",
      href: "/dashboard/organization",
      permission: "view_settings",
    },
    { label: "Roles", href: "/dashboard/admin/roles", permission: "view_role" },
    {
      label: "Permissions",
      href: "/dashboard/admin/permissions",
      permission: "view_permission",
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit",
      permission: "view_audit_log",
    },
    {
      label: "Security Center",
      href: "/dashboard/security",
      permission: "view_audit_log",
    },
    {
      label: "System Ops",
      href: "/dashboard/ops",
      permission: "view_settings",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      permission: "view_settings",
    },
  ],
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuper, setIsSuper] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const perms = getPermissions();
    setPermissions(perms);
    setIsSuper(isSuperUser());
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

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

      if (visibleChildren.length === 0 && !route.href) return null;
      return { ...route, children: visibleChildren };
    }

    return route;
  };

  const visibleRoutes = routes
    .map(filterRoute)
    .filter(Boolean) as SidebarRoute[];
  const visibleAdminRoute = filterRoute(adminRouteGroup);

  const renderRoute = (route: SidebarRoute) => {
    const isExpanded = openGroups.includes(route.label);
    const hasChildren = route.children && route.children.length > 0;
    const isActive = route.href
      ? pathname === route.href
      : route.children?.some((c) => pathname === c.href);

    return (
      <div key={route.label} className="w-full">
        {route.href ? (
          <Link
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === route.href
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <route.icon className="h-5 w-5" />
            <span>{route.label}</span>
          </Link>
        ) : (
          <button
            onClick={() => toggleGroup(route.label)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-9 mt-1 space-y-1 border-l border-slate-800 pl-4">
            {route.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block py-2 text-sm transition-colors",
                  pathname === child.href
                    ? "text-violet-400 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0f172a] text-white border-r border-slate-800/50",
        className
      )}
    >
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors">
              Adaptix
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Enterprise Suite
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        <div className="space-y-1">{visibleRoutes.map(renderRoute)}</div>

        {visibleAdminRoute && (
          <div className="pt-4 border-t border-slate-800/50">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              System Management
            </p>
            {renderRoute(visibleAdminRoute)}
          </div>
        )}
      </div>

      {/* User Quick Actions / Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <button
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all w-full group"
        >
          <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-slate-900 border-r-slate-800 text-white w-64"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
