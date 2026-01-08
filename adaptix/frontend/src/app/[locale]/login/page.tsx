"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { handleApiError } from "@/lib/utils/error-handler";
import { loginSchema, LoginFormValues } from "@/lib/schemas/auth";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedError = sessionStorage.getItem("login_error");
      if (savedError) {
        setErrorMessage(savedError);
        setTimeout(() => {
          sessionStorage.removeItem("login_error");
          setErrorMessage("");
        }, 15000);
      }
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setIsCheckingAuth(true);
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [isMounted, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMessage("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("login_error");
    }

    try {
      toast.dismiss();
      const response = await api.post("/auth/login/", data);
      const payload = response.data.data;

      localStorage.setItem("access_token", payload.access);
      localStorage.setItem("refresh_token", payload.refresh);

      toast.success("Welcome back!", {
        description: "Login successful. Redirecting...",
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);

      const responseData = error.response?.data;
      let errMsg = "Login failed. Please try again.";

      if (responseData) {
        if (responseData.message) {
          errMsg = responseData.message;
        }

        if (responseData.errors) {
          const errors = responseData.errors;

          if (errors.username) {
            errMsg = errors.username;
            setErrorMessage(errMsg);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("login_error", errMsg);
            }
            toast.error("User Not Found", {
              description: errMsg,
              duration: 10000,
            });
            return;
          }

          if (errors.password) {
            errMsg = errors.password;
            setErrorMessage(errMsg);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("login_error", errMsg);
            }
            toast.error("Wrong Password", {
              description: errMsg,
              duration: 10000,
            });
            return;
          }

          if (errors.email_verified) {
            errMsg = errors.email_verified;
            setErrorMessage(errMsg);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("login_error", errMsg);
            }
            toast.error("Email Not Verified", {
              description: errMsg,
              duration: 10000,
            });
            return;
          }

          if (errors.account) {
            errMsg = errors.account;
            setErrorMessage(errMsg);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("login_error", errMsg);
            }
            toast.error("Account Disabled", {
              description: errMsg,
              duration: 10000,
            });
            return;
          }

          if (errors.fields) {
            handleApiError(error, form, errMsg);
            return;
          }
        }
      } else if (error.code === "ERR_NETWORK") {
        errMsg = "Cannot connect to server. Please check your connection.";
        toast.error("Network Error", {
          description: errMsg,
          duration: 10000,
        });
      }

      setErrorMessage(errMsg);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("login_error", errMsg);
      }

      toast.error("Login Failed", {
        description: errMsg,
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <Loader fullScreen text="Verifying session..." />;
  }

  return (
    <div className="min-h-screen flex bg-[#030712] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
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
        {/* Gradient Orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            top: `${-20 + mousePosition.y * 10}%`,
            left: `${-20 + mousePosition.x * 10}%`,
            transition: "top 0.5s ease-out, left 0.5s ease-out",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            bottom: `${-20 + mousePosition.y * 5}%`,
            right: `${-20 + mousePosition.x * 5}%`,
            transition: "bottom 0.6s ease-out, right 0.6s ease-out",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-2xl">A</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-white leading-none">
              Adaptix
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-bold">
              Intelligent Business OS
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Welcome to the
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Future of Business
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              One unified platform for POS, Inventory, HRMS, Accounting, and
              Manufacturing. Powered by AI intelligence.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Shield, text: "Enterprise Security" },
              { icon: Zap, text: "Real-time Sync" },
              { icon: Globe, text: "Multi-Currency" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                <feature.icon className="h-4 w-4 text-emerald-400" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-40" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-black text-3xl">A</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Adaptix</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 font-bold">
                Intelligent Business OS
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-50" />
            <div className="relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Secure Login
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                  Sign in to your account
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Enter your credentials to access your workspace
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit(onSubmit)(e);
                  }}
                  className="space-y-5"
                >
                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Username
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            <Input
                              placeholder="Enter your username"
                              disabled={loading}
                              className="h-12 pl-12 pr-4 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              disabled={loading}
                              className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all rounded-xl"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Forgot Password Link */}
                  <div className="flex items-center justify-end">
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 font-normal text-emerald-400 hover:text-emerald-300"
                      onClick={() => router.push("/forgot-password")}
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
                      <p className="font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl"
                  >
                    {loading ? (
                      <Loader
                        size="sm"
                        variant="white"
                        text="Signing in..."
                        className="flex-row"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-slate-500">
                  Protected by{" "}
                  <span className="text-emerald-400">Adaptix Security</span>
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
