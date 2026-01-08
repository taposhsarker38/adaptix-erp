"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import {
  MoveRight,
  LayoutDashboard,
  LogIn,
  BrainCircuit,
  PieChart,
  Truck,
  Users,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // eslint-disable-next-line
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Adaptix
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Business OS
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {["Intelligence", "Finance", "Operations", "People"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-20 z-10 text-center space-y-8 max-w-6xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            System Online • v1.1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            The Intelligent OS for <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Modern Business.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Adaptix unifies your enterprise with an AI Core that connects POS,
            Inventory, HRMS, and Accounting in real-time. Stop managing tools.
            Start managing intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/login")
              }
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg h-12 px-8 text-base"
            >
              {isAuthenticated ? "Enter Workspace" : "Get Started"}
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base"
            >
              View Documentation
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-20 relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/20 border border-white/10 animate-in fade-in zoom-in-95 duration-1000 delay-500 group">
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60"></div>
            <Image
              src="/images/hero-banner.png"
              alt="Adaptix Ecosystem"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Overlay Labels */}
            <div className="absolute bottom-10 left-10 z-20 text-left">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="text-emerald-400 h-6 w-6" />
                <h3 className="text-xl font-bold text-white">Nerve Center</h3>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                AI-driven orchestration of all business modules.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-20 text-left">
            <FeatureCard
              icon={<Store className="h-6 w-6 text-purple-400" />}
              title="Smart POS"
              description="AI-powered checkout with visual product detection."
            />
            <FeatureCard
              icon={<Truck className="h-6 w-6 text-blue-400" />}
              title="Supply Chain"
              description="Predictive inventory and automated procurement."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-pink-400" />}
              title="HRMS & People"
              description="Complete payroll, attendance, and team management."
            />
            <FeatureCard
              icon={<PieChart className="h-6 w-6 text-emerald-400" />}
              title="Real Finance"
              description="Double-entry accounting synced with every action."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Adaptix Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-emerald-400 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300 group">
      <div className="mb-4 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
