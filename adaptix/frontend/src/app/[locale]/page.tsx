"use client";

import { useEffect, useState, useRef } from "react";
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
  Zap,
  Shield,
  Globe,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  TrendingUp,
  Clock,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-emerald-500/30">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            top: `${-20 + mousePosition.y * 10}%`,
            left: `${-10 + mousePosition.x * 10}%`,
            transition: "top 0.3s ease-out, left 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            top: `${40 + mousePosition.y * 5}%`,
            right: `${-10 + mousePosition.x * 5}%`,
            transition: "top 0.4s ease-out, right 0.4s ease-out",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            bottom: "10%",
            left: "30%",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Header */}
      <header
        className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50
            ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-lg sm:text-xl">
                A
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
              Adaptix
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-emerald-400/80 font-bold">
              Intelligent Business OS
            </span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {[
            { name: "Features", href: "#features" },
            { name: "Enterprise", href: "#enterprise" },
            { name: "Pricing", href: "#pricing" },
            { name: "Customers", href: "#customers" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => router.push("/login")}
            variant="ghost"
            className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/10"
          >
            Sign In
          </Button>
          {isAuthenticated ? (
            <Button
              onClick={() => router.push("/dashboard")}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 text-xs sm:text-sm"
            >
              <LayoutDashboard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Dashboard</span>
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 text-xs sm:text-sm"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start Free Trial</span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main ref={heroRef} className="relative">
        <section className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 relative">
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-8 z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-sm font-medium">
                AI-Powered ERP • v2.0 Now Live
              </span>
              <ChevronRight className="h-4 w-4 text-emerald-400" />
            </div>

            {/* Main Headline */}
            <div
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] sm:leading-[0.9]">
                <span className="text-white">One Platform.</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Infinite Possibilities.
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up px-2"
              style={{ animationDelay: "0.2s" }}
            >
              Transform your business with AI-driven intelligence. Adaptix
              unifies
              <span className="text-white">
                {" "}
                POS, Inventory, HRMS, Accounting,{" "}
              </span>
              and <span className="text-white">Manufacturing</span> into a
              single, powerful ecosystem.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 animate-slide-up w-full px-4 sm:px-0"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                onClick={() =>
                  router.push(isAuthenticated ? "/dashboard" : "/login")
                }
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
              >
                {isAuthenticated ? "Enter Workspace" : "Start Free Trial"}
                <MoveRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm group"
              >
                <Play className="mr-2 h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                <span className="text-xs sm:text-sm">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                <span className="text-xs sm:text-sm">Multi-Currency</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="text-xs sm:text-sm">Real-time Sync</span>
              </div>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div
              className="mt-8 sm:mt-12 md:mt-16 relative animate-slide-up mx-2 sm:mx-0"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-50" />
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-gradient-to-b from-slate-900 to-slate-950">
                {/* Browser Header */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900/80 border-b border-white/5">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-2 sm:px-4 py-0.5 sm:py-1 rounded-md bg-slate-800/50 text-[10px] sm:text-xs text-slate-500">
                      dashboard.adaptix.io
                    </div>
                  </div>
                </div>
                {/* Dashboard Preview Content */}
                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {[
                      {
                        label: "Total Revenue",
                        value: "$2.4M",
                        change: "+12.5%",
                        color: "emerald",
                      },
                      {
                        label: "Active Orders",
                        value: "1,234",
                        change: "+8.2%",
                        color: "blue",
                      },
                      {
                        label: "Products Sold",
                        value: "45.2K",
                        change: "+23.1%",
                        color: "purple",
                      },
                      {
                        label: "Team Members",
                        value: "89",
                        change: "+5",
                        color: "orange",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 space-y-1 sm:space-y-2"
                      >
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                          {stat.label}
                        </p>
                        <p className="text-base sm:text-xl md:text-2xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs font-medium text-${stat.color}-400`}
                        >
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Chart Placeholder */}
                  <div className="h-24 sm:h-32 md:h-48 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center">
                    <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 h-16 sm:h-24 md:h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-2 sm:w-3 md:w-4 rounded-t bg-gradient-to-t from-emerald-500 to-teal-400 opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Companies Section */}
        <section className="py-12 sm:py-16 md:py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 md:mb-10 uppercase tracking-widest">
              Trusted by Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 md:gap-x-16 gap-y-4 sm:gap-y-6 md:gap-y-8 opacity-50">
              {[
                "Enterprise Co.",
                "TechVenture",
                "NextGen Inc.",
                "InnovateCo",
                "GlobalTrade",
                "FutureTech",
              ].map((company, i) => (
                <div
                  key={i}
                  className="text-base sm:text-xl md:text-2xl font-bold text-slate-600 hover:text-slate-400 transition-colors cursor-default"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 sm:py-20 md:py-24 px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Transform Your Business
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Everything You Need,{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  All in One
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-2">
                Streamline operations with our comprehensive suite of AI-powered
                business tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Store,
                  title: "Smart Point of Sale",
                  description:
                    "AI-powered checkout with visual product detection, barcode scanning, and instant inventory sync.",
                  gradient: "from-purple-500 to-pink-500",
                  features: [
                    "Visual AI Detection",
                    "Multi-Location",
                    "Offline Mode",
                  ],
                },
                {
                  icon: Truck,
                  title: "Supply Chain Intelligence",
                  description:
                    "Predictive inventory management with automated procurement and real-time tracking.",
                  gradient: "from-blue-500 to-cyan-500",
                  features: [
                    "Demand Forecasting",
                    "Auto-Reorder",
                    "IoT Integration",
                  ],
                },
                {
                  icon: Users,
                  title: "HRMS & Workforce",
                  description:
                    "Complete employee lifecycle management from recruitment to retirement.",
                  gradient: "from-orange-500 to-red-500",
                  features: ["Smart Payroll", "Attendance AI", "Performance"],
                },
                {
                  icon: PieChart,
                  title: "Financial Control",
                  description:
                    "Double-entry accounting with automated reconciliation and real-time reporting.",
                  gradient: "from-emerald-500 to-teal-500",
                  features: ["Multi-Currency", "Tax Automation", "Bank Sync"],
                },
                {
                  icon: Building2,
                  title: "Manufacturing MES",
                  description:
                    "Shop floor control with production planning, quality management, and IoT monitoring.",
                  gradient: "from-yellow-500 to-orange-500",
                  features: [
                    "Work Orders",
                    "Asset Tracking",
                    "Quality Control",
                  ],
                },
                {
                  icon: BrainCircuit,
                  title: "AI Nerve Center",
                  description:
                    "Central intelligence hub that orchestrates all modules with predictive insights.",
                  gradient: "from-violet-500 to-purple-500",
                  features: ["Predictive AI", "Smart Alerts", "Auto-Actions"],
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    }}
                  />
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((f, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-slate-400"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 md:py-24 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {[
                { value: "500+", label: "Enterprises", icon: Building2 },
                { value: "2M+", label: "Transactions/Day", icon: TrendingUp },
                { value: "99.9%", label: "Uptime SLA", icon: Clock },
                { value: "4.9/5", label: "Customer Rating", icon: Star },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 mb-2 sm:mb-4 group-hover:bg-emerald-500/10 transition-colors">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section
          id="customers"
          className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Customer Stories
            </div>
            <div className="relative p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl md:text-6xl text-emerald-500/20">
                "
              </div>
              <blockquote className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed mb-4 sm:mb-6 pt-2">
                Adaptix transformed how we operate. The AI-driven insights
                helped us reduce inventory costs by 40% while improving customer
                satisfaction. It's not just software—it's a business partner.
              </blockquote>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                  MR
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm sm:text-base">
                    Mohammad Rahman
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    CEO, SSL Enterprise
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-16 lg:py-20 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                  Join thousands of enterprises that have elevated their
                  operations with Adaptix. Start your free trial today—no credit
                  card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Button
                    onClick={() => router.push("/login")}
                    size="lg"
                    className="w-full sm:w-auto h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base font-semibold bg-white text-emerald-600 hover:bg-white/90 shadow-2xl"
                  >
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base font-semibold border-white/30 bg-white/10 hover:bg-white/20 text-white"
                  >
                    Schedule a Demo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-white/60">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Free 14-day trial
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    No credit card
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 sm:py-12 md:py-16 px-4 border-t border-white/5 bg-[#030712]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg sm:text-xl">
                    A
                  </span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white">
                    Adaptix
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                The intelligent business operating system that unifies your
                entire enterprise.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Blog", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security", "Compliance"],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href="#"
                        className="text-xs sm:text-sm text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm text-slate-600">
              © 2026 Adaptix Inc. All rights reserved.
            </span>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.6;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
